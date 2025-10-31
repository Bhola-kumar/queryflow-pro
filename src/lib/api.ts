// API client with localStorage persistence
import { User, DocumentItem, RoleRequest, AnalyticsData, Publisher } from '@/types';
import documentTemplatesData from "../data/document_templates.json" assert { type: "json" };
// Dummy data
const DUMMY_PUBLISHERS: Publisher[] = [
  { id: '4fe8719c-5687-4a82-9219-96951d0b5c2a', name: 'Elsevier RS', created_at: '2025-10-17', updated_at: '2025-10-17' },
  { id: 'pub2', name: 'Cengage', created_at: '2025-10-17', updated_at: '2025-10-17' },
  { id: 'pub3', name: 'Elsevier Scopus', created_at: '2025-10-17', updated_at: '2025-10-17' },
];

const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
    username: 'john_doe',
    email: 'john@example.com',
    full_name: 'John Doe',
    role: 'user',
    is_active: true,
    created_at: '2024-10-29',
    updated_at: '2024-10-29',
  },
  {
    id: 'user2',
    publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
    username: 'admin_user',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: '2024-10-29',
    updated_at: '2024-10-29',
  },
  {
    id: 'user3',
    publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
    username: 'super_admin',
    email: 'superadmin@example.com',
    full_name: 'Super Admin',
    role: 'superadmin',
    is_active: true,
    created_at: '2024-10-29',
    updated_at: '2024-10-29',
  },
];

// const DUMMY_TEMPLATES: DocumentItem[] = [
//   {
//     id: 'temp1',
//     publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
//     doc_name: 'Product Launch Press Release',
//     query_type: 'Press Release',
//     specific_query_heading: 'Technology',
//     template_text: 'FOR IMMEDIATE RELEASE\n\n[Company Name] Announces Revolutionary [Product Name]\n\n[City, Date] - [Company] today unveiled [product], marking a significant milestone in [industry]...',
//     created_by: 'user2',
//     created_at: '2024-01-15',
//     modified_by: null,
//     modified_at: '2024-01-15',
//   },
//   {
//     id: 'temp2',
//     publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
//     doc_name: 'Customer Complaint Response',
//     query_type: 'Email Template',
//     specific_query_heading: 'Customer Service',
//     template_text: 'Dear [Customer Name],\n\nThank you for bringing this matter to our attention. We sincerely apologize for any inconvenience caused...',
//     created_by: 'user2',
//     created_at: '2024-01-16',
//     modified_by: null,
//     modified_at: '2024-01-16',
//   },
//   {
//     id: 'temp3',
//     publisher_id: 'pub2',
//     doc_name: 'Meeting Minutes Template',
//     query_type: 'Document',
//     specific_query_heading: 'Administrative',
//     template_text: 'MEETING MINUTES\n\nDate: [Date]\nTime: [Time]\nAttendees: [List]\n\nAgenda Items:\n1. [Item 1]\n2. [Item 2]...',
//     created_by: 'user2',
//     created_at: '2024-01-17',
//     modified_by: null,
//     modified_at: '2024-01-17',
//   },
//   {
//     id: 'temp4',
//     publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
//     doc_name: 'Social Media Post - Product',
//     query_type: 'Social Media',
//     specific_query_heading: 'Marketing',
//     template_text: '🚀 Exciting news! [Product Name] is here to revolutionize the way you [benefit].\n\n✨ Key features:\n• [Feature 1]\n• [Feature 2]\n\nLearn more: [link]',
//     created_by: 'user2',
//     created_at: '2024-01-18',
//     modified_by: null,
//     modified_at: '2024-01-18',
//   },
// ];

// Storage helper functions
const getStorageKey = (key: string) => `query_template_tool_${key}`;

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(getStorageKey(key));
  return stored ? JSON.parse(stored) : defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(getStorageKey(key), JSON.stringify(data));
};

// Initialize templates from JSON file and merge with localStorage
const initializeTemplates = (): DocumentItem[] => {
  const storedTemplates = loadFromStorage<DocumentItem[]>('templates', []);
  const templateMap = new Map<string, DocumentItem>();
  
  // Add default templates from JSON
  documentTemplatesData.forEach(t => templateMap.set(t.id, t));
  
  // Override with stored templates (user-created or modified)
  storedTemplates.forEach(t => templateMap.set(t.id, t));
  
  return Array.from(templateMap.values());
};

const DUMMY_TEMPLATES = initializeTemplates();
// Initialize data from localStorage
const DUMMY_ROLE_REQUESTS = loadFromStorage<RoleRequest[]>('role_requests', [
  {
    id: 'req1',
    user_id: 'user1',
    requested_role: 'admin',
    requested_publisher_id: '4fe8719c-5687-4a82-9219-96951d0b5c2a',
    status: 'pending',
    requested_at: '2024-01-20',
    user: DUMMY_USERS[0],
  },
]);

const getAnalyticsData = (): AnalyticsData => {
  const templates = DUMMY_TEMPLATES;
  return loadFromStorage<AnalyticsData>('analytics', {
    total_users: 1,
    total_templates: templates.length,
    total_copies: 0,
    top_templates: templates.slice(0, 4).map(t => ({
      document_item_id: t.id,
      doc_name: t.doc_name,
      total_copies: 0,
    })),
  });
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
    
    // Update analytics
    const analytics = getAnalyticsData();
    analytics.total_copies += 1;
    
    const templateStat = analytics.top_templates.find(t => t.document_item_id === templateId);
    if (templateStat) {
      templateStat.total_copies += 1;
    }
    
    saveToStorage('analytics', analytics);
  }

  async createTemplate(data: { doc_name: string; query_type: string; template_text: string; specific_query_heading?: string }): Promise<DocumentItem> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    
    const newTemplate: DocumentItem = {
      id: `temp${Date.now()}`,
      publisher_id: user?.publisher_id || '4fe8719c-5687-4a82-9219-96951d0b5c2a',
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
    saveToStorage('templates', DUMMY_TEMPLATES);
    
    // Update analytics
    const analytics = getAnalyticsData();
    analytics.total_templates += 1;
    saveToStorage('analytics', analytics);
    
    return newTemplate;
  }

  async updateTemplate(id: string, data: { doc_name: string; query_type: string; template_text: string; specific_query_heading?: string }): Promise<DocumentItem> {
    await this.mockDelay();
    const userId = this.getToken();
    const templateIndex = DUMMY_TEMPLATES.findIndex(t => t.id === id);
    
    if (templateIndex === -1) throw new Error('Template not found');
    
    DUMMY_TEMPLATES[templateIndex] = {
      ...DUMMY_TEMPLATES[templateIndex],
      doc_name: data.doc_name,
      query_type: data.query_type,
      specific_query_heading: data.specific_query_heading,
      template_text: data.template_text,
      modified_by: userId,
      modified_at: new Date().toISOString(),
    };
    
    saveToStorage('templates', DUMMY_TEMPLATES);
    return DUMMY_TEMPLATES[templateIndex];
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.mockDelay();
    const templateIndex = DUMMY_TEMPLATES.findIndex(t => t.id === id);
    if (templateIndex === -1) throw new Error('Template not found');
    DUMMY_TEMPLATES.splice(templateIndex, 1);
    saveToStorage('templates', DUMMY_TEMPLATES);
    
    // Update analytics
    const analytics = getAnalyticsData();
    analytics.total_templates = DUMMY_TEMPLATES.length;
    saveToStorage('analytics', analytics);
  }

  // Role requests endpoints
  async createRoleRequest(data: { requested_role: string; requested_publisher_id?: string }): Promise<RoleRequest> {
    await this.mockDelay();
    const userId = this.getToken();
    const user = DUMMY_USERS.find(u => u.id === userId);
    
    const newRequest: RoleRequest = {
      id: `req${Date.now()}`,
      user_id: userId || 'user1',
      requested_role: data.requested_role as 'user' | 'admin' | 'superadmin',
      requested_publisher_id: data.requested_publisher_id,
      status: 'pending',
      requested_at: new Date().toISOString(),
      user,
    };
    
    DUMMY_ROLE_REQUESTS.push(newRequest);
    saveToStorage('role_requests', DUMMY_ROLE_REQUESTS);
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
      saveToStorage('role_requests', DUMMY_ROLE_REQUESTS);
    }
  }

  // Analytics endpoints
  async getAnalytics(): Promise<AnalyticsData> {
    await this.mockDelay();
    return getAnalyticsData();
  }

  async getUserActivity(): Promise<{ activities: [] }> {
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
