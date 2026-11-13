import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAdminAuth, requireScannerOrAdminAuth } from './admin.middleware.js';

const router = Router();

// Public admin & scanner login endpoint (validates ADMIN_KEY or SCANNER_KEY from Server .env)
router.post('/login', AdminController.login);

// Session verification (allows both admin and scanner roles)
router.get('/verify', requireScannerOrAdminAuth, AdminController.verifySession);

// Scanner routes (allows both admin and scanner volunteer roles)
router.get('/ticket/:ticketId', requireScannerOrAdminAuth, AdminController.getTicketForCheckin);
router.post('/checkin', requireScannerOrAdminAuth, AdminController.checkIn);

// Protected organizer-only endpoints (Strictly requires ADMIN_KEY)
router.get('/registrations', requireAdminAuth, AdminController.getRegistrations);
router.patch('/registrations/:id/status', requireAdminAuth, AdminController.updateRegistrationStatus);
router.post('/registrations/:id/resend-ticket', requireAdminAuth, AdminController.resendTicket);
router.delete('/registrations/:id', requireAdminAuth, AdminController.deleteRegistration);
router.post('/registrations/batch-verify', requireAdminAuth, AdminController.batchVerify);
router.get('/builder-center/stats', requireAdminAuth, AdminController.getBuilderCenterStats);
router.post('/builder-center/import', requireAdminAuth, AdminController.importBuilderCenterRoster);

export const adminRoutes = router;
