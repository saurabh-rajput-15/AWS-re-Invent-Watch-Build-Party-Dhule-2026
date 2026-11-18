import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReactQRCode } from '@lglab/react-qr-code';
import { Resvg } from '@resvg/resvg-js';
import QRCode from 'qrcode';
import { config } from '../config/env.js';
import { supabase } from '../config/supabase.js';
import { Attendee } from '../features/registrations/registrations.service.js';
import { loggerService } from './logger.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QrTicketResult {
  pngBuffer: Buffer;
  base64: string;
  dataUrl: string;
  publicUrl: string;
}

/**
 * Generates custom @lglab/react-qr-code PNG buffer, base64, and public CDN URL.
 * Customizations:
 * - Value: attendee.id (e.g. riv-26-9932)
 * - Circle data modules (#000000)
 * - Rounded finder patterns (#000000)
 * - Center preview logo (excavate: true, 100x60)
 * - No frame
 */
export async function generateTicketQr(attendee: Attendee): Promise<QrTicketResult> {
  const payload = attendee.id.trim();

  // 1. Read preview logo and encode as base64 data URI so Resvg embeds it offline
  let previewDataUrl = '';
  const possiblePreviewPaths = [
    path.resolve(__dirname, '../../public/preview.png'),
    path.resolve(__dirname, '../../../Client/public/preview.png'),
    path.resolve(process.cwd(), 'public/preview.png'),
    path.resolve(process.cwd(), '../Client/public/preview.png'),
  ];
  for (const p of possiblePreviewPaths) {
    if (fs.existsSync(p)) {
      try {
        const buf = fs.readFileSync(p);
        previewDataUrl = `data:image/png;base64,${buf.toString('base64')}`;
        break;
      } catch {}
    }
  }

  let pngBuffer: Buffer;

  try {
    // 2. Build React element with user's exact @lglab/react-qr-code customizations
    const element = React.createElement(ReactQRCode, {
      value: payload,
      size: 320,
      level: 'H',
      background: '#FFFFFF',
      dataModulesSettings: {
        color: '#000000',
        style: 'circle',
      },
      finderPatternOuterSettings: {
        color: '#000000',
        style: 'rounded',
      },
      finderPatternInnerSettings: {
        color: '#000000',
        style: 'rounded',
      },
      imageSettings: {
        src: previewDataUrl || `${config.frontendUrl}/preview.png`,
        height: 60,
        width: 100,
        excavate: true,
      },
    });

    let svg = renderToStaticMarkup(element);
    if (!svg.includes('xmlns=')) {
      svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ');
    }

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 480 },
    });
    const rendered = resvg.render();
    pngBuffer = Buffer.from(rendered.asPng());
  } catch (err: any) {
    console.warn('⚠️ ReactQRCode render error, falling back to standard QRCode:', err?.message);
    pngBuffer = await QRCode.toBuffer(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  }

  const base64 = pngBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  // 3. Upload to Supabase Storage so Gmail/email clients can fetch and display it reliably
  let publicUrl = '';
  if (supabase) {
    try {
      const fileName = `qr-${payload}.png`;
      const { error: uploadError } = await supabase.storage
        .from('ticket-passes')
        .upload(fileName, pngBuffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('ticket-passes').getPublicUrl(fileName);
        if (urlData?.publicUrl) {
          publicUrl = urlData.publicUrl;
        }
      } else {
        console.warn('⚠️ Supabase Storage upload warning:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase Storage exception:', err?.message);
    }
  }

  if (!publicUrl) {
    publicUrl = `${config.apiUrl}/api/registrations/qr/${payload}.png`;
  }

  return { pngBuffer, base64, dataUrl, publicUrl };
}

/**
 * Sends a transactional email using the Brevo v3 REST API.
 */
async function sendBrevoEmail(payload: {
  to: { name: string; email: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
  inlineImage?: { name: string; content: string }[];
  attachment?: { name: string; content: string }[];
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!config.brevoApiKey) {
    console.warn('⚠️ BREVO_MAIL_API is not configured. Email skipped.');
    return { success: false, error: 'Brevo API key not configured' };
  }

  const sender = {
    name: config.brevoSenderName || 'AWS re:Invent Dhule 2026',
    email: config.brevoSenderEmail || 'noreply@reinvent.awssbgdhule.in',
  };

  const body: Record<string, any> = {
    sender,
    to: payload.to,
    subject: payload.subject,
    htmlContent: payload.htmlContent,
    textContent: payload.textContent,
  };

  if (payload.inlineImage && payload.inlineImage.length > 0) {
    body.inlineImage = payload.inlineImage;
  }

  if (payload.attachment && payload.attachment.length > 0) {
    body.attachment = payload.attachment;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': config.brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as any;

    if (response.ok && data?.messageId) {
      console.log(`✅ Brevo email delivered to ${payload.to[0]?.email} (messageId: ${data.messageId})`);
      return { success: true, messageId: data.messageId };
    }

    const errorMsg = data?.message || `Brevo API HTTP ${response.status}`;
    console.error(`❌ Brevo email delivery failed:`, errorMsg);
    return { success: false, error: errorMsg };
  } catch (err: any) {
    console.error('❌ Network error while calling Brevo API:', err?.message);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * EMAIL 1: Application Received (Sent immediately on form submission)
 */
export async function sendRegistrationReceivedEmail(attendee: Attendee): Promise<boolean> {
  const subject = `Application Received: AWS re:Invent Watch & Build Party Dhule (ID: ${attendee.id})`;
  const portalUrl = 'https://reinvent.awssbgdhule.in/register';

  const textContent = `
Hello ${attendee.fullName},

Your registration request for the AWS re:Invent Watch & Build Party Dhule 2026 has been successfully received!

Pass Request ID: ${attendee.id}
AWS Builder Alias: @${attendee.builderId}
Institution: ${attendee.college}

Status: Under Manual Review by AWS Student Builder Group Leads.
Once your application is approved by the admin, you will receive your confirmed digital entry pass containing your check-in QR code shortly.

Event Details:
- Date: Friday, 04 December 2026
- Time: 09:00 AM – 04:00 PM IST
- Venue: Hotel Anand Regency Riverfront, Dhule (Symphony Hall 2F)

You can view your status anytime at: ${portalUrl}

Best regards,
AWS Student Builder Group Dhule
Official AWS Community
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090D16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F4F6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090D16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0E1526; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #3FB1FF, #FF57E8, #05E08A);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1E293B;">
              <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #3FB1FF; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                AWS Student Builder Group · Dhule
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                AWS re:Invent Watch &amp; Build Party
              </h1>
              <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">
                Official Digital Registration Portal
              </div>
            </td>
          </tr>

          <!-- Status Notice Badge -->
          <tr>
            <td style="padding: 24px 32px 10px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: rgba(255, 159, 28, 0.1); border: 1px solid rgba(255, 159, 28, 0.3); border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #FF9F1C; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      ⏳ Status: Request Submitted &amp; Pending Review
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">
                      Your application has been received successfully!
                    </div>
                    <div style="font-size: 12px; color: #CBD5E1; margin-top: 6px; line-height: 1.5;">
                      Once the admin approves your entry, you will receive a confirmation email with your <strong>Official QR Entry Pass</strong> shortly.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <p style="font-size: 15px; line-height: 1.6; color: #E2E8F0; margin-top: 0;">
                Hello <strong>${attendee.fullName}</strong>,
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #94A3B8;">
                Thank you for applying to join 300+ cloud enthusiasts and student builders at Hotel Anand Regency Riverfront. To prevent bot spam and verify student credentials, registrations are reviewed manually.
              </p>

              <!-- Application Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090D16; border: 1px solid #1E293B; border-radius: 12px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td style="color: #64748B; padding-bottom: 8px;">Pass Request ID:</td>
                        <td style="color: #FFFFFF; font-weight: bold; font-family: monospace; text-align: right; padding-bottom: 8px;">${attendee.id}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; padding-bottom: 8px;">AWS Builder Center Alias:</td>
                        <td style="color: #3FB1FF; font-weight: bold; font-family: monospace; text-align: right; padding-bottom: 8px;">@${attendee.builderId}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; padding-bottom: 8px;">College / Institution:</td>
                        <td style="color: #FFFFFF; text-align: right; padding-bottom: 8px;">${attendee.college}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B; padding-bottom: 8px;">Date &amp; Time:</td>
                        <td style="color: #FFFFFF; text-align: right; padding-bottom: 8px;">Fri, 04 Dec 2026 · 09:00 AM</td>
                      </tr>
                      <tr>
                        <td style="color: #64748B;">Venue:</td>
                        <td style="color: #FFFFFF; text-align: right;">Hotel Anand Regency Riverfront, Dhule</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${portalUrl}" style="display: inline-block; background: linear-gradient(90deg, #3FB1FF, #05E08A); color: #090D16; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 15px rgba(63, 177, 255, 0.3);">
                  Check Application Status on Portal &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #090D16; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; line-height: 1.5;">
              <div>AWS re:Invent Watch &amp; Build Party Dhule 2026</div>
              <div style="margin-top: 4px;">Organized by AWS Student Builder Group Dhule · SVKM's IOT Campus</div>
              <div style="margin-top: 8px; color: #475569;">
                This is an automated transactional message sent to ${attendee.email}.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const result = await sendBrevoEmail({
    to: [{ name: attendee.fullName, email: attendee.email }],
    subject,
    htmlContent,
    textContent,
  });

  return result.success;
}

/**
 * EMAIL 2: Confirmed Digital Entry Ticket with QR Pass (MIME multipart with inline CID)
 * Sent when admin confirms/approves the attendee entry in Admin Portal.
 */
export async function sendTicketApprovedEmail(attendee: Attendee): Promise<boolean> {
  const subject = `🎟️ Confirmed Entry Pass: AWS re:Invent Watch & Build Party Dhule (ID: ${attendee.id})`;
  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE&text=AWS+re%3AInvent+Watch+%26+Build+Party+Dhule&dates=20261204T033000Z%2F20261204T103000Z&details=Official+entry+ticket+for+AWS+re%3AInvent+Dhule.+Present+your+QR+code+pass+at+Symphony+Hall+2F+reception.&location=Hotel+Anand+Regency+Riverfront%2C+Dhule';

  // 1. Generate QR Code image (Buffer + Base64 for inline MIME embedding)
  const qr = await generateTicketQr(attendee);

  const textContent = `
CONGRATULATIONS ${attendee.fullName.toUpperCase()}!
Your entry for AWS re:Invent Watch & Build Party Dhule 2026 has been CONFIRMED.

CONFIRMED PASS ID: ${attendee.id}
AWS Builder Alias: @${attendee.builderId}
Attendee Name: ${attendee.fullName}
College: ${attendee.college}

EVENT SCHEDULE & VENUE:
- Date: Friday, 04 December 2026
- Check-In Hours: 09:00 AM – 09:30 AM IST
- Venue: Hotel Anand Regency Riverfront, Dhule (Symphony Hall 2F)
- Google Maps Location: https://maps.app.goo.gl/uRJKnYPW6z62mTJA9

📋 IMPORTANT INFORMATION:
✅ Carry a valid Government ID or College ID for verification.
✅ Please arrive at least 30 minutes before the event starts.
✅ Your ticket contains a unique QR code required for check-in.
✅ Tickets are non-transferable unless approved by the organizing team.
✅ Keep this email accessible on the event day.

Add to Google Calendar: ${calendarUrl}
Questions? Reach us at info@reinvent.awssbgdhule.in

See you at the event!
AWS Student Builder Group Dhule
`.trim();

  let htmlContent = '';
  const possiblePaths = [
    path.resolve(__dirname, '../../../ticketmail.html'),
    path.resolve(__dirname, '../../templates/ticketmail.html'),
    path.resolve(process.cwd(), 'ticketmail.html'),
    path.resolve(process.cwd(), '../ticketmail.html'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        let template = fs.readFileSync(p, 'utf8');
        template = template
          .replace(/\{\{FULL_NAME\}\}/g, attendee.fullName)
          .replace(/\{\{TICKET_ID\}\}/g, attendee.id)
          .replace(/\{\{EMAIL\}\}/g, attendee.email)
          .replace(/\{\{BUILDER_ID\}\}/g, attendee.builderId)
          .replace(/\{\{COLLEGE\}\}/g, attendee.college)
          .replace(/\{\{CALENDAR_URL\}\}/g, calendarUrl)
          .replace(/\{\{SUBJECT\}\}/g, subject)
          .replace(/\{\{FRONTEND_URL\}\}/g, config.frontendUrl)
          .replace(/\{\{QR_IMAGE_SRC\}\}/g, qr.publicUrl);
        htmlContent = template;
        break;
      } catch {}
    }
  }

  if (!htmlContent) {
    htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090D16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F4F6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090D16; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Pass Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #0E1526; border: 1px solid #1E293B; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6);">
          <!-- Top Vivid Holographic Header -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #3FB1FF, #FF57E8, #05E08A, #FF9F1C, #AB5CFF);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1E293B;">
              <div style="display: inline-block; background: rgba(5, 224, 138, 0.15); border: 1px solid rgba(5, 224, 138, 0.4); border-radius: 9999px; padding: 4px 14px; font-family: monospace; font-size: 11px; font-weight: bold; color: #05E08A; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
                ● OFFICIAL ADMISSION PASS
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                AWS re:Invent Watch &amp; Build
              </h1>
              <div style="font-size: 13px; color: #94A3B8; margin-top: 4px;">
                Friday, 04 December 2026 · Dhule, India
              </div>
            </td>
          </tr>

          <!-- Ticket Pass Body -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <!-- Congratulations Banner -->
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 20px; font-weight: 800; color: #FFFFFF;">
                  You're Confirmed, ${attendee.fullName}!
                </div>
                <div style="font-size: 13px; color: #05E08A; margin-top: 4px; font-weight: 600;">
                  Your official seat for AWS re:Invent Watch &amp; Build Party Dhule is confirmed.
                </div>
              </div>

              <!-- Digital Ticket Card with QR Code -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #090D16; border: 2px dashed #334155; border-radius: 18px; padding: 24px; text-align: center;">
                <tr>
                  <td align="center">
                    <!-- Ticket ID Pill -->
                    <div style="display: inline-block; background-color: #1E293B; border: 1px solid #334155; border-radius: 8px; padding: 4px 12px; font-family: monospace; font-size: 13px; font-weight: bold; color: #3FB1FF; margin-bottom: 16px;">
                      PASS ID: ${attendee.id}
                    </div>

                    <!-- Embedded Custom @lglab/react-qr-code (Public HTTPS CDN URL) -->
                    <div style="background-color: #FFFFFF; padding: 12px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.4); margin-bottom: 12px;">
                      <img src="${qr.publicUrl}" alt="Scan QR Code Ticket" width="220" height="220" style="display: block; width: 220px; height: 220px; border: 0; outline: none;" />
                    </div>

                    <div style="font-family: monospace; font-size: 11px; color: #94A3B8; margin-top: 8px; letter-spacing: 0.5px;">
                      SCAN AT RECEPTION (SYMPHONY HALL 2F)
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Attendee Details Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px; font-size: 13px; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #1E293B;">
                  <td style="color: #64748B; padding: 10px 0;">Attendee Name:</td>
                  <td style="color: #FFFFFF; font-weight: bold; text-align: right; padding: 10px 0;">${attendee.fullName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1E293B;">
                  <td style="color: #64748B; padding: 10px 0;">Registered Email:</td>
                  <td style="color: #FFFFFF; text-align: right; padding: 10px 0;">${attendee.email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1E293B;">
                  <td style="color: #64748B; padding: 10px 0;">AWS Builder Center ID:</td>
                  <td style="color: #3FB1FF; font-weight: bold; font-family: monospace; text-align: right; padding: 10px 0;">@${attendee.builderId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1E293B;">
                  <td style="color: #64748B; padding: 10px 0;">Institution / College:</td>
                  <td style="color: #FFFFFF; text-align: right; padding: 10px 0;">${attendee.college}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1E293B;">
                  <td style="color: #64748B; padding: 10px 0;">Check-In Hours:</td>
                  <td style="color: #05E08A; font-weight: bold; text-align: right; padding: 10px 0;">09:00 AM – 09:30 AM IST</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 10px 0;">Venue Location:</td>
                  <td style="text-align: right; padding: 10px 0;">
                    <a href="https://maps.app.goo.gl/uRJKnYPW6z62mTJA9" target="_blank" style="color: #3FB1FF; font-weight: bold; text-decoration: none;">
                      Hotel Anand Regency Riverfront, Dhule ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 📋 Important Information Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 22px; background-color: #0A1220; border: 1px solid #1E293B; border-radius: 14px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 13px; font-weight: bold; color: #FFFFFF; margin-bottom: 10px;">
                      📋 Important Information
                    </div>
                    <div style="font-size: 12px; color: #CBD5E1; line-height: 20px;">
                      <div>✅ Carry a valid Government ID or College ID for verification.</div>
                      <div style="margin-top: 6px;">✅ Please arrive at least 30 minutes before the event starts.</div>
                      <div style="margin-top: 6px;">✅ Your ticket contains a unique QR code required for check-in.</div>
                      <div style="margin-top: 6px;">✅ Tickets are non-transferable unless approved by the organizing team.</div>
                      <div style="margin-top: 6px;">✅ Keep this email accessible on the event day.</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <div style="text-align: center; margin: 26px 0 10px 0;">
                <a href="${calendarUrl}" style="display: inline-block; background-color: #3FB1FF; color: #090D16; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 12px; margin: 4px;">
                  📅 Add to Google Calendar &rarr;
                </a>
                <a href="https://maps.app.goo.gl/uRJKnYPW6z62mTJA9" style="display: inline-block; background-color: #1E293B; border: 1px solid #334155; color: #3FB1FF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 20px; border-radius: 12px; margin: 4px;">
                  📍 View on Google Maps &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #090D16; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; line-height: 1.5;">
              <div>Your scannable ticket is attached to this email as a PNG image for offline access.</div>
              <div style="margin-top: 6px;">AWS re:Invent Watch &amp; Build Party Dhule 2026 · AWS Student Builder Group</div>
              <div style="margin-top: 8px; color: #475569;">
                This email was sent to ${attendee.email}. Ticket is non-transferable.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  }

  // 2. Brevo Email Dispatch:
  // - htmlContent: embeds the high-resolution public HTTPS URL of @lglab/react-qr-code
  // - attachment: provides the exact custom @lglab/react-qr-code PNG file as an attachment
  const result = await sendBrevoEmail({
    to: [{ name: attendee.fullName, email: attendee.email }],
    subject,
    htmlContent,
    textContent,
    attachment: [
      {
        name: `AWS-Ticket-Pass-${attendee.id}.png`,
        content: qr.base64,
      },
    ],
  });

  return result.success;
}

/**
 * Escapes characters for safe inclusion inside pre/code blocks in HTML emails
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface SessionAlertPayload {
  errorMessage: string;
  actionAttempted?: string;
  httpStatus?: number;
  recipientEmail?: string;
}

// Rate-limiting / throttling: Send alert at most once every 30 minutes for continuous session failures
let lastSessionAlertSentAt = 0;
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

export function resetSessionAlertCooldown(): void {
  lastSessionAlertSentAt = 0;
}

/**
 * EMAIL 3: Session Expiration & System Error Alert
 * Sends emergency diagnostic email with the last 50 server logs to the organizer.
 */
export async function sendSessionAlertEmail(payload: SessionAlertPayload): Promise<boolean> {
  const recipient = payload.recipientEmail || config.alertEmail || 'saurabhgirase2005@gmail.com';
  const now = Date.now();

  if (lastSessionAlertSentAt && now - lastSessionAlertSentAt < ALERT_COOLDOWN_MS) {
    const waitMins = Math.round((ALERT_COOLDOWN_MS - (now - lastSessionAlertSentAt)) / 60000);
    console.log(`ℹ️ [Session Alert] Alert email to ${recipient} throttled (cooldown active, next alert in ~${waitMins}m).`);
    return false;
  }

  const recentLogs = loggerService.getRecentLogsFormatted(50) || `[${new Date().toISOString()}] No recent server logs recorded.`;
  const timestampIso = new Date().toISOString();
  const timestampIst = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const subject = `🚨 [URGENT] AWS Builder Center Session Expired / Unauthorized - AWS re:Invent Dhule`;

  const textContent = `
AWS re:Invent Dhule 2026 - Critical Session Alert
==================================================
The AWS Builder Center session has expired or is unauthorized.
Autonomous attendee sync and live lookups cannot authenticate with AWS.

Incident Summary:
- Timestamp (UTC): ${timestampIso}
- Timestamp (IST): ${timestampIst}
- Action Attempted: ${payload.actionAttempted || 'AWS API Request'}
- Status / Error: ${payload.errorMessage} ${payload.httpStatus ? `(HTTP ${payload.httpStatus})` : ''}

How to Resolve in 1 Step:
1. Open PowerShell and run: .\\agent-login.ps1
2. Sign in with your Organizer/Co-Host AWS Builder account in the browser.
3. The agent will automatically capture the new session cookies and persist them to Supabase and .env.

Last 50 Server Logs with Timestamp:
--------------------------------------------------
${recentLogs}
--------------------------------------------------
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AWS Session Alert</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #F3F4F6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 680px; margin: 0 auto; background-color: #0E1526; border: 1px solid #EF4444; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
    <!-- Alert Header Banner -->
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(135deg, #7F1D1D 0%, #1E1B4B 100%); border-bottom: 1px solid #DC2626;">
        <div style="display: inline-block; padding: 4px 12px; background-color: #DC2626; color: #FFFFFF; font-weight: 800; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 9999px;">
          CRITICAL ALERT
        </div>
        <h1 style="margin: 12px 0 4px 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
          AWS Builder Center Session Expired
        </h1>
        <div style="font-size: 13px; color: #FECACA;">
          Action required: Attendee synchronization has stalled due to 401 Unauthorized.
        </div>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #131B2E; border: 1px solid #1E293B; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 6px 12px; font-size: 13px; color: #94A3B8; width: 140px;">Timestamp:</td>
            <td style="padding: 6px 12px; font-size: 13px; color: #F3F4F6; font-family: monospace;">${timestampIst} (IST) / ${timestampIso} (UTC)</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-size: 13px; color: #94A3B8;">Action Failed:</td>
            <td style="padding: 6px 12px; font-size: 13px; color: #F3F4F6; font-weight: 600;">${escapeHtml(payload.actionAttempted || 'AWS API Call')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-size: 13px; color: #94A3B8;">HTTP Status:</td>
            <td style="padding: 6px 12px; font-size: 13px; color: #F87171; font-weight: 700;">${payload.httpStatus || 401} Unauthorized</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; font-size: 13px; color: #94A3B8;">Error Message:</td>
            <td style="padding: 6px 12px; font-size: 13px; color: #FCA5A5; font-family: monospace;">${escapeHtml(payload.errorMessage)}</td>
          </tr>
        </table>

        <!-- Quick Recovery Instructions -->
        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #38BDF8;">🛠️ How to Restore in 1 Step:</h3>
        <div style="background-color: #0A0F1D; border-left: 4px solid #38BDF8; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #E2E8F0;">
          Run the following command in PowerShell on your local machine:
          <div style="background-color: #020617; color: #38BDF8; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 13px; margin: 8px 0;">
            .\\agent-login.ps1
          </div>
          Sign in once in the opened Chrome window. The agent will immediately capture the fresh tokens, save them to Supabase, and restore normal operations.
        </div>

        <!-- Last 50 Server Logs with Time -->
        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #F3F4F6;">
          📋 Last 50 Server Logs (with Timestamp):
        </h3>
        <div style="background-color: #020617; border: 1px solid #1E293B; border-radius: 8px; padding: 14px; max-height: 380px; overflow-y: auto;">
          <pre style="margin: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 11px; line-height: 1.5; color: #94A3B8; white-space: pre-wrap; word-break: break-all;">${escapeHtml(recentLogs)}</pre>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 18px 32px; background-color: #090D16; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B;">
        AWS re:Invent Watch &amp; Build Party Dhule 2026 · Automated Health Monitoring
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  try {
    const res = await sendBrevoEmail({
      to: [{ name: 'Saurabh Girase', email: recipient }],
      subject,
      htmlContent,
      textContent,
    });

    if (res.success) {
      lastSessionAlertSentAt = now;
      console.log(`🚨 [Session Alert] Sent emergency notification email to ${recipient} (messageId: ${res.messageId})`);
      return true;
    } else {
      console.warn(`⚠️ [Session Alert] Failed to send alert email:`, res.error);
      return false;
    }
  } catch (err: any) {
    console.warn(`⚠️ [Session Alert] Exception sending alert email:`, err.message);
    return false;
  }
}

