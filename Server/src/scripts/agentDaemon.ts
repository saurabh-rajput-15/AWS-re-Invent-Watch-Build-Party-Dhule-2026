import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_DIR = path.resolve(__dirname, '../../data/agent-chrome-profile');
const EVENT_URL = 'https://builder.aws.com/connect/event/c8a38d77-8262-34c4-b744-ea8dfb7b35a6';
const EVENT_ID = 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6';

interface RosterItem {
  builderId: string;
  displayName?: string;
  rosterType: 'attendee' | 'request' | 'invited';
  source: string;
}

export async function runRosterSync(headless = false): Promise<{ count: number; items: RosterItem[] }> {
  console.log(`\n======================================================`);
  console.log(`🤖 AWS Builder Center Automated Agent Sync (${headless ? 'Headless' : 'Interactive'})`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      channel: 'chrome',
      headless,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
      viewport: null,
    });
  } catch {
    console.log('Falling back to default Chromium...');
    context = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless,
      args: ['--start-maximized'],
      viewport: null,
    });
  }

  const page = context.pages()[0] || (await context.newPage());
  const discovered = new Map<string, RosterItem>();

  const record = (alias: string, name?: string, type: 'attendee' | 'request' | 'invited' = 'attendee', src = 'unknown') => {
    const clean = alias.trim().toLowerCase().replace(/^@/, '');
    if (!clean || clean.length < 2 || clean === 'batch_sync') return;
    if (!discovered.has(clean) || type === 'attendee') {
      discovered.set(clean, {
        builderId: clean,
        displayName: name || clean,
        rosterType: type,
        source: src,
      });
      console.log(`✅ [${type.toUpperCase()}] @${clean} (${name || clean}) via ${src}`);
    }
  };

  // Intercept all API responses from AWS
  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (!url.includes('builder.aws.com')) return;
      const contentType = res.headers()['content-type'] || '';
      if (!contentType.includes('json')) return;

      const data = await res.json();

      // Check event metadata
      if (data?.eventInfoWithMetadata) {
        const info = data.eventInfoWithMetadata;
        if (info.organizerAlias) record(info.organizerAlias, info.organizerAlias, 'attendee', 'eventInfo.organizer');
        if (Array.isArray(info.coHosts)) {
          for (const ch of info.coHosts) {
            const a = ch.userAlias || ch.alias;
            if (a) record(a, ch.displayName || a, 'attendee', 'eventInfo.coHost');
          }
        }
      }

      // Check lists (attendees, requests, invites, etc.)
      const lists = [
        data?.attendees,
        data?.participants,
        data?.requests,
        data?.invites,
        data?.roster,
        data?.items,
        data?.users,
      ].filter(Array.isArray);

      for (const list of lists) {
        for (const item of list) {
          const alias = item.userAlias || item.builderId || item.alias || item.username;
          if (alias && typeof alias === 'string' && !alias.includes('-') && alias.length < 40) {
            const isRequest = url.includes('request') || item.status === 'REQUESTED' || item.status === 'PENDING';
            const isInvite = url.includes('invite') || item.status === 'INVITED';
            record(
              alias,
              item.displayName || item.name || alias,
              isRequest ? 'request' : isInvite ? 'invited' : 'attendee',
              `api:${url.slice(0, 45)}`
            );
          }
        }
      }
    } catch {}
  });

  console.log(`Navigating to: ${EVENT_URL}...`);
  try {
    await page.goto(EVENT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e: any) {
    console.log('Initial navigation note:', e.message);
  }

  if (!headless) {
    console.log('\n👉 If not signed in, please sign in on the opened Chrome window.');
    console.log('👉 The agent will automatically detect when you reach the event page!\n');
  }

  // Wait for page to be logged in and on the event page
  const maxWait = headless ? 30000 : 180000;
  const start = Date.now();
  let ready = false;

  while (Date.now() - start < maxWait) {
    const text = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
    if (text.includes('Attendees') || text.includes('Invites and requests')) {
      ready = true;
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!ready) {
    console.warn('⚠️ Could not find Attendees tab. User may not be logged in.');
    await context.close().catch(() => {});
    return { count: 0, items: [] };
  }

  console.log('🎯 Event page active! Scraping tabs...');

  // 1. Click "Attendees" Tab
  try {
    const attendeesTab = page.locator('button, a, div[role="tab"]').filter({ hasText: /^Attendees/i });
    if ((await attendeesTab.count()) > 0) {
      console.log('👉 Opening "Attendees" tab...');
      await attendeesTab.first().click().catch(() => {});
      await page.waitForTimeout(3000);

      // Extract all profile links from DOM
      const links = await page.locator('a[href*="/@"], a[href*="/profile/"]').all();
      for (const link of links) {
        const href = (await link.getAttribute('href')) || '';
        const match = href.match(/@([a-zA-Z0-9._-]+)/) || href.match(/\/profile\/([a-zA-Z0-9._-]+)/);
        if (match && match[1]) {
          const text = (await link.innerText()).trim();
          record(match[1], text || match[1], 'attendee', 'dom:attendees_tab');
        }
      }

      // Also extract any text lines in the attendees container
      const rowTexts = await page.evaluate(() => {
        const results: string[] = [];
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, span, div');
        headings.forEach((el) => {
          const t = el.textContent?.trim() || '';
          if (t.startsWith('@') && t.length > 2 && t.length < 30) {
            results.push(t);
          }
        });
        return results;
      });

      for (const t of rowTexts) {
        record(t, t, 'attendee', 'dom:text');
      }
    }
  } catch (err: any) {
    console.warn('Attendees tab error:', err.message);
  }

  // 2. Click "Invites and requests" Tab
  try {
    const requestsTab = page.locator('button, a, div[role="tab"]').filter({ hasText: /Invites and requests/i });
    if ((await requestsTab.count()) > 0) {
      console.log('👉 Opening "Invites and requests" tab...');
      await requestsTab.first().click().catch(() => {});
      await page.waitForTimeout(3000);

      const links = await page.locator('a[href*="/@"], a[href*="/profile/"]').all();
      for (const link of links) {
        const href = (await link.getAttribute('href')) || '';
        const match = href.match(/@([a-zA-Z0-9._-]+)/) || href.match(/\/profile\/([a-zA-Z0-9._-]+)/);
        if (match && match[1]) {
          const text = (await link.innerText()).trim();
          record(match[1], text || match[1], 'request', 'dom:invites_requests_tab');
        }
      }
    }
  } catch (err: any) {
    console.warn('Invites & requests tab error:', err.message);
  }

  // Upsert all discovered to Supabase
  const items = Array.from(discovered.values());
  if (supabase && items.length > 0) {
    console.log(`\n📤 Saving ${items.length} records into Supabase...`);
    for (const item of items) {
      try {
        await supabase.from('builder_center_attendees').upsert(
          {
            event_id: EVENT_ID,
            builder_id: item.builderId,
            display_name: item.displayName || item.builderId,
            roster_type: item.rosterType,
            synced_at: new Date().toISOString(),
            raw_metadata: { source: item.source },
          },
          { onConflict: 'event_id,builder_id' }
        );

        // Update matching registration
        await supabase
          .from('registrations')
          .update({
            builder_center_verified: true,
            builder_center_status: 'registered_on_builder_center',
            builder_center_verified_at: new Date().toISOString(),
          })
          .ilike('builder_id', item.builderId);
      } catch (e: any) {
        console.warn(`Supabase upsert error for ${item.builderId}:`, e.message);
      }
    }
    console.log('✅ Supabase update completed successfully!');
  }

  await context.close().catch(() => {});

  console.log('\n======================================================');
  console.log(`🎉 Sync finished! Found ${items.length} total attendees & requests.`);
  console.log(`======================================================\n`);

  return { count: items.length, items };
}

// CLI entrypoint
if (process.argv[1] && process.argv[1].endsWith('agentDaemon.ts')) {
  const headless = process.argv.includes('--headless');
  runRosterSync(headless).catch(console.error);
}
