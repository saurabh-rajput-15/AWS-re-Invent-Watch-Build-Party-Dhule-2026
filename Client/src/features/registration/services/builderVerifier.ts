import { apiUrl } from '../../../utils/api';

export interface BuilderVerificationResult {
  status: 'valid' | 'invalid' | 'checking' | 'idle';
  alias: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  programs?: string[];
  error?: string;
  hasEventRegistration?: boolean;
  eventRegistrationStatus?: 'registered_on_builder_center' | 'not_registered';
  message?: string;
}

export const cleanBuilderAlias = (input: string): string => {
  if (!input) return '';
  let val = input.trim().toLowerCase();
  val = val.replace(/^https?:\/\/(www\.)?builder\.aws\.com\/community\/@?/i, '');
  val = val.replace(/^builder\.aws\.com\/community\/@?/i, '');
  val = val.replace(/^@/, '');
  return val.trim().toLowerCase();
};

/**
 * Checks if an AWS Builder Center alias is valid or returns 404.
 * Uses our backend proxy endpoint (/api/registrations/builder-check).
 */
export async function verifyAwsBuilderAlias(rawInput: string, force = false): Promise<BuilderVerificationResult> {
  const clean = cleanBuilderAlias(rawInput);
  if (!clean) {
    return {
      status: 'idle',
      alias: '',
      error: 'Please enter an AWS Builder Center alias',
    };
  }

  try {
    const res = await fetch(apiUrl('/api/registrations/builder-check'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias: clean, force }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return data;
    } else {
      return {
        status: 'invalid',
        alias: clean,
        error: data?.message || data?.error || 'No profile found on AWS Builder Center (404)',
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      status: 'invalid',
      alias: clean,
      error: `Could not verify: ${message}`,
    };
  }
}
