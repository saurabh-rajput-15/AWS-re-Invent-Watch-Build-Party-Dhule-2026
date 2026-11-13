import { Request, Response } from 'express';
import { registrationsService } from './registrations.service.js';
import { generateTicketQr } from '../../services/email.service.js';

export class RegistrationsController {
  public static async create(req: Request, res: Response): Promise<void> {
    const { fullName, email, phone, builderId, college, year, skillLevel, interestTrack, whyJoin } = req.body;

    if (!fullName || !email || !phone || !builderId || !college) {
      res.status(400).json({ success: false, message: 'Missing required registration fields' });
      return;
    }

    const attendee = await registrationsService.create({
      fullName,
      email,
      phone,
      builderId,
      college,
      year,
      skillLevel,
      interestTrack,
      whyJoin,
    });

    // NOTE: Only confirmation email is sent when attendee is approved by admin (sendRegistrationReceivedEmail disabled per requirement)

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      attendee,
    });
  }

  public static async getByEmail(req: Request, res: Response): Promise<void> {
    const email = req.params.email;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const attendee = await registrationsService.getByEmail(email);
    if (!attendee) {
      res.status(404).json({ success: false, message: 'Attendee not found' });
      return;
    }

    res.json({
      success: true,
      attendee,
    });
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ success: false, message: 'Ticket ID is required' });
      return;
    }

    const attendee = await registrationsService.getById(id);
    if (!attendee) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.json({
      success: true,
      attendee,
    });
  }

  public static async checkAlias(req: Request, res: Response): Promise<void> {
    const alias = (req.body?.alias || req.query?.alias || '') as string;
    const force = req.body?.force === true || req.query?.force === 'true';
    if (!alias) {
      res.status(400).json({ success: false, message: 'Alias parameter is required' });
      return;
    }

    const result = await registrationsService.verifyAwsBuilderAlias(alias, force);
    res.json(result);
  }

  public static async getQrCode(req: Request, res: Response): Promise<void> {
    const rawId = req.params.id || '';
    const ticketId = rawId.replace(/\.png$/i, '').trim();
    if (!ticketId) {
      res.status(400).send('Ticket ID is required');
      return;
    }

    try {
      const qr = await generateTicketQr({
        id: ticketId,
        fullName: '',
        email: '',
        builderId: '',
        college: '',
      } as any);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(qr.pngBuffer);
    } catch (err: any) {
      console.error('Error generating QR endpoint response:', err);
      res.status(500).send('Error generating QR code');
    }
  }
}

