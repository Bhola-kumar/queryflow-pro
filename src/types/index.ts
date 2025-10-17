export type Role = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  publisher_id: string;
  username: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  publisher_id: string;
  doc_name: string;
  query_type: string;
  specific_query_heading: string | null;
  template_text: string;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string;
}

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: Role;
  requested_publisher_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  user?: User;
}

export interface UserTemplateActivity {
  user_id: string;
  document_item_id: string;
  publisher_id: string;
  copied_count: number;
  first_copied_at: string;
  last_copied_at: string;
  last_template_snapshot: any;
}

export interface AnalyticsData {
  total_users: number;
  total_templates: number;
  total_copies: number;
  top_templates: Array<{
    document_item_id: string;
    doc_name: string;
    total_copies: number;
  }>;
}
