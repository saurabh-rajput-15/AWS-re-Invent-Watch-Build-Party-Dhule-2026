import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const SESSION_FILE = path.join(DATA_DIR, 'agent-session.json');

const EVENT_URL = 'https://builder.aws.com/connect/event/c8a38d77-8262-34c4-b744-ea8dfb7b35a6';
const EVENT_ID = 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6';

interface DiscoveredPerson {
  builderId: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  rosterType: 'attendee' | 'request' | 'invited' | 'host' | 'co-host';
  source: string;
}

async function main() {
  console.log('\n======================================================');
  console.log('🤖 AWS Builder Center Agent Session Setup & Sync');
  console.log('======================================================\n');
  console.log('Opening browser for AWS Builder Center...');
  console.log('👉 Please sign in with your Organizer or Co-Host account.');
  console.log('👉 The agent will automatically detect your login, sync attendees & requests, and save the session.\n');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: ['--start-maximized'],
    });
  } catch {
    console.log('Chrome launch failed, trying Microsoft Edge...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: false,
      args: ['--start-maximized'],
    });
  }

  const context = await browser.newContext({
    viewport: null,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  const discoveredPeople = new Map<string, DiscoveredPerson>();

  const recordPerson = (person: DiscoveredPerson) => {
    const clean = person.builderId.trim().toLowerCase().replace(/^@/, '');
    if (!clean || clean.length < 2) return;
    if (!discoveredPeople.has(clean) || person.rosterType === 'attendee') {
      discoveredPeople.set(clean, { ...person, builderId: clean });
      console.log(`👤 Discovered [${person.rosterType.toUpperCase()}]: @${clean} (${person.displayName || 'No name'})`);
    }
  };

  // 1. Intercept all network responses from AWS to extract attendees & requests
  page.on('response', async (response) => {
    try {
      const url = response.url();
      if (!url.includes('builder.aws.com')) return;

      const contentType = response.headers()['content-type'] || '';
      if (!contentType.includes('json')) return;

      const data = await response.json();

      // Check for event details (co-hosts, organizer)
      if (data?.eventInfoWithMetadata) {
        const info = data.eventInfoWithMetadata;
        if (info.organizerAlias) {
          recordPerson({
            builderId: info.organizerAlias,
            displayName: info.organizerAlias,
            rosterType: 'host',
            source: 'eventInfo.organizerAlias',
          });
        }
        if (Array.isArray(info.coHosts)) {
          for (const ch of info.coHosts) {
            const alias = ch.userAlias || ch.alias || ch.id;
            if (alias) {
              recordPerson({
                builderId: alias,
                displayName: ch.displayName || alias,
                rosterType: 'co-host',
                source: 'eventInfo.coHosts',
              });
            }
          }
        }
      }

      // Check for attendees, participants, requests, invites in any API list
      const candidateLists = [
        data?.attendees,
        data?.participants,
        data?.requests,
        data?.invites,
        data?.roster,
        data?.items,
        data?.users,
        data?.members,
      ].filter(Array.isArray);

      for (const list of candidateLists) {
        for (const item of list) {
          const alias = item.userAlias || item.builderId || item.alias || item.username || item.id;
          if (alias && typeof alias === 'string' && !alias.includes('-') && alias.length < 40) {
            const isRequest = url.includes('request') || item.status === 'REQUESTED' || item.status === 'PENDING';
            const isInvite = url.includes('invite') || item.status === 'INVITED';
            recordPerson({
              builderId: alias,
              displayName: item.displayName || item.name || item.fullName || alias,
              email: item.email,
              avatarUrl: item.avatarUrl || item.avatar,
              rosterType: isRequest ? 'request' : isInvite ? 'invited' : 'attendee',
              source: `api:${url.slice(0, 50)}`,
            });
          }
        }
      }
    } catch {}
  });

  // Navigate to event page
  try {
    await page.goto(EVENT_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
  } catch (err: any) {
    console.log('ℹ️ Page load took longer than usual, but browser is open. You can sign in!');
  }

  console.log('👉 Please sign in on the browser window if not already signed in.');
  console.log('👉 Waiting for event management controls to appear...\n');

  let syncCompleted = false;

  const performRosterScrape = async () => {
    if (syncCompleted) return;
    syncCompleted = true;
    console.log('\n🔍 [Agent] Logged in state detected! Scraping Attendees and Requests tabs...');

    try {
      // 1. Click "Attendees" Tab
      const attendeesTab = page.locator('button, a, div[role="tab"]').filter({ hasText: /^Attendees/i });
      if ((await attendeesTab.count()) > 0) {
        console.log('👉 Clicking "Attendees" tab...');
        await attendeesTab.first().click().catch(() => {});
        await page.waitForTimeout(3000);

        // Scrape links in DOM
        const links = await page.locator('a[href*="/@"], a[href*="/profile/"]').all();
        for (const link of links) {
          const href = (await link.getAttribute('href')) || '';
          const match = href.match(/@([a-zA-Z0-9._-]+)/) || href.match(/\/profile\/([a-zA-Z0-9._-]+)/);
          if (match && match[1]) {
            const text = (await link.innerText()).trim();
            recordPerson({
              builderId: match[1],
              displayName: text || match[1],
              rosterType: 'attendee',
              source: 'dom:attendees_tab',
            });
          }
        }
      }

      // 2. Click "Invites and requests" Tab
      const requestsTab = page.locator('button, a, div[role="tab"]').filter({ hasText: /Invites and requests/i });
      if ((await requestsTab.count()) > 0) {
        console.log('👉 Clicking "Invites and requests" tab...');
        await requestsTab.first().click().catch(() => {});
        await page.waitForTimeout(3000);

        // Scrape links in DOM
        const links = await page.locator('a[href*="/@"], a[href*="/profile/"]').all();
        for (const link of links) {
          const href = (await link.getAttribute('href')) || '';
          const match = href.match(/@([a-zA-Z0-9._-]+)/) || href.match(/\/profile\/([a-zA-Z0-9._-]+)/);
          if (match && match[1]) {
            const text = (await link.innerText()).trim();
            recordPerson({
              builderId: match[1],
              displayName: text || match[1],
              rosterType: 'request',
              source: 'dom:invites_requests_tab',
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('⚠️ DOM scraping note:', err.message);
    }

    // Save session to disk
    try {
      const cookies = await context.cookies();
      const storage = await context.storageState();

      const sessionPayload = {
        updatedAt: new Date().toISOString(),
        eventUrl: EVENT_URL,
        cookies,
        origins: storage.origins,
        attendees: Array.from(discoveredPeople.values()),
      };

      fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionPayload, null, 2), 'utf-8');
      console.log(`\n💾 Saved ${cookies.length} session cookies to ${SESSION_FILE}`);
    } catch (err: any) {
      console.warn('⚠️ Could not save session:', err.message);
    }

    // Upsert to Supabase
    if (supabase) {
      console.log(`\n📤 Syncing ${discoveredPeople.size} discovered records to Supabase...`);
      for (const person of discoveredPeople.values()) {
        try {
          await supabase.from('builder_center_attendees').upsert(
            {
              event_id: EVENT_ID,
              builder_id: person.builderId,
              display_name: person.displayName || null,
              email: person.email || null,
              avatar_url: person.avatarUrl || null,
              roster_type: person.rosterType,
              synced_at: new Date().toISOString(),
              raw_metadata: { source: person.source },
            },
            { onConflict: 'event_id,builder_id' }
          );

          // Update matching registrations table record if exists
          await supabase
            .from('registrations')
            .update({
              builder_center_verified: true,
              builder_center_status: 'registered_on_builder_center',
              builder_center_verified_at: new Date().toISOString(),
            })
            .ilike('builder_id', person.builderId);
        } catch (dbErr: any) {
          console.warn(`⚠️ Supabase error for ${person.builderId}:`, dbErr.message);
        }
      }
      console.log('✅ Supabase sync complete!');
    }

    console.log('\n======================================================');
    console.log(`🎉 SUCCESS: Captured ${discoveredPeople.size} attendees & requests!`);
    console.log('======================================================\n');
    console.log('You can now close the browser or press ENTER in this terminal.\n');
  };

  // Poll for login state
  const pollInterval = setInterval(async () => {
    try {
      const isEventPage = page.url().includes('c8a38d77-8262-34c4-b744-ea8dfb7b35a6');
      if (!isEventPage) return;

      const bodyText = await page.evaluate(() => document.body?.innerText || '');
      const hasOrganizerTabs =
        bodyText.includes('Invites and requests') ||
        (bodyText.includes('Attendees') && !bodyText.includes('Sign in'));

      if (hasOrganizerTabs) {
        clearInterval(pollInterval);
        await performRosterScrape();
      }
    } catch {}
  }, 2500);

  // Auto-save on window close
  page.on('close', async () => {
    clearInterval(pollInterval);
    if (!syncCompleted) {
      await performRosterScrape();
    }
    process.exit(0);
  });

  // Wait for user to press ENTER
  await new Promise<void>((resolve) => {
    process.stdin.resume();
    process.stdin.once('data', async () => {
      clearInterval(pollInterval);
      if (!syncCompleted) {
        await performRosterScrape();
      }
      await browser.close().catch(() => {});
      resolve();
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error('❌ Error during agent setup:', err);
  process.exit(1);
});
