export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface Application {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  work_mode: WorkMode;
  location: string | null;
  salary: string | null;
  job_url: string | null;
  applied_date: string;
  interview_date: string | null;
  contact_info: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export interface CreateApplicationDto {
  company: string;
  role: string;
  status?: ApplicationStatus;
  work_mode?: WorkMode;
  location?: string | null;
  salary?: string | null;
  job_url?: string | null;
  applied_date?: string;
  interview_date?: string | null;
  contact_info?: string | null;
  notes?: string | null;
}

export interface UpdateApplicationDto {
  company?: string;
  role?: string;
  status?: ApplicationStatus;
  work_mode?: WorkMode;
  location?: string | null;
  salary?: string | null;
  job_url?: string | null;
  applied_date?: string;
  interview_date?: string | null;
  contact_info?: string | null;
  notes?: string | null;
}

export interface ApplicationStats {
  total: number;
  wishlist: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
}
