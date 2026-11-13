import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  adminKey: process.env.ADMIN_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'aws_reinvent_dhule_default_jwt_secret_key_2026',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  brevoApiKey: process.env.BREVO_MAIL_API || process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@reinvent.awssbgdhule.in',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'AWS re:Invent Dhule 2026',
  brevoSmtpUser: process.env.BREVO_SMTP_USER || '',
  brevoSmtpPass: process.env.BREVO_SMTP_PASS || process.env.BREVO_MAIL_API || '',
  frontendUrl: (process.env.FRONTEND_URL || 'https://reinvent.awssbgdhule.in').replace(/\/$/, ''),
  apiUrl: (process.env.API_URL || process.env.SERVER_URL || 'https://api.reinvent.awssbgdhule.in').replace(/\/$/, ''),
};

if (!config.adminKey) {
  console.warn('⚠️ WARNING: ADMIN_KEY is not set in Server .env! Admin authentication will fail.');
}

if (!config.supabaseUrl || !config.supabaseKey) {
  console.warn('ℹ️ SUPABASE_URL or SUPABASE_KEY not yet set in Server .env. Running with in-memory store.');
}

