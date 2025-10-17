// API client for connecting to your backend
// Replace API_BASE_URL with your actual backend URL

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
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
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async googleAuth(idToken: string) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    this.clearToken();
  }

  // Templates endpoints
  async getTemplates() {
    return this.request('/templates');
  }

  async getTemplate(id: string) {
    return this.request(`/templates/${id}`);
  }

  async copyTemplate(templateId: string) {
    return this.request(`/templates/${templateId}/copy`, {
      method: 'POST',
    });
  }

  // Role requests endpoints
  async createRoleRequest(data: { requested_role: string; requested_publisher_id?: string }) {
    return this.request('/role-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRoleRequests() {
    return this.request('/role-requests');
  }

  async updateRoleRequest(id: string, status: 'approved' | 'rejected') {
    return this.request(`/role-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Analytics endpoints
  async getAnalytics() {
    return this.request('/analytics');
  }

  async getUserActivity() {
    return this.request('/analytics/activity');
  }

  // User management endpoints (admin/superadmin)
  async getUsers() {
    return this.request('/users');
  }

  async getPublishers() {
    return this.request('/publishers');
  }
}

export const apiClient = new ApiClient();
