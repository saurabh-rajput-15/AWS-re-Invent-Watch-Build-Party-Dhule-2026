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

export type TrackCategory = 'all' | 'keynote' | 'build' | 'workshop';

export interface AgendaSession {
  id: string;
  time: string;
  title: string;
  category: TrackCategory;
  categoryLabel: string;
  speaker: string;
  speakerRole: string;
  description: string;
  location: string;
  prerequisites?: string[];
  accentColor: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  topic: string;
  avatarSeed: string;
  tags: string[];
  linkedin?: string;
  github?: string;
  accent: string;
  image?: string;
  isAnnouncingSoon?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
