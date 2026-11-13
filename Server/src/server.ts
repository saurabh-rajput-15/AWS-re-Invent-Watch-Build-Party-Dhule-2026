import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { adminRoutes } from './features/admin/admin.routes.js';
import { registrationsRoutes } from './features/registrations/registrations.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { builderCenterAgentService } from './services/builderCenterAgent.service.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Health & Keep-Alive Check
// Hit every 5 minutes by external monitors (UptimeRobot, Render cron) to keep server active
// Automatically triggers background sync if > 10 min since last sync or if ?sync=true
app.get('/health', async (req, res) => {
  const lastSync = builderCenterAgentService.getLastSyncTime();
  const minutesSinceLastSync = lastSync ? (Date.now() - lastSync) / 60000 : null;

  const shouldTriggerSync =
    req.query.sync === 'true' ||
    (minutesSinceLastSync !== null && minutesSinceLastSync >= 10);

  if (shouldTriggerSync && !builderCenterAgentService.isSyncing()) {
    builderCenterAgentService
      .syncRosterFromBuilderCenter('health_route_ping')
      .catch((err) => console.warn('⚠️ Health route background sync error:', err.message));
  }

  const stats = await builderCenterAgentService.getStats();

  res.json({
    status: 'ok',
    service: 'AWS re:Invent Dhule API Server',
    adminKeyConfigured: Boolean(config.adminKey),
    timestamp: new Date().toISOString(),
    agent: {
      isSessionReady: stats.isSessionReady,
      totalVerifiedRsvps: stats.totalVerifiedRsvps,
      lastSync: builderCenterAgentService.getLastSyncFormatted(),
      minutesSinceLastSync: minutesSinceLastSync ? Math.round(minutesSinceLastSync * 10) / 10 : null,
      syncInProgress: builderCenterAgentService.isSyncing(),
    },
  });
});

// Feature Routes
app.use('/api/admin', adminRoutes);
app.use('/api/registrations', registrationsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`🔒 Admin Auth: Ready (using ADMIN_KEY from .env)`);

  // Start periodic 10-minute automated scanner
  builderCenterAgentService.startPeriodicScan(10 * 60 * 1000);
});
