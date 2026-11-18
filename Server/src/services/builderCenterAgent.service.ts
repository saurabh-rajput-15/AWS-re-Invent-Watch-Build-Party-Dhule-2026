import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { sendSessionAlertEmail, resetSessionAlertCooldown } from './email.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SESSION_FILE = path.join(DATA_DIR, 'active-session.json');
const ENV_FILE = path.resolve(__dirname, '../../.env');

const EVENT_ID = 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6';
const SYSTEM_SESSION_KEY = '__agent_session__';

export interface BuilderCenterAttendeeRecord {
  id?: string;
  eventId: string;
  builderId: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  rosterType: 'request' | 'attendee' | 'invited' | 'host' | 'co-host';
  registeredAt?: number;
  syncedAt?: number;
  rawMetadata?: any;
}

export interface CheckRegistrationResult {
  isRegistered: boolean;
  rosterType?: 'request' | 'attendee' | 'invited' | 'host' | 'co-host';
  registeredAt?: number;
  displayName?: string;
  source: 'database' | 'live_aws' | 'session_cache' | 'lazy_on_demand' | 'none';
}

class BuilderCenterAgentService {
  private inMemoryAttendees: Map<string, BuilderCenterAttendeeRecord> = new Map();
  private eventId = EVENT_ID;
  private activeCookie = '';
  private activeCsrf = '';
  private lastRefreshTime = 0;
  private lastSyncTimestamp = 0;
  private isSyncInProgress = false;
  private isRefreshingSession = false;
  private periodicTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.init().catch((err) => {
      console.warn('⚠️ [Agent Service] Init warning:', err.message);
    });
  }

  private async init(): Promise<void> {
    await this.loadCacheFromDatabase();
    await this.loadSession();
  }

  public getLastSyncTime(): number {
    return this.lastSyncTimestamp;
  }

  public getLastSyncFormatted(): string {
    return this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : 'Never';
  }

  public isSyncing(): boolean {
    return this.isSyncInProgress;
  }

  /**
   * Helper to perform HTTP requests with automatic retry on network drops
   */
  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fetch(url, options);
      } catch (err: any) {
        if (i === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  }

  /**
   * Loads verified attendees from Supabase into ultra-fast in-memory cache (<1ms lookup)
   */
  public async loadCacheFromDatabase(): Promise<void> {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('builder_center_attendees')
        .select('*')
        .eq('event_id', this.eventId)
        .neq('builder_id', SYSTEM_SESSION_KEY);

      if (!error && Array.isArray(data)) {
        for (const item of data) {
          const clean = (item.builder_id || '').trim().toLowerCase();
          if (clean && clean !== SYSTEM_SESSION_KEY) {
            this.inMemoryAttendees.set(clean, {
              eventId: this.eventId,
              builderId: clean,
              displayName: item.display_name || clean,
              email: item.email || undefined,
              avatarUrl: item.avatar_url || undefined,
              rosterType: item.roster_type || 'attendee',
              registeredAt: item.registered_at ? new Date(item.registered_at).getTime() : Date.now(),
              syncedAt: item.synced_at ? new Date(item.synced_at).getTime() : Date.now(),
            });
          }
        }
        console.log(`🤖 [Agent Service] Loaded ${this.inMemoryAttendees.size} verified builders from Supabase into memory.`);
      }
    } catch (err: any) {
      console.warn('⚠️ [Agent Service] Could not load database cache:', err.message);
    }
  }

  /**
   * Loads active AWS session credentials with priority:
   * 1. Supabase cloud store (dedicated agent_sessions table) - PRIMARY / LIVE SOURCE OF TRUTH
   * 2. Environment variables (.env / hosting dashboard) - BOOTSTRAP / OVERRIDE FALLBACK
   * 3. Local active-session.json file cache
   */
  public async loadSession(): Promise<boolean> {
    // 1. Primary: Supabase cloud store (dedicated agent_sessions table - persists live auto-refreshed session)
    if (supabase) {
      try {
        const { data } = await supabase
          .from('agent_sessions')
          .select('*')
          .eq('session_id', 'aws_builder_session')
          .maybeSingle();

        if (data?.cookie && data?.csrf_token) {
          this.activeCookie = data.cookie;
          this.activeCsrf = data.csrf_token;
          if (data.last_refreshed_at) {
            this.lastRefreshTime = new Date(data.last_refreshed_at).getTime();
          }
          console.log('📦 [Agent Session] Loaded active AWS session credentials from Supabase agent_sessions table.');
          return true;
        }

        // Backward compatibility fallback to legacy store if agent_sessions not migrated yet
        const { data: legacyData } = await supabase
          .from('builder_center_attendees')
          .select('raw_metadata')
          .eq('event_id', this.eventId)
          .eq('builder_id', SYSTEM_SESSION_KEY)
          .maybeSingle();

        if (legacyData?.raw_metadata?.cookie && legacyData?.raw_metadata?.csrfToken) {
          this.activeCookie = legacyData.raw_metadata.cookie;
          this.activeCsrf = legacyData.raw_metadata.csrfToken;
          if (legacyData.raw_metadata.lastRefreshed) {
            this.lastRefreshTime = new Date(legacyData.raw_metadata.lastRefreshed).getTime();
          }
          console.log('📦 [Agent Session] Loaded active AWS session credentials from legacy store.');
          return true;
        }
      } catch (err: any) {
        console.warn('⚠️ [Agent Session] Cloud session fetch warning:', err.message);
      }
    }

    // 2. Secondary: Environment variables (.env / hosting dashboard bootstrap seed)
    const envCookie = (process.env.AWS_BUILDER_SESSION_COOKIE || '').trim().replace(/^["']|["']$/g, '');
    const envCsrf = (process.env.AWS_BUILDER_CSRF_TOKEN || '').trim().replace(/^["']|["']$/g, '');

    if (envCookie) {
      this.activeCookie = envCookie;
      this.activeCsrf = envCsrf;
      console.log('🔑 [Agent Session] Bootstrapped AWS session credentials from environment variables (.env).');
      // Automatically seed into Supabase agent_sessions so future restarts read from the database
      this.persistSession(envCookie, envCsrf).catch(() => {});
      return true;
    }

    // 3. Fallback: Local file cache
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const raw = fs.readFileSync(SESSION_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.cookie && parsed.csrfToken) {
          this.activeCookie = parsed.cookie;
          this.activeCsrf = parsed.csrfToken;
          if (parsed.lastRefreshed) {
            this.lastRefreshTime = new Date(parsed.lastRefreshed).getTime();
          }
          console.log('📦 [Agent Session] Loaded active AWS session from local file cache.');
          return true;
        }
      }
    } catch {}

    return false;
  }

  /**
   * Persists refreshed session credentials to Supabase, local file, and .env
   */
  private async persistSession(cookie: string, csrfToken: string): Promise<void> {
    this.activeCookie = cookie;
    this.activeCsrf = csrfToken;
    this.lastRefreshTime = Date.now();

    // 1. Cloud persistence: Supabase dedicated agent_sessions table
    if (supabase) {
      try {
        const { error: sessionError } = await supabase.from('agent_sessions').upsert(
          {
            session_id: 'aws_builder_session',
            event_id: this.eventId,
            cookie,
            csrf_token: csrfToken,
            last_refreshed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'session_id' }
        );

        if (!sessionError) {
          console.log('💾 [Agent Session] Persisted fresh session to Supabase cloud store (agent_sessions).');
        } else {
          console.warn('⚠️ [Agent Session] agent_sessions upsert notice (run supabase-schema-restructure.sql if not created):', sessionError.message);
        }
      } catch (err: any) {
        console.warn('⚠️ [Agent Session] Supabase session persist warning:', err.message);
      }
    }

    // 2. File persistence: active-session.json
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        SESSION_FILE,
        JSON.stringify(
          {
            cookie,
            csrfToken,
            lastRefreshed: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf8'
      );
    } catch {}

    // 3. Local environment update: .env
    try {
      if (fs.existsSync(ENV_FILE)) {
        let content = fs.readFileSync(ENV_FILE, 'utf8');
        if (content.includes('AWS_BUILDER_SESSION_COOKIE=')) {
          content = content.replace(/AWS_BUILDER_SESSION_COOKIE="[^"]*"/, `AWS_BUILDER_SESSION_COOKIE="${cookie}"`);
        }
        if (content.includes('AWS_BUILDER_CSRF_TOKEN=')) {
          content = content.replace(/AWS_BUILDER_CSRF_TOKEN="[^"]*"/, `AWS_BUILDER_CSRF_TOKEN="${csrfToken}"`);
        }
        fs.writeFileSync(ENV_FILE, content, 'utf8');
      }
    } catch {}
  }

  /**
   * Autonomous Token Refresher:
   * Calls AWS Builder Center /ams/refreshToken to exchange existing session cookie
   * for a brand-new 30-day builder-session-token and fresh CSRF token.
   * Completely programmatic: zero human interaction required.
   */
  public async refreshAwsSession(force = false): Promise<boolean> {
    if (this.isRefreshingSession) {
      return false;
    }

    // Avoid aggressive refresh if refreshed recently (unless forced)
    if (!force && this.lastRefreshTime && Date.now() - this.lastRefreshTime < 15 * 60 * 1000) {
      return true;
    }

    if (!this.activeCookie) {
      await this.loadSession();
      if (!this.activeCookie) {
        console.warn('⚠️ [Agent Session] Cannot refresh: No active cookie available.');
        return false;
      }
    }

    this.isRefreshingSession = true;
    console.log('🔄 [Agent Session] Auto-refreshing AWS session via /ams/refreshToken...');

    const tokenMatch = this.activeCookie.match(/builder-session-token=([^;]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : 'dummy';

    try {
      const res = await this.fetchWithRetry('https://api.builder.aws.com/ams/refreshToken', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'builder-session-token': sessionToken,
          'Cookie': this.activeCookie,
          'x-csrf-token': this.activeCsrf,
          'origin': 'https://builder.aws.com',
          'referer': 'https://builder.aws.com/',
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.warn(`⚠️ [Agent Session] Refresh returned HTTP ${res.status}: ${errBody.slice(0, 100)}`);
        this.isRefreshingSession = false;
        if (res.status === 401 || res.status === 403) {
          sendSessionAlertEmail({
            errorMessage: `Token refresh endpoint /ams/refreshToken returned HTTP ${res.status}: ${errBody.slice(0, 150) || 'Unauthorized'}`,
            actionAttempted: 'Auto-refreshing session via /ams/refreshToken',
            httpStatus: res.status,
          }).catch((e) => console.warn('⚠️ [Session Alert] Send error:', e.message));
        }
        return false;
      }

      const data = (await res.json()) as any;
      const setCookie = res.headers.get('set-cookie') || '';
      const tokenMatch = setCookie.match(/builder-session-token=([^;]+)/);

      let updatedCookie = this.activeCookie;
      if (tokenMatch) {
        updatedCookie = updatedCookie.replace(/builder-session-token=[^;]+/, `builder-session-token=${tokenMatch[1]}`);
      }

      const updatedCsrf = data.csrfToken || this.activeCsrf;

      await this.persistSession(updatedCookie, updatedCsrf);
      console.log('✅ [Agent Session] AWS session auto-refreshed successfully (valid for 30 days).');
      resetSessionAlertCooldown();
      this.isRefreshingSession = false;
      return true;
    } catch (err: any) {
      console.warn('⚠️ [Agent Session] Refresh exception:', err.message);
      this.isRefreshingSession = false;
      return false;
    }
  }

  /**
   * Starts periodic background direct-API scan every N minutes (default 5 min)
   */
  public startPeriodicScan(intervalMs = 5 * 60 * 1000): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
    }

    console.log(`⏱️ [Agent Service] Autonomous scanner active: syncing every ${Math.round(intervalMs / 60000)} minutes.`);

    this.periodicTimer = setInterval(() => {
      this.syncRosterFromBuilderCenter('periodic_interval').catch((err) => {
        console.warn('⚠️ Periodic sync warning:', err.message);
      });
    }, intervalMs);

    // Initial sync 3s after startup
    setTimeout(() => {
      this.syncRosterFromBuilderCenter('startup_sync').catch(() => {});
    }, 3000);
  }

  /**
   * Dual-Strategy Verification:
   * Strategy 1: "Fetch All & Save to DB (Sync & Cache)" - Checks local in-memory cache & Supabase (<1ms - 10ms)
   * Strategy 2: "Fetch Only Requested (Lazy / On-Demand)" - If cache misses or force=true, targets AWS live with early exit
   */
  public async checkEventRegistration(rawAlias: string, force = false): Promise<CheckRegistrationResult> {
    const alias = rawAlias.trim().toLowerCase().replace(/^@/, '');
    if (!alias || alias === SYSTEM_SESSION_KEY) {
      return { isRegistered: false, source: 'none' };
    }

    const startTime = Date.now();

    // 1. Strategy 1 (Sync & Cache): In-memory lookup (instant 0ms)
    if (!force && this.inMemoryAttendees.has(alias)) {
      const item = this.inMemoryAttendees.get(alias)!;
      this.logSync('live_alias_check', alias, true, Date.now() - startTime);
      return {
        isRegistered: true,
        rosterType: item.rosterType,
        registeredAt: item.registeredAt,
        displayName: item.displayName,
        source: 'session_cache',
      };
    }

    // 2. Strategy 1 (Sync & Cache): Database lookup (<10ms)
    if (!force && supabase) {
      try {
        const { data, error } = await supabase
          .from('builder_center_attendees')
          .select('*')
          .eq('event_id', this.eventId)
          .ilike('builder_id', alias)
          .neq('builder_id', SYSTEM_SESSION_KEY)
          .maybeSingle();

        if (!error && data) {
          const result: CheckRegistrationResult = {
            isRegistered: true,
            rosterType: (data.roster_type as any) || 'attendee',
            registeredAt: data.registered_at ? new Date(data.registered_at).getTime() : undefined,
            displayName: data.display_name || undefined,
            source: 'database',
          };
          this.inMemoryAttendees.set(alias, {
            eventId: this.eventId,
            builderId: alias,
            displayName: data.display_name,
            rosterType: data.roster_type,
          });
          this.logSync('live_alias_check', alias, true, Date.now() - startTime);
          return result;
        }
      } catch (err: any) {
        console.warn('⚠️ [Agent Service] Supabase lookup error:', err.message);
      }
    }

    // 3. Strategy 2 (Lazy / On-Demand): Target AWS Builder Center live specifically for this requested alias!
    console.log(`🔍 [Lazy On-Demand] ${force ? 'Force check' : 'Cache miss'} for @${alias}. Querying AWS live...`);
    const lazyResult = await this.fetchRequestedAliasLive(alias);
    if (lazyResult.isRegistered) {
      this.logSync('live_alias_check', alias, true, Date.now() - startTime);
      return lazyResult;
    }

    this.logSync('live_alias_check', alias, false, Date.now() - startTime);
    return { isRegistered: false, source: 'none' };
  }

  /**
   * Strategy 2: "Fetch Only Requested (Lazy / On-Demand)"
   * Directly queries AWS Builder Center on-demand for a single targeted alias.
   * Short-circuits on first matching page without fetching remaining pages.
   * If found, immediately persists that attendee record into Supabase & in-memory cache.
   */
  public async fetchRequestedAliasLive(rawAlias: string): Promise<CheckRegistrationResult> {
    const alias = rawAlias.trim().toLowerCase().replace(/^@/, '');
    if (!alias || alias === SYSTEM_SESSION_KEY) {
      return { isRegistered: false, source: 'none' };
    }

    if (!this.activeCookie) {
      await this.loadSession();
    }
    if (!this.activeCookie) {
      return { isRegistered: false, source: 'none' };
    }

    const startTime = Date.now();

    // 1. Search Approved Members (pages 1 to N, pageSize=100)
    let nextToken: string | undefined = undefined;
    let page = 0;
    do {
      page++;
      const sep = `https://api.builder.aws.com/sms/entities/${this.eventId}/members?entityType=EVENT`.includes('?') ? '&' : '?';
      let url = `https://api.builder.aws.com/sms/entities/${this.eventId}/members?entityType=EVENT${sep}pageSize=100`;
      if (nextToken) url += `&nextToken=${encodeURIComponent(nextToken)}`;

      let res = await this.fetchWithRetry(url, { headers: this.getHeaders() });
      if (res.status === 401 || res.status === 403) {
        const refreshed = await this.refreshAwsSession(true);
        if (refreshed) {
          res = await this.fetchWithRetry(url, { headers: this.getHeaders() });
        } else {
          sendSessionAlertEmail({
            errorMessage: `Live check for @${alias} returned HTTP ${res.status} and auto-refresh failed.`,
            actionAttempted: `Live member lookup for @${alias}`,
            httpStatus: res.status,
          }).catch((e) => console.warn('⚠️ [Session Alert] Send error:', e.message));
        }
      }

      if (!res.ok) break;

      const data = (await res.json()) as any;
      const members = data?.members || [];
      const match = members.find(
        (m: any) => (m.userAlias || m.userId || '').trim().toLowerCase() === alias
      );

      if (match) {
        const cleanName = match.userAlias || alias;
        console.log(`🎯 [Lazy On-Demand] Found @${alias} as approved MEMBER on page ${page} in ${Date.now() - startTime}ms.`);
        await this.saveAttendee({
          eventId: this.eventId,
          builderId: alias,
          displayName: cleanName,
          rosterType: 'attendee',
        });
        return {
          isRegistered: true,
          rosterType: 'attendee',
          displayName: cleanName,
          registeredAt: match.createdAt ? match.createdAt * 1000 : Date.now(),
          source: 'lazy_on_demand',
        };
      }

      nextToken = data?.nextToken;
    } while (nextToken && page < 20);

    // 2. Search Pending Requests (pages 1 to N, pageSize=100)
    nextToken = undefined;
    page = 0;
    do {
      page++;
      const sep = `https://api.builder.aws.com/sms/membership-requests/entities/${this.eventId}?entityType=EVENT`.includes('?') ? '&' : '?';
      let url = `https://api.builder.aws.com/sms/membership-requests/entities/${this.eventId}?entityType=EVENT${sep}pageSize=100`;
      if (nextToken) url += `&nextToken=${encodeURIComponent(nextToken)}`;

      let res = await this.fetchWithRetry(url, { headers: this.getHeaders() });
      if (res.status === 401 || res.status === 403) {
        const refreshed = await this.refreshAwsSession(true);
        if (refreshed) {
          res = await this.fetchWithRetry(url, { headers: this.getHeaders() });
        } else {
          sendSessionAlertEmail({
            errorMessage: `Live check for @${alias} returned HTTP ${res.status} and auto-refresh failed.`,
            actionAttempted: `Live member lookup for @${alias}`,
            httpStatus: res.status,
          }).catch((e) => console.warn('⚠️ [Session Alert] Send error:', e.message));
        }
      }

      if (!res.ok) break;

      const data = (await res.json()) as any;
      const requests = data?.requests || [];
      const match = requests.find(
        (r: any) => (r.memberUserAlias || r.memberId || '').trim().toLowerCase() === alias
      );

      if (match) {
        const cleanName = match.memberUserAlias || alias;
        console.log(`🎯 [Lazy On-Demand] Found @${alias} as pending REQUEST on page ${page} in ${Date.now() - startTime}ms.`);
        await this.saveAttendee({
          eventId: this.eventId,
          builderId: alias,
          displayName: cleanName,
          rosterType: 'request',
        });
        return {
          isRegistered: true,
          rosterType: 'request',
          displayName: cleanName,
          registeredAt: match.createdAt ? match.createdAt * 1000 : Date.now(),
          source: 'lazy_on_demand',
        };
      }

      nextToken = data?.nextToken;
    } while (nextToken && page < 20);

    console.log(`ℹ️ [Lazy On-Demand] Checked live AWS roster: @${alias} not found (${Date.now() - startTime}ms).`);
    return { isRegistered: false, source: 'none' };
  }

  /**
   * Constructs valid HTTP request headers using the active session credentials.
   * Extracts the actual builder-session-token from activeCookie to prevent 401/403 errors.
   */
  private getHeaders(contentType?: string): Record<string, string> {
    const tokenMatch = this.activeCookie.match(/builder-session-token=([^;]+)/);
    const sessionToken = tokenMatch ? tokenMatch[1] : 'dummy';
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'builder-session-token': sessionToken,
      'Cookie': this.activeCookie,
      'x-csrf-token': this.activeCsrf,
      'origin': 'https://builder.aws.com',
      'referer': 'https://builder.aws.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    };
    if (contentType) {
      headers['content-type'] = contentType;
    }
    return headers;
  }

  /**
   * Fetches all pages for a given endpoint (supports 500+ attendees).
   * Uses AWS Builder Center's maximum allowed pageSize of 100 per request,
   * following nextToken pagination until all records are retrieved.
   */
  private async fetchAllPages(
    endpoint: string,
    listKey: 'members' | 'requests',
    maxPages = 20
  ): Promise<any[]> {
    const allItems: any[] = [];
    let nextToken: string | undefined = undefined;
    let pageCount = 0;

    do {
      pageCount++;
      const sep = endpoint.includes('?') ? '&' : '?';
      let url = `${endpoint}${sep}pageSize=100`;
      if (nextToken) {
        url += `&nextToken=${encodeURIComponent(nextToken)}`;
      }

      let res = await this.fetchWithRetry(url, { headers: this.getHeaders() });

      // Self-heal on session expiration
      if (res.status === 401 || res.status === 403) {
        console.log(`⚠️ [Direct API] Session expired while fetching ${listKey} (page ${pageCount}). Auto-refreshing...`);
        const refreshed = await this.refreshAwsSession(true);
        if (refreshed) {
          res = await this.fetchWithRetry(url, { headers: this.getHeaders() });
        } else {
          sendSessionAlertEmail({
            errorMessage: `Direct API call returned HTTP ${res.status} and auto-refresh failed.`,
            actionAttempted: `Fetching ${listKey} (page ${pageCount})`,
            httpStatus: res.status,
          }).catch((e) => console.warn('⚠️ [Session Alert] Send error:', e.message));
        }
      }

      if (!res.ok) {
        console.warn(`⚠️ [Direct API] ${endpoint} returned HTTP ${res.status}`);
        break;
      }

      const data = (await res.json()) as any;
      const items = data?.[listKey] || [];
      allItems.push(...items);
      nextToken = data?.nextToken;
    } while (nextToken && pageCount < maxPages);

    return allItems;
  }

  /**
   * PURE AUTONOMOUS DIRECT-API SYNC (Zero browser, 200ms execution, runs anywhere):
   * Hits the AWS Builder Center internal APIs discovered via DevTools:
   * 1. Auto-refreshes session if needed or if 401/403 encountered
   * 2. GET /sms/entities/:id/members (Approved Attendees & Hosts) with pageSize=100 + pagination
   * 3. GET /sms/membership-requests/entities/:id (Pending Join Requests) with pageSize=100 + pagination
   */
  public async syncRosterFromBuilderCenter(
    triggerReason = 'manual'
  ): Promise<{ success: boolean; totalSynced: number; message: string }> {
    if (this.isSyncInProgress) {
      return { success: false, totalSynced: 0, message: 'Sync already in progress' };
    }

    if (!this.activeCookie) {
      await this.loadSession();
    }

    if (!this.activeCookie) {
      sendSessionAlertEmail({
        errorMessage: 'No active AWS session cookie available in database, .env, or local cache.',
        actionAttempted: `Roster direct sync (trigger: ${triggerReason})`,
      }).catch((e) => console.warn('⚠️ [Session Alert] Send error:', e.message));

      return {
        success: false,
        totalSynced: 0,
        message: 'No AWS session cookie available. Please configure credentials.',
      };
    }

    this.isSyncInProgress = true;
    const startTime = Date.now();
    console.log(`⚡ [Autonomous Agent] Syncing AWS Builder Center roster (trigger: ${triggerReason})...`);

    const discovered = new Map<string, { builderId: string; displayName: string; rosterType: 'attendee' | 'request' }>();

    try {
      // Concurrently fetch ALL pages for Approved Members and Pending Requests (handles 500+ attendees)
      const [membersList, reqList] = await Promise.all([
        this.fetchAllPages(
          `https://api.builder.aws.com/sms/entities/${this.eventId}/members?entityType=EVENT`,
          'members'
        ),
        this.fetchAllPages(
          `https://api.builder.aws.com/sms/membership-requests/entities/${this.eventId}?entityType=EVENT`,
          'requests'
        ),
      ]);

      for (const m of membersList) {
        const alias = (m.userAlias || m.userId || '').trim().toLowerCase();
        if (alias && alias.length > 1 && alias !== SYSTEM_SESSION_KEY) {
          discovered.set(alias, {
            builderId: alias,
            displayName: alias,
            rosterType: 'attendee',
          });
        }
      }
      console.log(`📥 [Direct API] Retrieved ${membersList.length} approved members across all pages.`);

      for (const r of reqList) {
        const alias = (r.memberUserAlias || r.memberId || '').trim().toLowerCase();
        if (alias && alias.length > 1 && alias !== SYSTEM_SESSION_KEY) {
          if (!discovered.has(alias)) {
            discovered.set(alias, {
              builderId: alias,
              displayName: alias,
              rosterType: 'request',
            });
          }
        }
      }
      console.log(`📥 [Direct API] Retrieved ${reqList.length} pending requests across all pages.`);

      // 3. Batch Save: Update in-memory fast cache and execute single-batch Supabase upsert
      const nowIso = new Date().toISOString();
      const rowsToUpsert: any[] = [];
      const aliasesToVerify: string[] = [];

      for (const item of discovered.values()) {
        const cleanRecord = {
          eventId: this.eventId,
          builderId: item.builderId,
          displayName: item.displayName || item.builderId,
          rosterType: item.rosterType,
          registeredAt: Date.now(),
          syncedAt: Date.now(),
        };

        this.inMemoryAttendees.set(item.builderId, cleanRecord);

        rowsToUpsert.push({
          event_id: this.eventId,
          builder_id: item.builderId,
          display_name: item.displayName || item.builderId,
          email: null,
          avatar_url: null,
          roster_type: item.rosterType,
          registered_at: nowIso,
          synced_at: nowIso,
          raw_metadata: {},
        });

        aliasesToVerify.push(item.builderId);
      }

      const count = rowsToUpsert.length;

      // Execute high-performance batch write in parallel to Supabase
      if (supabase && count > 0) {
        try {
          await Promise.all([
            // Batch upsert all attendee records in 1 network call (instead of N separate sequential calls)
            supabase
              .from('builder_center_attendees')
              .upsert(rowsToUpsert, { onConflict: 'event_id,builder_id' }),

            // Batch update matching registrations in 1 network call
            supabase
              .from('registrations')
              .update({
                builder_center_verified: true,
                builder_center_status: 'registered_on_builder_center',
                builder_center_verified_at: nowIso,
              })
              .in('builder_id', aliasesToVerify),
          ]);
        } catch (err: any) {
          console.warn('⚠️ [Agent Service] Supabase batch upsert error:', err.message);
        }
      }

      this.lastSyncTimestamp = Date.now();
      this.isSyncInProgress = false;

      const duration = Date.now() - startTime;
      if (count > 0) {
        resetSessionAlertCooldown();
        console.log(`✅ [Autonomous Agent] Sync completed in ${duration}ms. ${count} verified builders synced to Supabase.`);
      } else {
        console.log(`ℹ️ [Autonomous Agent] Serving from active database cache (${this.inMemoryAttendees.size} verified builders ready).`);
      }

      return {
        success: count > 0,
        totalSynced: count,
        message: `Autonomous sync verified ${count} builders in ${duration}ms.`,
      };
    } catch (err: any) {
      this.isSyncInProgress = false;
      console.warn('⚠️ [Autonomous Agent] Sync error:', err.message);
      return { success: false, totalSynced: 0, message: err.message };
    }
  }

  /**
   * Approves a builder's pending join request directly on AWS Builder Center.
   * Hits: PUT /sms/entity-membership-requests/{requestId} with { responseStatus: 'APPROVE' }
   */
  public async approveBuilderOnAws(
    rawAlias: string
  ): Promise<{ success: boolean; message: string; actionTaken: 'approved' | 'already_member' | 'not_found' | 'error' }> {
    const alias = rawAlias.trim().toLowerCase().replace(/^@/, '');
    if (!alias || alias === SYSTEM_SESSION_KEY) {
      return { success: false, message: 'Invalid alias', actionTaken: 'error' };
    }

    if (!this.activeCookie) {
      await this.loadSession();
    }

    if (!this.activeCookie) {
      return { success: false, message: 'No active AWS session available', actionTaken: 'error' };
    }

    console.log(`⚡ [Agent Approval] Attempting to approve @${alias} on AWS Builder Center...`);

    try {
      // 1. Fetch ALL current pending requests across all pages to find matching requestId
      const reqList = await this.fetchAllPages(
        `https://api.builder.aws.com/sms/membership-requests/entities/${this.eventId}?entityType=EVENT`,
        'requests'
      );
      const matchingReq = reqList.find(
        (r: any) => (r.memberUserAlias || r.memberId || '').trim().toLowerCase() === alias
      );

      if (matchingReq && matchingReq.requestId) {
        console.log(`🎯 [Agent Approval] Found pending request ${matchingReq.requestId} for @${alias}. Sending APPROVE...`);

        let approveRes = await this.fetchWithRetry(
          `https://api.builder.aws.com/sms/entity-membership-requests/${matchingReq.requestId}`,
          {
            method: 'PUT',
            headers: this.getHeaders('application/json'),
            body: JSON.stringify({ responseStatus: 'APPROVE' }),
          }
        );

        if (approveRes.status === 401 || approveRes.status === 403) {
          const refreshed = await this.refreshAwsSession(true);
          if (refreshed) {
            approveRes = await this.fetchWithRetry(
              `https://api.builder.aws.com/sms/entity-membership-requests/${matchingReq.requestId}`,
              {
                method: 'PUT',
                headers: this.getHeaders('application/json'),
                body: JSON.stringify({ responseStatus: 'APPROVE' }),
              }
            );
          }
        }

        if (approveRes.ok) {
          console.log(`🎉 [Agent Approval] Successfully approved @${alias} on AWS Builder Center!`);
          // Update local attendee record to confirmed attendee
          await this.saveAttendee({
            eventId: this.eventId,
            builderId: alias,
            displayName: alias,
            rosterType: 'attendee',
          });
          return {
            success: true,
            message: `Approved @${alias} on AWS Builder Center`,
            actionTaken: 'approved',
          };
        } else {
          const errText = await approveRes.text().catch(() => '');
          console.warn(`⚠️ [Agent Approval] Approval API returned HTTP ${approveRes.status}: ${errText.slice(0, 100)}`);
          return {
            success: false,
            message: `AWS Builder Center returned HTTP ${approveRes.status}`,
            actionTaken: 'error',
          };
        }
      }

      // 2. If not found in pending requests, check if already an approved member (across all pages)
      const membersList = await this.fetchAllPages(
        `https://api.builder.aws.com/sms/entities/${this.eventId}/members?entityType=EVENT`,
        'members'
      );
      const isMember = membersList.some(
        (m: any) => (m.userAlias || m.userId || '').trim().toLowerCase() === alias
      );

      if (isMember) {
        console.log(`ℹ️ [Agent Approval] @${alias} is already an approved member on AWS Builder Center.`);
        await this.saveAttendee({
          eventId: this.eventId,
          builderId: alias,
          displayName: alias,
          rosterType: 'attendee',
        });
        return {
          success: true,
          message: `@${alias} is already an approved member on AWS Builder Center`,
          actionTaken: 'already_member',
        };
      }

      console.log(`ℹ️ [Agent Approval] No pending request found on Builder Center for @${alias}.`);
      return {
        success: false,
        message: `No pending join request found on AWS Builder Center for @${alias}.`,
        actionTaken: 'not_found',
      };
    } catch (err: any) {
      console.warn(`⚠️ [Agent Approval] Error approving @${alias}:`, err.message);
      return {
        success: false,
        message: err.message,
        actionTaken: 'error',
      };
    }
  }

  /**
   * Upserts an attendee record into Supabase and updates in-memory map
   */
  public async saveAttendee(record: BuilderCenterAttendeeRecord): Promise<void> {
    const cleanAlias = record.builderId.trim().toLowerCase().replace(/^@/, '');
    if (!cleanAlias || cleanAlias === SYSTEM_SESSION_KEY) return;

    const cleanRecord = {
      ...record,
      builderId: cleanAlias,
      eventId: record.eventId || this.eventId,
      rosterType: record.rosterType || 'attendee',
      registeredAt: record.registeredAt || Date.now(),
      syncedAt: Date.now(),
    };

    this.inMemoryAttendees.set(cleanAlias, cleanRecord);

    if (supabase) {
      try {
        await supabase.from('builder_center_attendees').upsert(
          {
            event_id: cleanRecord.eventId,
            builder_id: cleanRecord.builderId,
            display_name: cleanRecord.displayName || cleanAlias,
            email: cleanRecord.email || null,
            avatar_url: cleanRecord.avatarUrl || null,
            roster_type: cleanRecord.rosterType,
            registered_at: new Date(cleanRecord.registeredAt).toISOString(),
            synced_at: new Date(cleanRecord.syncedAt).toISOString(),
            raw_metadata: cleanRecord.rawMetadata || {},
          },
          { onConflict: 'event_id,builder_id' }
        );

        // Also update any matching registration in public.registrations
        await supabase
          .from('registrations')
          .update({
            builder_center_verified: true,
            builder_center_status: 'registered_on_builder_center',
            builder_center_verified_at: new Date().toISOString(),
          })
          .ilike('builder_id', cleanAlias);
      } catch (err: any) {
        console.warn('⚠️ [Agent Service] Supabase upsert error:', err.message);
      }
    }
  }

  /**
   * Bulk syncs attendees (from CSV, agent scrape, or admin paste)
   */
  public async syncBulkAttendees(
    items: Array<{ builderId: string; displayName?: string; email?: string; rosterType?: string }>
  ): Promise<number> {
    let count = 0;
    for (const item of items) {
      if (!item.builderId || item.builderId === SYSTEM_SESSION_KEY) continue;
      await this.saveAttendee({
        eventId: this.eventId,
        builderId: item.builderId,
        displayName: item.displayName,
        email: item.email,
        rosterType: (item.rosterType as any) || 'attendee',
        registeredAt: Date.now(),
      });
      count++;
    }
    return count;
  }

  private async logSync(_triggerType: string, _alias: string, _found: boolean, _durationMs: number) {
    // Disabled: agent_sync_logs table dropped per database restructuring
  }

  public async getStats(): Promise<{ totalVerifiedRsvps: number; isSessionReady: boolean }> {
    let total = this.inMemoryAttendees.size;
    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('builder_center_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', this.eventId)
          .neq('builder_id', SYSTEM_SESSION_KEY);
        if (!error && typeof count === 'number') {
          total = count;
        }
      } catch {}
    }
    return {
      totalVerifiedRsvps: total,
      isSessionReady: Boolean(this.activeCookie),
    };
  }
}

export const builderCenterAgentService = new BuilderCenterAgentService();
