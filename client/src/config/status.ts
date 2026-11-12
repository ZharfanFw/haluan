import { ApplicationStatus, WorkMode } from '../types';

export interface StatusConfig {
  status: ApplicationStatus;
  label: string;
  /** Badge used on cards/rows showing this status */
  badgeClass: string;
  /** Small colored dot used in column headers and stat cards */
  dotColor: string;
  /** Border color when the stat card is selected as filter */
  activeBorder: string;
}

export const STATUS_CONFIG: StatusConfig[] = [
  {
    status: 'wishlist',
    label: 'Wishlist',
    badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dotColor: 'bg-zinc-400',
    activeBorder: 'border-zinc-400',
  },
  {
    status: 'applied',
    label: 'Applied',
    badgeClass: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
    dotColor: 'bg-blue-400',
    activeBorder: 'border-blue-500',
  },
  {
    status: 'interviewing',
    label: 'Interviewing',
    badgeClass: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    dotColor: 'bg-amber-400',
    activeBorder: 'border-amber-500',
  },
  {
    status: 'offer',
    label: 'Offer',
    badgeClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    dotColor: 'bg-emerald-400',
    activeBorder: 'border-emerald-500',
  },
  {
    status: 'rejected',
    label: 'Rejected',
    badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    dotColor: 'bg-rose-400',
    activeBorder: 'border-rose-500',
  },
];

export const STATUS_MAP: Record<ApplicationStatus, StatusConfig> = Object.fromEntries(
  STATUS_CONFIG.map((config) => [config.status, config])
) as Record<ApplicationStatus, StatusConfig>;

export const NEXT_STAGE_MAP: Record<ApplicationStatus, ApplicationStatus | null> = {
  wishlist: 'applied',
  applied: 'interviewing',
  interviewing: 'offer',
  offer: null,
  rejected: null,
};

export interface WorkModeConfig {
  mode: WorkMode;
  label: string;
}

export const WORK_MODE_OPTIONS: WorkModeConfig[] = [
  { mode: 'remote', label: 'Remote' },
  { mode: 'hybrid', label: 'Hybrid' },
  { mode: 'onsite', label: 'On-site' },
];
