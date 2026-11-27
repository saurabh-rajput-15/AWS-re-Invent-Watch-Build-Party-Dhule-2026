/**
 * Formats a registration timestamp (epoch ms or ISO string) into a compact Indian date/time string.
 */
export function formatSubmittedDateTime(timestamp?: number | string): string {
  if (timestamp === undefined || timestamp === null || timestamp === '') {
    return '—';
  }
  const parsed = typeof timestamp === 'number' ? new Date(timestamp) : new Date(Number(timestamp) || timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Builds a normalized tel: URI from a raw phone string, prefixing +91 for 10-digit Indian mobile numbers.
 */
export function getTelHref(phone?: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return 'tel:';
  return digits.length === 10 ? `tel:+91${digits}` : `tel:+${digits}`;
}
