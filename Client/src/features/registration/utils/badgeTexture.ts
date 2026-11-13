import { Attendee } from '../../../types';

/**
 * Creates high-resolution canvas textures for front and back of the 3D Lanyard pass.
 * Portrait textures: 1200 x 1688, drawn in a 600 x 844 coordinate space.
 */
export async function generateBadgeTextures(
  attendee: Attendee | null,
  qrDataUrl?: string
): Promise<{ frontUrl: string; backUrl: string; strapUrl: string }> {
  const width = 600;
  const height = 844;
  const resolution = 2;

  const name = attendee?.fullName || 'AWS Student Builder';
  const builderId = attendee?.builderId ? `@${attendee.builderId.replace(/^@/, '')}` : '@awsbuilder';
  const passId = attendee?.id || 'riv-26-XXXX';
  const college = attendee?.college || 'SVKM IOT / Dhule';
  const isApproved = attendee?.status === 'approved';

  // 1. FRONT BADGE CANVAS
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = width * resolution;
  frontCanvas.height = height * resolution;
  const fCtx = frontCanvas.getContext('2d');

  if (fCtx) {
    fCtx.scale(resolution, resolution);
    // Background gradient
    const bg = fCtx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#0E1726');
    bg.addColorStop(0.5, '#090D16');
    bg.addColorStop(1, '#050811');
    fCtx.fillStyle = bg;
    fCtx.fillRect(0, 0, width, height);

    // Subtle Grid Pattern
    fCtx.strokeStyle = 'rgba(63, 177, 255, 0.05)';
    fCtx.lineWidth = 1;
    for (let x = 30; x < width; x += 30) {
      fCtx.beginPath();
      fCtx.moveTo(x, 0);
      fCtx.lineTo(x, height);
      fCtx.stroke();
    }
    for (let y = 30; y < height; y += 30) {
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(width, y);
      fCtx.stroke();
    }

    // Top Holographic Rainbow Stripe
    const rainbow = fCtx.createLinearGradient(0, 0, width, 0);
    rainbow.addColorStop(0, '#3FB1FF');
    rainbow.addColorStop(0.25, '#FF57E8');
    rainbow.addColorStop(0.5, '#05E08A');
    rainbow.addColorStop(0.75, '#FF9F1C');
    rainbow.addColorStop(1, '#AB5CFF');
    fCtx.fillStyle = rainbow;
    fCtx.fillRect(0, 0, width, 14);

    // Event Header
    fCtx.textAlign = 'center';
    fCtx.fillStyle = '#3FB1FF';
    fCtx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    fCtx.letterSpacing = '2px';
    fCtx.fillText('AWS STUDENT BUILDER GROUP', width / 2, 85);

    fCtx.fillStyle = '#FFFFFF';
    fCtx.font = '900 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fCtx.letterSpacing = '-0.5px';
    fCtx.fillText('AWS re:Invent', width / 2, 137);

    fCtx.fillStyle = '#05E08A';
    fCtx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fCtx.letterSpacing = '1px';
    fCtx.fillText('WATCH & BUILD PARTY · DHULE', width / 2, 175);

    // Admission Pill Badge
    const pillY = 205;
    const pillText = isApproved ? '● CONFIRMED ADMISSION' : '● OFFICIAL ENTRY PASS';
    fCtx.font = 'bold 17px monospace';
    const pWidth = fCtx.measureText(pillText).width + 30;
    fCtx.fillStyle = isApproved ? 'rgba(5, 224, 138, 0.15)' : 'rgba(63, 177, 255, 0.15)';
    fCtx.beginPath();
    fCtx.roundRect(width / 2 - pWidth / 2, pillY, pWidth, 34, 17);
    fCtx.fill();
    fCtx.strokeStyle = isApproved ? '#05E08A' : '#3FB1FF';
    fCtx.lineWidth = 1.5;
    fCtx.stroke();
    fCtx.fillStyle = isApproved ? '#05E08A' : '#3FB1FF';
    fCtx.fillText(pillText, width / 2, pillY + 23);

    // Divider Line
    fCtx.letterSpacing = '0px';
    fCtx.strokeStyle = '#1E293B';
    fCtx.lineWidth = 1;
    fCtx.beginPath();
    fCtx.moveTo(50, 265);
    fCtx.lineTo(width - 50, 265);
    fCtx.stroke();

    // Attendee Name (Big & Bold)
    fCtx.fillStyle = '#FFFFFF';
    let nameLines: string[] = [];
    // Wrap by measured width rather than reducing every name over 22 characters.
    for (let fontSize = 42; fontSize >= 32; fontSize -= 2) {
      fCtx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      nameLines = [];
      let line = '';
      for (const word of name.trim().split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && fCtx.measureText(candidate).width > width - 100) {
          nameLines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      nameLines.push(line);
      if (nameLines.length <= 2) break;
    }
    if (nameLines.length > 2) nameLines = [nameLines[0], nameLines.slice(1).join(' ')];
    nameLines.forEach((line, index) => {
      fCtx.fillText(line, width / 2, nameLines.length === 1 ? 332 : 311 + index * 46, width - 100);
    });

    // AWS Builder Alias
    fCtx.fillStyle = '#3FB1FF';
    fCtx.font = 'bold 24px monospace';
    fCtx.fillText(builderId, width / 2, 401, width - 100);

    // College / Institution
    fCtx.fillStyle = '#CBD5E1';
    fCtx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fCtx.fillText(college, width / 2, 439, width - 100);

    // Ticket ID Container Card
    const cardY = 481;
    const cardH = 102;
    fCtx.fillStyle = '#090D16';
    fCtx.beginPath();
    fCtx.roundRect(60, cardY, width - 120, cardH, 16);
    fCtx.fill();
    fCtx.strokeStyle = '#334155';
    fCtx.lineWidth = 2;
    fCtx.setLineDash([6, 6]);
    fCtx.stroke();
    fCtx.setLineDash([]);

    fCtx.fillStyle = '#94A3B8';
    fCtx.font = 'bold 16px monospace';
    fCtx.letterSpacing = '2px';
    fCtx.fillText('PASS IDENTIFIER', width / 2, cardY + 34);

    fCtx.fillStyle = '#3FB1FF';
    fCtx.font = 'bold 34px monospace';
    fCtx.letterSpacing = '2px';
    fCtx.fillText(passId, width / 2, cardY + 79, width - 150);

    // Event Date & Venue Details
    fCtx.letterSpacing = '0px';
    const metaY = 628;
    fCtx.fillStyle = '#F1F5F9';
    fCtx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fCtx.fillText('📅 Friday, 04 December 2026', width / 2, metaY);
    fCtx.fillStyle = '#CBD5E1';
    fCtx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    fCtx.fillText('⏰ 09:00 AM – 04:00 PM IST', width / 2, metaY + 34);
    fCtx.fillText('📍 Symphony Hall (2F)', width / 2, metaY + 76);
    fCtx.fillText('Hotel Anand Regency · Dhule', width / 2, metaY + 108);

    // Footer Security Notice
    fCtx.fillStyle = '#94A3B8';
    fCtx.font = '16px monospace';
    fCtx.letterSpacing = '0px';
    fCtx.fillText('NON-TRANSFERABLE · PRESENT AT CHECK-IN', width / 2, height - 44);

    // Micro bottom bar
    fCtx.fillStyle = '#1E293B';
    fCtx.fillRect(0, height - 20, width, 20);
  }

  // 2. BACK BADGE CANVAS (with QR code)
  const backCanvas = document.createElement('canvas');
  backCanvas.width = width * resolution;
  backCanvas.height = height * resolution;
  const bCtx = backCanvas.getContext('2d');

  if (bCtx) {
    bCtx.scale(resolution, resolution);
    // Dark background
    const bg = bCtx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#090D16');
    bg.addColorStop(0.5, '#0E1726');
    bg.addColorStop(1, '#060913');
    bCtx.fillStyle = bg;
    bCtx.fillRect(0, 0, width, height);

    // Top Rainbow Stripe
    const rainbow = bCtx.createLinearGradient(0, 0, width, 0);
    rainbow.addColorStop(0, '#3FB1FF');
    rainbow.addColorStop(0.25, '#FF57E8');
    rainbow.addColorStop(0.5, '#05E08A');
    rainbow.addColorStop(0.75, '#FF9F1C');
    rainbow.addColorStop(1, '#AB5CFF');
    bCtx.fillStyle = rainbow;
    bCtx.fillRect(0, 0, width, 14);

    bCtx.textAlign = 'center';
    bCtx.fillStyle = '#3FB1FF';
    bCtx.font = 'bold 14px monospace';
    bCtx.letterSpacing = '2px';
    bCtx.fillText('RAPID CHECK-IN SCANNER', width / 2, 90);

    bCtx.fillStyle = '#FFFFFF';
    bCtx.letterSpacing = '0px';
    bCtx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bCtx.fillText('Present QR at Entrance', width / 2, 126);

    // QR Code Container Box
    const qrSize = 340;
    const qrBoxX = width / 2 - qrSize / 2;
    const qrBoxY = 160;

    bCtx.fillStyle = '#FFFFFF';
    bCtx.beginPath();
    bCtx.roundRect(qrBoxX - 16, qrBoxY - 16, qrSize + 32, qrSize + 32, 24);
    bCtx.fill();
    bCtx.strokeStyle = '#3FB1FF';
    bCtx.lineWidth = 4;
    bCtx.stroke();

    // Draw QR image if loaded, or draw placeholder
    if (qrDataUrl) {
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          qrImg.src = qrDataUrl;
        });
        bCtx.drawImage(qrImg, qrBoxX, qrBoxY, qrSize, qrSize);
      } catch {
        bCtx.fillStyle = '#090D16';
        bCtx.font = 'bold 16px monospace';
        bCtx.fillText(passId, width / 2, qrBoxY + qrSize / 2);
      }
    } else {
      bCtx.fillStyle = '#090D16';
      bCtx.font = 'bold 18px monospace';
      bCtx.fillText(passId, width / 2, qrBoxY + qrSize / 2);
    }

    // Scannable ID below QR
    bCtx.fillStyle = '#3FB1FF';
    bCtx.font = 'bold 18px monospace';
    bCtx.fillText(passId, width / 2, qrBoxY + qrSize + 48);

    // Security Rules Card
    const rulesY = 595;
    bCtx.fillStyle = '#090D16';
    bCtx.beginPath();
    bCtx.roundRect(50, rulesY, width - 100, 160, 16);
    bCtx.fill();
    bCtx.strokeStyle = '#1E293B';
    bCtx.lineWidth = 1;
    bCtx.stroke();

    bCtx.textAlign = 'left';
    bCtx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    bCtx.fillStyle = '#CBD5E1';
    const lines = [
      '✅ Valid Govt or Student College ID required at reception.',
      '✅ Please arrive 30 minutes before 09:00 AM kickoff.',
      '✅ Single admission pass; non-transferable.',
      '✅ Wifi & power sockets provided at the venue.',
    ];
    lines.forEach((line, i) => {
      bCtx.fillText(line, 75, rulesY + 36 + i * 32);
    });

    // Back bottom
    bCtx.textAlign = 'center';
    bCtx.fillStyle = '#475569';
    bCtx.font = '11px monospace';
    bCtx.fillText('AWS Student Builder Group Dhule · Official Pass', width / 2, height - 35);
  }

  // 3. STRAP TEXTURE (AWS re:Invent Lanyard Ribbon)
  const strapCanvas = document.createElement('canvas');
  strapCanvas.width = 128;
  strapCanvas.height = 1024;
  const sCtx = strapCanvas.getContext('2d');
  if (sCtx) {
    sCtx.fillStyle = '#0B0F19';
    sCtx.fillRect(0, 0, 128, 1024);

    // Colorful edge borders
    sCtx.fillStyle = '#FF9900'; // AWS Orange
    sCtx.fillRect(0, 0, 6, 1024);
    sCtx.fillStyle = '#3FB1FF'; // Cyan
    sCtx.fillRect(122, 0, 6, 1024);

    // Repeated text vertically
    sCtx.save();
    sCtx.translate(64, 0);
    sCtx.rotate(Math.PI / 2);
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillStyle = '#FFFFFF';
    sCtx.font = 'bold 22px monospace';
    sCtx.letterSpacing = '1px';
    for (let offset = 256; offset < 1024; offset += 512) {
      sCtx.fillText('AWS re:Invent · BUILDER', offset, 0);
    }
    sCtx.restore();
  }

  return {
    frontUrl: frontCanvas.toDataURL('image/png'),
    backUrl: backCanvas.toDataURL('image/png'),
    strapUrl: strapCanvas.toDataURL('image/png'),
  };
}
