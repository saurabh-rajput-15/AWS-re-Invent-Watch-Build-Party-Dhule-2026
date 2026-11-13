import { Attendee, RegistrationStatus } from '../../../types';
import { apiUrl } from '../../../utils/api';

export interface AdminLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    role: string;
    title: string;
  };
}

export class AdminService {
  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async login(key: string): Promise<AdminLoginResponse> {
    const res = await fetch(apiUrl('/api/admin/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ key }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Admin authentication failed');
    }
    return data;
  }

  public static async verifySession(token: string): Promise<boolean> {
    try {
      const res = await fetch(apiUrl('/api/admin/verify'), {
        headers: this.getHeaders(token),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static async getRegistrations(token: string): Promise<Attendee[]> {
    const res = await fetch(apiUrl('/api/admin/registrations'), {
      headers: this.getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch registrations');
    }
    return data.registrations || [];
  }

  public static async updateStatus(
    token: string,
    id: string,
    status: RegistrationStatus,
    reviewedBy?: string
  ): Promise<{ registration: Attendee; awsApproval?: any; message?: string }> {
    const res = await fetch(apiUrl(`/api/admin/registrations/${id}/status`), {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: JSON.stringify({ status, reviewedBy }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update registration status');
    }
    return data;
  }

  public static async deleteRegistration(token: string, id: string): Promise<void> {
    const res = await fetch(apiUrl(`/api/admin/registrations/${id}`), {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete registration');
    }
  }

  public static async resendTicket(token: string, id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(apiUrl(`/api/admin/registrations/${id}/resend-ticket`), {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to resend ticket');
    }
    return data;
  }

  public static async batchVerify(token: string): Promise<Record<string, any>> {
    const res = await fetch(apiUrl('/api/admin/registrations/batch-verify'), {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to batch verify');
    }
    return data.results || {};
  }

  public static async importBuilderCenterAttendees(
    token: string,
    items: Array<{ builderId: string; displayName?: string; email?: string }>
  ): Promise<{ success: boolean; count: number; message: string }> {
    const res = await fetch(apiUrl('/api/admin/builder-center/import'), {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to import attendees');
    }
    return data;
  }
}

