import { cleanBuilderAlias } from '../components/Registration';

export interface BuilderVerificationResult {
  status: 'valid' | 'invalid' | 'checking' | 'idle';
  alias: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  programs?: string[];
  error?: string;
}

/**
 * Checks if an AWS Builder Center alias is valid or returns 404.
 * Uses the official AWS Builder Center endpoint via our local proxy.
 * Zero external paid API, 100% direct AWS Builder Center integration.
 */
export async function verifyAwsBuilderAlias(rawInput: string): Promise<BuilderVerificationResult> {
  const clean = cleanBuilderAlias(rawInput);
  if (!clean) {
    return {
      status: 'idle',
      alias: '',
      error: 'Please enter an AWS Builder Center alias'
    };
  }

  try {
    const res = await fetch('/api/aws-builder-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ alias: clean })
    });

    if (res.status === 200) {
      const data = await res.json();
      const basic = data?.profile?.basicInfo;
      const programs = (data?.profile?.awsPrograms || []).map(
        (p: { programName?: string; category?: string }) => p.programName || p.category || ''
      ).filter(Boolean);

      return {
        status: 'valid',
        alias: clean,
        displayName: basic?.displayName || clean,
        avatar: basic?.avatar,
        bio: basic?.bio,
        programs
      };
    } else {
      return {
        status: 'invalid',
        alias: clean,
        error: 'No profile found on AWS Builder Center (404)'
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      status: 'invalid',
      alias: clean,
      error: `Could not verify: ${message}`
    };
  }
}
