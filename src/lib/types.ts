// ============ User & Auth Types ============

export type UserRole = 'admin' | 'hr';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email?: string | null;
  phone: string;
  avatar_url?: string | null;
  role_id: number;
  role?: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: Profile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
}

export interface Session {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  user_id: string;
}

// ============ Applicant Types ============

export type ApplicantStatus =
  | 'pending'
  | 'on_hold'
  | 'accepted'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'selected'
  | 'document_collection'
  | 'documents_received'
  | 'documents_verified'
  | 'workspace_created'
  | 'rejected';

export interface Applicant {
  id: string;
  hr_id: string;
  google_sheet_row: number | null;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string | null;
  additional_data: Record<string, unknown> | null;
  status: ApplicantStatus;
  interview_date: string | null;
  interview_time: string | null;
  meet_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Interview Types ============

export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Interview {
  id: string;
  applicant_id: string;
  hr_id: string;
  interview_date: string;
  interview_time: string;
  meet_link: string;
  calendar_event_id: string | null;
  status: InterviewStatus;
  reminder_sent: boolean;
  completed_at: string | null;
  created_at: string;
}

// ============ HR Request Types ============

export type RequestType = 'new_account' | 'password_reset';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface HRRequest {
  id: string;
  username: string;
  request_type: RequestType;
  status: RequestStatus;
  admin_id: string | null;
  rejection_reason: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ============ Document Types ============

export type DocumentStatus = 'pending' | 'received' | 'verified' | 'rejected';

export interface Document {
  id: string;
  applicant_id: string;
  document_type_id: number;
  document_type_name?: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  uploaded_at: string;
}

// ============ Workspace Types ============

export interface Workspace {
  id: string;
  applicant_id: string;
  folder_id: string;
  folder_url: string;
  sheet_id: string;
  sheet_url: string;
  created_by: string;
  created_at: string;
}

// ============ Notification Types ============

export type NotificationType =
  | 'interview_reminder'
  | 'documents_received'
  | 'documents_verified'
  | 'workspace_created'
  | 'hr_request_pending'
  | 'hr_request_approved'
  | 'hr_request_rejected';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ============ Status History Types ============

export interface StatusHistory {
  id: string;
  applicant_id: string;
  old_status: ApplicantStatus | null;
  new_status: ApplicantStatus;
  changed_by: string;
  changed_by_name?: string;
  notes: string | null;
  created_at: string;
}

// ============ Sync Log Types ============

export type SyncStatus = 'running' | 'completed' | 'failed';

export interface SyncLog {
  id: string;
  hr_id: string | null;
  sheet_url: string;
  rows_read: number;
  new_applicants: number;
  status: SyncStatus;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

// ============ Component Props ============

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export interface StatsCardData {
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
  trend?: { direction: 'up' | 'down'; value: string };
}

// ============ Form Types ============

export interface SignInFormData {
  username: string;
  password: string;
}

export interface CreateHRFormData {
  full_name: string;
  email?: string;
  phone: string;
  username: string;
  password: string;
  avatar_url?: string;
}

export interface EditHRFormData {
  full_name: string;
  email?: string;
  phone: string;
  username: string;
  avatar_url?: string;
}

export interface RequestAccessFormData {
  username: string;
}

export interface ScheduleInterviewFormData {
  date: string;
  time: string;
}

export interface UploadDocumentFormData {
  agreement_letter: File | null;
  aadhaar_card: File | null;
  marksheet: File | null;
}

// ============ API Response Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ Status Config ============

export const STATUS_CONFIG: Record<ApplicantStatus, {
  label: string;
  variant: 'pending' | 'active' | 'completed' | 'danger' | 'hold' | 'scheduled' | 'info';
}> = {
  pending: { label: 'Pending Review', variant: 'pending' },
  on_hold: { label: 'On Hold', variant: 'hold' },
  accepted: { label: 'Accepted', variant: 'active' },
  interview_scheduled: { label: 'Interview Scheduled', variant: 'scheduled' },
  interview_completed: { label: 'Interview Completed', variant: 'info' },
  selected: { label: 'Selected', variant: 'completed' },
  document_collection: { label: 'Document Collection', variant: 'pending' },
  documents_received: { label: 'Documents Received', variant: 'info' },
  documents_verified: { label: 'Documents Verified', variant: 'completed' },
  workspace_created: { label: 'Workspace Created', variant: 'active' },
  rejected: { label: 'Rejected', variant: 'danger' },
};
