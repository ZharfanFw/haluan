export const VALID_STATUSES = ['wishlist', 'applied', 'interviewing', 'offer', 'rejected'] as const;
export const VALID_WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;
export const ALLOWED_SORT_FIELDS = ['applied_date', 'created_at', 'company', 'status'] as const;
export const DEFAULT_SORT_FIELD = 'applied_date';
