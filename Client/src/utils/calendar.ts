import { EVENT_DETAILS } from '../features/event/data/eventData';

export function getGoogleCalendarUrl(
  title: string = EVENT_DETAILS.name,
  description: string = EVENT_DETAILS.tagline,
  location: string = `${EVENT_DETAILS.venueName}, ${EVENT_DETAILS.venueCity}`,
  startDate: string = '20261204T033000Z',
  endDate: string = '20261204T103000Z'
): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description,
    location: location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(
  title: string = EVENT_DETAILS.name,
  description: string = EVENT_DETAILS.tagline,
  location: string = `${EVENT_DETAILS.venueName}, ${EVENT_DETAILS.venueCity}`,
  startDate: string = '20261204T033000Z',
  endDate: string = '20261204T103000Z',
  filename: string = 'AWS-reInvent-Watch-Build-Dhule.ics'
) {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AWS Student Builder Group//reInvent Dhule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${description.replace(/,/g, '\\,').replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
