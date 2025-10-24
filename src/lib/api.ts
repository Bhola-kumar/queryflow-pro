// Mock API client with hardcoded dummy data
import { User, DocumentItem, RoleRequest, AnalyticsData, Publisher } from '@/types';

// Dummy data
const DUMMY_PUBLISHERS: Publisher[] = [
  { id: 'pub1', name: 'Tech Publishing', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'pub2', name: 'Science Daily', created_at: '2024-01-02', updated_at: '2024-01-02' },
  { id: 'pub3', name: 'News Corp', created_at: '2024-01-03', updated_at: '2024-01-03' },
];

const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    publisher_id: 'pub1',
    username: 'john_doe',
    email: 'john@example.com',
    full_name: 'John Doe',
    role: 'user',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'user2',
    publisher_id: 'pub1',
    username: 'admin_user',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: 'user3',
    publisher_id: 'pub1',
    username: 'super_admin',
    email: 'superadmin@example.com',
    full_name: 'Super Admin',
    role: 'superadmin',
    is_active: true,
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
];

const DUMMY_TEMPLATES: DocumentItem[] = [
  {
    id: 'temp1',
    publisher_id: 'pub1',
    doc_name: 'Product Launch Press Release',
    query_type: 'Press Release',
    specific_query_heading: 'Technology',
    template_text: 'FOR IMMEDIATE RELEASE\n\n[Company Name] Announces Revolutionary [Product Name]\n\n[City, Date] - [Company] today unveiled [product], marking a significant milestone in [industry]...',
    created_by: 'user2',
    created_at: '2024-01-15',
    modified_by: null,
    modified_at: '2024-01-15',
  },
  {
    id: 'temp2',
    publisher_id: 'pub1',
    doc_name: 'Customer Complaint Response',
    query_type: 'Email Template',
    specific_query_heading: 'Customer Service',
    template_text: 'Dear [Customer Name],\n\nThank you for bringing this matter to our attention. We sincerely apologize for any inconvenience caused...',
    created_by: 'user2',
    created_at: '2024-01-16',
    modified_by: null,
    modified_at: '2024-01-16',
  },
  {
    id: 'temp3',
    publisher_id: 'pub2',
    doc_name: 'Meeting Minutes Template',
    query_type: 'Document',
    specific_query_heading: 'Administrative',
    template_text: 'MEETING MINUTES\n\nDate: [Date]\nTime: [Time]\nAttendees: [List]\n\nAgenda Items:\n1. [Item 1]\n2. [Item 2]...',
    created_by: 'user2',
    created_at: '2024-01-17',
    modified_by: null,
    modified_at: '2024-01-17',
  },
  {
    id: 'temp4',
    publisher_id: 'pub1',
    doc_name: 'Social Media Post - Product',
    query_type: 'Social Media',
    specific_query_heading: 'Marketing',
    template_text: '🚀 Exciting news! [Product Name] is here to revolutionize the way you [benefit].\n\n✨ Key features:\n• [Feature 1]\n• [Feature 2]\n\nLearn more: [link]',
    created_by: 'user2',
    created_at: '2024-01-18',
    modified_by: null,
    modified_at: '2024-01-18',
  },
];

const DUMMY_ROLE_REQUESTS: RoleRequest[] = [
  {
    id: 'req1',
    user_id: 'user1',
    requested_role: 'admin',
    requested_publisher_id: 'pub1',
    status: 'pending',
    requested_at: '2024-01-20',
    user: DUMMY_USERS[0],
  },
  {
    id: 'req2',
    user_id: 'user4',
    requested_role: 'admin',
    requested_publisher_id: 'pub2',
    status: 'approved',
    requested_at: '2024-01-18',
    reviewed_by: 'user3',
    reviewed_at: '2024-01-19',
  },
];

const DUMMY_ANALYTICS: AnalyticsData = {
  total_users: 25,
  total_templates: 48,
  total_copies: 1250,
  top_templates: [
    { document_item_id: 'temp1', doc_name: 'Product Launch Press Release', total_copies: 450 },
    { document_item_id: 'temp2', doc_name: 'Customer Complaint Response', total_copies: 320 },
    { document_item_id: 'temp4', doc_name: 'Social Media Post - Product', total_copies: 280 },
    { document_item_id: 'temp3', doc_name: 'Meeting Minutes Template', total_copies: 200 },
  ],
};

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('mock_user', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('mock_user');
  }

  // Mock delay to simulate API call
  private async mockDelay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  // Auth endpoints
  async googleAuth(idToken: string): Promise<{ token: string; user: User }> {
    await this.mockDelay();
    // Simulate different user roles based on email pattern
    let user: User;
    if (idToken.includes('superadmin')) {
      user = DUMMY_USERS[2];
    } else if (idToken.includes('admin')) {
      user = DUMMY_USERS[1];
    } else {
      user = DUMMY_USERS[0];
    }
    return { token: user.id, user };
  }

  async getCurrentUser(): Promise<User> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async logout() {
    this.clearToken();
  }

  // Templates endpoints
  async getTemplates(): Promise<DocumentItem[]> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    
    if (user?.role === 'superadmin') {
      return DUMMY_TEMPLATES;
    }
    
    // Filter by publisher for admin/user
    return DUMMY_TEMPLATES.filter(t => t.publisher_id === user?.publisher_id);
  }

  async getTemplate(id: string): Promise<DocumentItem> {
    await this.mockDelay();
    const template = DUMMY_TEMPLATES.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    return template;
  }

  async copyTemplate(templateId: string): Promise<void> {
    await this.mockDelay();
    console.log('Template copied:', templateId);
  }

  async createTemplate(data: { doc_name: string; query_type: string; template_text: string; specific_query_heading?: string }): Promise<DocumentItem> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    
    const newTemplate: DocumentItem = {
      id: `temp${Date.now()}`,
      publisher_id: user?.publisher_id || 'pub1',
      doc_name: data.doc_name,
      query_type: data.query_type,
      specific_query_heading: data.specific_query_heading,
      template_text: data.template_text,
      created_by: userId || 'user2',
      created_at: new Date().toISOString(),
      modified_by: null,
      modified_at: new Date().toISOString(),
    };
    
    DUMMY_TEMPLATES.push(newTemplate);
    return newTemplate;
  }

  // Role requests endpoints
  async createRoleRequest(data: { requested_role: string; requested_publisher_id?: string }): Promise<RoleRequest> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    
    const newRequest: RoleRequest = {
      id: `req${Date.now()}`,
      user_id: userId || 'user1',
      requested_role: data.requested_role as any,
      requested_publisher_id: data.requested_publisher_id,
      status: 'pending',
      requested_at: new Date().toISOString(),
      user,
    };
    
    DUMMY_ROLE_REQUESTS.push(newRequest);
    return newRequest;
  }

  async getRoleRequests(): Promise<RoleRequest[]> {
    await this.mockDelay();
    return DUMMY_ROLE_REQUESTS;
  }

  async updateRoleRequest(id: string, status: 'approved' | 'rejected'): Promise<void> {
    await this.mockDelay();
    const request = DUMMY_ROLE_REQUESTS.find(r => r.id === id);
    if (request) {
      request.status = status;
      request.reviewed_at = new Date().toISOString();
      request.reviewed_by = this.getToken() || 'user3';
    }
  }

  // Analytics endpoints
  async getAnalytics(): Promise<AnalyticsData> {
    await this.mockDelay();
    return DUMMY_ANALYTICS;
  }

  async getUserActivity(): Promise<any> {
    await this.mockDelay();
    return { activities: [] };
  }

  // User management endpoints
  async getUsers(): Promise<User[]> {
    await this.mockDelay();
    return DUMMY_USERS;
  }

  async getPublishers(): Promise<Publisher[]> {
    await this.mockDelay();
    return DUMMY_PUBLISHERS;
  }
}

export const apiClient = new ApiClient();
