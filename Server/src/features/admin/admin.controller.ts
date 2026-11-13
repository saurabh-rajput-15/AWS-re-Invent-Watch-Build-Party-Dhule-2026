import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { registrationsService, RegistrationStatus } from '../registrations/registrations.service.js';
import { sendTicketApprovedEmail } from '../../services/email.service.js';

import { builderCenterAgentService } from '../../services/builderCenterAgent.service.js';

export class AdminController {
  public static async login(req: Request, res: Response): Promise<void> {
    const rawKey = req.body.key || req.body.passcode || req.body.adminKey || req.body.scannerKey;

    if (!rawKey || typeof rawKey !== 'string') {
      res.status(400).json({ success: false, message: 'Passcode is required' });
      return;
    }

    const trimmedKey = rawKey.trim();
    let role: 'admin' | 'scanner' | null = null;

    if (config.adminKey && trimmedKey === config.adminKey) {
      role = 'admin';
    } else if (config.scannerKey && trimmedKey === config.scannerKey) {
      role = 'scanner';
    }

    if (!role) {
      res.status(401).json({ success: false, message: 'Invalid passcode. Access denied.' });
      return;
    }

    const token = jwt.sign(
      { role, authenticatedAt: Date.now() },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: role === 'admin' ? 'Admin access granted' : 'Scanner access granted',
      token,
      role,
      admin: {
        role,
        title: role === 'admin' ? 'AWS re:Invent Event Organizer' : 'Reception Scanner Volunteer',
      },
    });
  }

  public static async verifySession(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      valid: true,
      message: 'Admin session is active',
    });
  }

  public static async getRegistrations(req: Request, res: Response): Promise<void> {
    const list = await registrationsService.getAll();
    res.json({
      success: true,
      registrations: list,
      count: list.length,
    });
  }

  public static async updateRegistrationStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, reviewedBy } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const updated = await registrationsService.updateStatus(id, status as RegistrationStatus, reviewedBy);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    // Automatically send Confirmed QR Ticket Pass via Brevo when attendee is approved
    let awsApproval: any = null;
    if (status === 'approved') {
      sendTicketApprovedEmail(updated).catch((err) => {
        console.error(`Failed to dispatch approved ticket email for ${updated.id}:`, err);
      });

      // Automatically approve the attendee on AWS Builder Center
      if (updated.builderId) {
        try {
          awsApproval = await builderCenterAgentService.approveBuilderOnAws(updated.builderId);
        } catch (err: any) {
          console.warn(`[Admin Controller] AWS approval error for @${updated.builderId}:`, err.message);
          awsApproval = { success: false, message: err.message, actionTaken: 'error' };
        }
      }
    }

    const message =
      awsApproval?.success && awsApproval.actionTaken === 'approved'
        ? `Registration approved & Builder Center request approved for @${updated.builderId}`
        : `Registration status updated to ${status}`;

    res.json({
      success: true,
      message,
      registration: updated,
      awsApproval,
    });
  }

  public static async resendTicket(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const attendee = await registrationsService.getById(id);

    if (!attendee) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    const success = await sendTicketApprovedEmail(attendee);
    res.json({
      success,
      message: success
        ? `Confirmed ticket email dispatched to ${attendee.email}`
        : 'Could not deliver email. Check Brevo settings or authorized IPs.',
    });
  }

  public static async deleteRegistration(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const success = await registrationsService.delete(id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Registration not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully',
    });
  }

  public static async batchVerify(req: Request, res: Response): Promise<void> {
    const all = await registrationsService.getAll();
    const list = all.filter((r) => r.status === 'pending');
    const results: Record<string, any> = {};

    for (const item of list) {
      const resVal = await registrationsService.verifyAwsBuilderAlias(item.builderId);
      results[item.id] = resVal;
    }

    res.json({
      success: true,
      results,
    });
  }

  public static async getBuilderCenterStats(_req: Request, res: Response): Promise<void> {
    const stats = await builderCenterAgentService.getStats();
    res.json({
      success: true,
      stats,
    });
  }

  public static async importBuilderCenterRoster(req: Request, res: Response): Promise<void> {
    const items = req.body?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Array of items { builderId } is required' });
      return;
    }

    const count = await builderCenterAgentService.syncBulkAttendees(items);
    res.json({
      success: true,
      message: `Successfully synced ${count} attendees into Builder Center registry`,
      count,
    });
  }

  public static async getTicketForCheckin(req: Request, res: Response): Promise<void> {
    const ticketId = (req.params.ticketId || req.query.ticketId || '') as string;
    if (!ticketId) {
      res.status(400).json({ success: false, message: 'Ticket ID is required' });
      return;
    }

    const attendee = await registrationsService.getById(ticketId.trim());
    if (!attendee) {
      res.status(404).json({ success: false, message: `Ticket "${ticketId}" was not found in the event database.` });
      return;
    }

    if (attendee.status !== 'approved') {
      res.status(400).json({
        success: false,
        canCheckIn: false,
        attendee,
        message: `Ticket "${ticketId}" is ${attendee.status.toUpperCase()} (Not Approved). Entry Denied.`,
      });
      return;
    }

    if (attendee.checkedIn) {
      res.json({
        success: true,
        canCheckIn: false,
        alreadyCheckedIn: true,
        attendee,
        message: `Already checked in at ${new Date(attendee.checkedInAt || Date.now()).toLocaleTimeString()}`,
      });
      return;
    }

    res.json({
      success: true,
      canCheckIn: true,
      alreadyCheckedIn: false,
      attendee,
      message: `Pass verified. Ready for check-in.`,
    });
  }

  public static async checkIn(req: any, res: Response): Promise<void> {
    const ticketId = (req.body?.ticketId || req.query?.ticketId || '') as string;
    if (!ticketId) {
      res.status(400).json({ success: false, message: 'Ticket ID is required' });
      return;
    }

    const reviewer = req.adminUser?.role === 'scanner' ? 'Reception Scanner Volunteer' : 'Admin Reception';
    const result = await registrationsService.checkIn(ticketId.trim(), reviewer);
    res.status(result.success ? 200 : 400).json(result);
  }
}

