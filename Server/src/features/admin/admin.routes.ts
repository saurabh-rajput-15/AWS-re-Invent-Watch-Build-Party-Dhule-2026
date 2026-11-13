import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAdminAuth } from './admin.middleware.js';

const router = Router();

// Public admin login endpoint (validates ADMIN_KEY from Server .env)
router.post('/login', AdminController.login);

// Protected admin endpoints requiring Bearer session token
router.get('/verify', requireAdminAuth, AdminController.verifySession);
router.get('/registrations', requireAdminAuth, AdminController.getRegistrations);
router.patch('/registrations/:id/status', requireAdminAuth, AdminController.updateRegistrationStatus);
router.post('/registrations/:id/resend-ticket', requireAdminAuth, AdminController.resendTicket);
router.delete('/registrations/:id', requireAdminAuth, AdminController.deleteRegistration);
router.post('/registrations/batch-verify', requireAdminAuth, AdminController.batchVerify);
router.get('/builder-center/stats', requireAdminAuth, AdminController.getBuilderCenterStats);
router.post('/builder-center/import', requireAdminAuth, AdminController.importBuilderCenterRoster);
router.post('/checkin', requireAdminAuth, AdminController.checkIn);

export const adminRoutes = router;

