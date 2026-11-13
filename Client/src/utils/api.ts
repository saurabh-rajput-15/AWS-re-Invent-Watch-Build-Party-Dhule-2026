/**
 * Centralized API and Frontend URL Configuration
 * Driven purely by environment variables:
 * - VITE_API_URL: Production backend (e.g. https://api.reinvent.awssbgdhule.in)
 * - VITE_FRONTEND_URL: Production frontend (e.g. https://reinvent.awssbgdhule.in)
 */

export const API_BASE_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  ''
).replace(/\/$/, '');

export const FRONTEND_URL: string = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FRONTEND_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

/**
 * Resolves an API endpoint path.
 * If API_BASE_URL is set (e.g. https://api.reinvent.awssbgdhule.in), prepends it.
 * If API_BASE_URL is empty (local development with Vite proxy), returns relative /api/...
 */
export const apiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Resolves static asset URLs based on VITE_FRONTEND_URL.
 */
export const assetUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!FRONTEND_URL) {
    return cleanPath;
  }
  return `${FRONTEND_URL}${cleanPath}`;
};
