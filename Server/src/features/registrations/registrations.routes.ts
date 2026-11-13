import { Router } from 'express';
import { RegistrationsController } from './registrations.controller.js';

const router = Router();

router.post('/', RegistrationsController.create);
router.get('/by-email/:email', RegistrationsController.getByEmail);
router.get('/by-id/:id', RegistrationsController.getById);
router.post('/builder-check', RegistrationsController.checkAlias);
router.get('/builder-check', RegistrationsController.checkAlias);
router.get('/qr/:id', RegistrationsController.getQrCode);
router.get('/qr/:id.png', RegistrationsController.getQrCode);

export const registrationsRoutes = router;

