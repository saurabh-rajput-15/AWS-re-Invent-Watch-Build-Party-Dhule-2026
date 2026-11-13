import { supabase } from '../../config/supabase.js';
import { builderCenterAgentService } from '../../services/builderCenterAgent.service.js';

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  builderId: string;
  college: string;
  year?: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  interestTrack?: string;
  whyJoin?: string;
  status: RegistrationStatus;
  registeredAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  builderCenterVerified?: boolean;
  builderCenterStatus?: 'registered_on_builder_center' | 'not_registered' | 'pending_check';
  builderCenterVerifiedAt?: number;
  checkedIn?: boolean;
  checkedInAt?: number;
}

// Convert DB row (snake_case) to Attendee object (camelCase)
function rowToAttendee(row: any): Attendee {
  const raw = row.builder_center_raw || {};
  return {
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    builderId: row.builder_id || '',
    college: row.college || '',
    year: row.year || '3rd Year',
    skillLevel: row.skill_level || 'Beginner',
    interestTrack: row.interest_track || undefined,
    whyJoin: row.why_join || undefined,
    status: (row.status as RegistrationStatus) || 'pending',
    registeredAt: Number(row.registered_at) || Date.now(),
    reviewedAt: row.reviewed_at ? Number(row.reviewed_at) : undefined,
    reviewedBy: row.reviewed_by || undefined,
    builderCenterVerified: Boolean(row.builder_center_verified),
    builderCenterStatus: row.builder_center_status || (row.builder_center_verified ? 'registered_on_builder_center' : 'pending_check'),
    builderCenterVerifiedAt: row.builder_center_verified_at ? new Date(row.builder_center_verified_at).getTime() : undefined,
    checkedIn: Boolean(row.checked_in !== undefined && row.checked_in !== null ? row.checked_in : raw.checkedIn),
    checkedInAt: row.checked_in_at
      ? new Date(row.checked_in_at).getTime()
      : raw.checkedInAt
      ? Number(raw.checkedInAt)
      : undefined,
  };
}

// Convert Attendee object to DB row
function attendeeToRow(attendee: Attendee): any {
  return {
    id: attendee.id,
    full_name: attendee.fullName,
    email: attendee.email.toLowerCase(),
    phone: attendee.phone,
    builder_id: attendee.builderId,
    college: attendee.college,
    year: attendee.year,
    skill_level: attendee.skillLevel,
    interest_track: attendee.interestTrack,
    why_join: attendee.whyJoin,
    status: attendee.status,
    registered_at: attendee.registeredAt,
    reviewed_at: attendee.reviewedAt || null,
    reviewed_by: attendee.reviewedBy || null,
    builder_center_verified: attendee.builderCenterVerified || false,
    builder_center_status: attendee.builderCenterStatus || 'pending_check',
    builder_center_verified_at: attendee.builderCenterVerifiedAt ? new Date(attendee.builderCenterVerifiedAt).toISOString() : null,
    checked_in: Boolean(attendee.checkedIn),
    checked_in_at: attendee.checkedInAt ? new Date(attendee.checkedInAt).toISOString() : null,
  };
}

class RegistrationsService {
  // In-memory fallback if Supabase is not connected
  private inMemoryRegistrations: Attendee[] = [
    {
      id: 'riv-26-1082',
      fullName: 'Rushikesh More',
      email: 'rushikesh.more@gmail.com',
      phone: '9822145678',
      builderId: 'andrewbrown',
      college: 'Government College of Engineering, Jalgaon',
      year: '3rd Year',
      status: 'pending',
      registeredAt: Date.now() - 3600000 * 5,
    },
    {
      id: 'riv-26-1094',
      fullName: 'Snehal Jadhav',
      email: 'snehal.jadhav@gmail.com',
      phone: '9765432190',
      builderId: 'davebuildscloud',
      college: 'RCPIT Shirpur',
      year: '4th Year',
      status: 'approved',
      registeredAt: Date.now() - 3600000 * 12,
      reviewedAt: Date.now() - 3600000 * 2,
      reviewedBy: 'Soham Chaudhari (SBG Lead)',
    },
    {
      id: 'riv-26-1120',
      fullName: 'Prathamesh Patil',
      email: 'prathamesh.patil@gmail.com',
      phone: '9423187654',
      builderId: 'fakealias999xyz',
      college: 'SSVPS B.S. Deore College of Engineering, Dhule',
      year: '2nd Year',
      status: 'pending',
      registeredAt: Date.now() - 3600000 * 2,
    },
  ];

  public async getAll(): Promise<Attendee[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('registered_at', { ascending: false });

        if (!error && data) {
          return data.map(rowToAttendee);
        }
        console.error('❌ Supabase getAll error:', error?.message);
      } catch (err: any) {
        console.error('❌ Supabase fetch failed:', err.message);
      }
    }
    return [...this.inMemoryRegistrations];
  }

  public async getById(id: string): Promise<Attendee | undefined> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return rowToAttendee(data);
        }
      } catch (err: any) {
        console.error('❌ Supabase getById failed:', err.message);
      }
    }
    return this.inMemoryRegistrations.find((r) => r.id === id);
  }

  public async getByEmail(email: string): Promise<Attendee | undefined> {
    const cleanEmail = email.toLowerCase().trim();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          return rowToAttendee(data);
        }
      } catch (err: any) {
        console.error('❌ Supabase getByEmail failed:', err.message);
      }
    }
    return this.inMemoryRegistrations.find((r) => r.email.toLowerCase() === cleanEmail);
  }

  public async create(data: Omit<Attendee, 'id' | 'status' | 'registeredAt'> & { id?: string }): Promise<Attendee> {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanBuilderId = data.builderId.trim().toLowerCase().replace(/^@/, '');

    // Check if the user is registered/requested on the AWS Builder Center event page
    const eventCheck = await builderCenterAgentService.checkEventRegistration(cleanBuilderId);

    const newAttendee: Attendee = {
      id: data.id || `riv-26-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      builderId: cleanBuilderId,
      college: data.college.trim(),
      year: data.year || '3rd Year',
      skillLevel: data.skillLevel || 'Beginner',
      interestTrack: data.interestTrack,
      whyJoin: data.whyJoin ? data.whyJoin.trim() : undefined,
      status: 'pending',
      registeredAt: Date.now(),
      builderCenterVerified: eventCheck.isRegistered,
      builderCenterStatus: eventCheck.isRegistered ? 'registered_on_builder_center' : 'not_registered',
      builderCenterVerifiedAt: eventCheck.isRegistered ? Date.now() : undefined,
    };

    if (eventCheck.isRegistered) {
      await builderCenterAgentService.saveAttendee({
        eventId: 'c8a38d77-8262-34c4-b744-ea8dfb7b35a6',
        builderId: cleanBuilderId,
        displayName: eventCheck.displayName || newAttendee.fullName,
        email: cleanEmail,
        rosterType: eventCheck.rosterType || 'request',
        registeredAt: eventCheck.registeredAt || Date.now(),
      });
    }

    if (supabase) {
      try {
        // Prevent duplicate rows for the same alias id (builder_id)
        const { data: existingAliasRecord } = await supabase
          .from('registrations')
          .select('id')
          .ilike('builder_id', cleanBuilderId)
          .maybeSingle();

        if (existingAliasRecord) {
          // Re-use existing ticket ID so alias never creates double rows
          newAttendee.id = existingAliasRecord.id;
        }

        const row = attendeeToRow(newAttendee);
        const { data: inserted, error } = await supabase
          .from('registrations')
          .upsert(row, { onConflict: existingAliasRecord ? 'id' : 'email' })
          .select()
          .single();

        if (!error && inserted) {
          return rowToAttendee(inserted);
        }
        console.error('❌ Supabase upsert error:', error?.message);
      } catch (err: any) {
        console.error('❌ Supabase insert failed:', err.message);
      }
    }

    // In-memory fallback: check both email and alias to prevent double rows
    const existingIndex = this.inMemoryRegistrations.findIndex(
      (r) => r.email.toLowerCase() === cleanEmail || r.builderId.toLowerCase() === cleanBuilderId
    );
    if (existingIndex >= 0) {
      this.inMemoryRegistrations[existingIndex] = {
        ...newAttendee,
        id: this.inMemoryRegistrations[existingIndex].id,
      };
      return this.inMemoryRegistrations[existingIndex];
    }

    this.inMemoryRegistrations.unshift(newAttendee);
    return newAttendee;
  }

  public async updateStatus(id: string, status: RegistrationStatus, reviewedBy?: string): Promise<Attendee | null> {
    const reviewedAt = Date.now();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .update({
            status,
            reviewed_at: reviewedAt,
            reviewed_by: reviewedBy || 'Admin',
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return rowToAttendee(data);
        }
        console.error('❌ Supabase updateStatus error:', error?.message);
      } catch (err: any) {
        console.error('❌ Supabase updateStatus failed:', err.message);
      }
    }

    // In-memory fallback
    const item = this.inMemoryRegistrations.find((r) => r.id === id);
    if (!item) return null;

    item.status = status;
    item.reviewedAt = reviewedAt;
    if (reviewedBy) {
      item.reviewedBy = reviewedBy;
    }
    return item;
  }

  public async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (!error) return true;
      } catch (err: any) {
        console.error('❌ Supabase delete failed:', err.message);
      }
    }
    const initialLen = this.inMemoryRegistrations.length;
    this.inMemoryRegistrations = this.inMemoryRegistrations.filter((r) => r.id !== id);
    return this.inMemoryRegistrations.length < initialLen;
  }

  public async checkIn(id: string, reviewedBy = 'Admin Reception'): Promise<{ success: boolean; attendee?: Attendee; message: string; alreadyCheckedIn?: boolean }> {
    const existing = await this.getById(id);
    if (!existing) {
      return { success: false, message: `Ticket ID "${id}" was not found in the event database.` };
    }

    if (existing.status !== 'approved') {
      return {
        success: false,
        attendee: existing,
        message: `Ticket "${id}" is ${existing.status.toUpperCase()} (Not Approved). Entry Denied.`,
      };
    }

    if (existing.checkedIn) {
      return {
        success: true,
        alreadyCheckedIn: true,
        attendee: existing,
        message: `Already checked in at ${new Date(existing.checkedInAt || Date.now()).toLocaleTimeString()}`,
      };
    }

    const checkInTime = Date.now();
    existing.checkedIn = true;
    existing.checkedInAt = checkInTime;

    if (supabase) {
      try {
        const { data: currentData } = await supabase.from('registrations').select('builder_center_raw').eq('id', id).maybeSingle();
        const updatedRaw = { ...(currentData?.builder_center_raw || {}), checkedIn: true, checkedInAt: checkInTime, checkedInBy: reviewedBy };
        
        // Update dedicated columns with raw metadata fallback
        const updatePayload: Record<string, any> = {
          builder_center_raw: updatedRaw,
          checked_in: true,
          checked_in_at: new Date(checkInTime).toISOString(),
          checked_in_by: reviewedBy,
        };

        const { error: updateErr } = await supabase.from('registrations').update(updatePayload).eq('id', id);
        if (updateErr) {
          // Fallback if dedicated columns not migrated yet in Supabase
          await supabase.from('registrations').update({ builder_center_raw: updatedRaw }).eq('id', id);
        }
      } catch (err: any) {
        console.warn('⚠️ [Registrations Service] Supabase check-in error:', err.message);
      }
    }

    return {
      success: true,
      alreadyCheckedIn: false,
      attendee: existing,
      message: `Checked in successfully! Welcome, ${existing.fullName}!`,
    };
  }

  public async verifyAwsBuilderAlias(alias: string, force = false) {
    const clean = alias.replace(/^@/, '').trim().toLowerCase();
    if (!clean) {
      return { status: 'idle', alias: '', error: 'Alias is required' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('https://api.builder.aws.com/ums/getProfileByAlias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://builder.aws.com',
          Referer: 'https://builder.aws.com/',
        },
        body: JSON.stringify({ alias: clean }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 200) {
        const data = (await response.json()) as any;
        const basic = data?.profile?.basicInfo;
        const programs = (data?.profile?.awsPrograms || [])
          .map((p: any) => p?.programName || p?.category || '')
          .filter(Boolean);

        // Check live event RSVP/request on Builder Center
        const eventCheck = await builderCenterAgentService.checkEventRegistration(clean, force);

        return {
          status: 'valid' as const,
          alias: clean,
          displayName: basic?.displayName || clean,
          avatar: basic?.avatar,
          bio: basic?.bio,
          programs,
          hasEventRegistration: eventCheck.isRegistered,
          eventRegistrationStatus: eventCheck.isRegistered ? ('registered_on_builder_center' as const) : ('not_registered' as const),
          message: eventCheck.isRegistered
            ? 'We found that you have registered on Builder Center!'
            : "We couldn't find your registration on AWS Builder Center for this event. Please register first on the Builder Center, then come back here.",
        };
      }

      return {
        status: 'invalid',
        alias: clean,
        error: 'No profile found on AWS Builder Center (404)',
      };
    } catch (err: any) {
      return {
        status: 'invalid',
        alias: clean,
        error: `Could not verify: ${err.message || 'Network error'}`,
      };
    }
  }
}

export const registrationsService = new RegistrationsService();
