import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../config/supabase.js';

async function storeSessionToSupabase() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized! Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const rawCookie = process.env.AWS_BUILDER_SESSION_COOKIE || '';
  const rawCsrf = process.env.AWS_BUILDER_CSRF_TOKEN || '';

  const cookie = rawCookie.trim().replace(/^["']|["']$/g, '');
  const csrfToken = rawCsrf.trim().replace(/^["']|["']$/g, '');
  const eventId = 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6';

  if (!cookie || !csrfToken) {
    console.error('❌ Missing AWS_BUILDER_SESSION_COOKIE or AWS_BUILDER_CSRF_TOKEN in Server/.env');
    process.exit(1);
  }

  console.log('⏳ Storing fresh session credentials to Supabase agent_sessions table...');
  const now = new Date().toISOString();

  const { data: upsertData, error: upsertError } = await supabase
    .from('agent_sessions')
    .upsert(
      {
        session_id: 'aws_builder_session',
        event_id: eventId,
        cookie,
        csrf_token: csrfToken,
        last_refreshed_at: now,
        updated_at: now,
      },
      { onConflict: 'session_id' }
    )
    .select();

  if (upsertError) {
    console.error('❌ Failed to store session into Supabase:', upsertError.message);
    process.exit(1);
  }

  console.log('✅ Successfully persisted session to Supabase agent_sessions table!');

  // Verify by reading back the stored record
  const { data: readData, error: readError } = await supabase
    .from('agent_sessions')
    .select('*')
    .eq('session_id', 'aws_builder_session')
    .single();

  if (readError || !readData) {
    console.error('❌ Verification read-back failed:', readError?.message);
    process.exit(1);
  }

  console.log('\n🔍 Verified Stored Supabase Session:');
  console.log('  • Session ID:       ', readData.session_id);
  console.log('  • Event ID:         ', readData.event_id);
  console.log('  • Cookie Length:    ', readData.cookie?.length, 'bytes');
  console.log('  • Cookie Start:     ', readData.cookie.substring(0, 45) + '...');
  console.log('  • CSRF Token Length:', readData.csrf_token?.length, 'bytes');
  console.log('  • CSRF Token Start: ', readData.csrf_token.substring(0, 35) + '...');
  console.log('  • Last Refreshed:   ', readData.last_refreshed_at);
  console.log('  • Updated At:       ', readData.updated_at);
  console.log('\n✨ Cloud session store is synchronized and ready for production!');
}

storeSessionToSupabase().catch((err) => {
  console.error('Fatal error storing session:', err);
  process.exit(1);
});
