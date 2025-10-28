import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface DebugConfigResponse {
  llm_provider: string;
  mcp_transport: string;
}

export type ContentType = 'blog' | 'social' | 'email' | 'ad_copy' | 'landing_page';
export type ContentTone = 'professional' | 'casual' | 'friendly' | 'formal' | 'humorous' | 'urgent';

export interface ContentGenerationRequest {
  content_type: ContentType;
  topic: string;
  tone: ContentTone;
  length: number;
  additional_context?: string;
  user_id?: number;
}

export interface ContentGenerationResponse {
  id: number;
  content_type: string;
  topic: string;
  tone: string;
  length: number;
  generated_text: string;
  llm_provider: string;
  model_used: string;
  tokens_used: number | null;
  generation_time: number | null;
  created_at: string;
}

export interface GeneratedContentList {
  items: ContentGenerationResponse[];
  total: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: number;
  user_id: number;
  title: string;
  config: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ReportCreate {
  user_id: number;
  title: string;
  config: any;
}

export const api = {
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data;
  },

  debugConfig: async (): Promise<DebugConfigResponse> => {
    const response = await apiClient.get<DebugConfigResponse>('/api/debug/config');
    return response.data;
  },

  generateContent: async (request: ContentGenerationRequest): Promise<ContentGenerationResponse> => {
    const response = await apiClient.post<ContentGenerationResponse>('/api/generate-content', request);
    return response.data;
  },

  listGeneratedContent: async (skip: number = 0, limit: number = 20): Promise<GeneratedContentList> => {
    const response = await apiClient.get<GeneratedContentList>('/api/generated-content', {
      params: { skip, limit }
    });
    return response.data;
  },

  getGeneratedContent: async (id: number): Promise<ContentGenerationResponse> => {
    const response = await apiClient.get<ContentGenerationResponse>(`/api/generated-content/${id}`);
    return response.data;
  },

  // User authentication endpoints
  register: async (username: string, email: string): Promise<User> => {
    const response = await apiClient.post<User>('/api/users/register', { username, email });
    return response.data;
  },

  login: async (username: string): Promise<User> => {
    const response = await apiClient.post<User>('/api/users/login', { username });
    return response.data;
  },

  getCurrentUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/me/${userId}`);
    return response.data;
  },

  getUserStats: async (userId: number): Promise<{ total_reports: number; active_reports: number; completed_reports: number }> => {
    const response = await apiClient.get(`/api/users/${userId}/stats`);
    return response.data;
  },

  // Report management endpoints
  createReport: async (reportData: ReportCreate): Promise<Report> => {
    const response = await apiClient.post<Report>('/api/reports', reportData);
    return response.data;
  },

  getUserReports: async (userId: number, skip: number = 0, limit: number = 50): Promise<Report[]> => {
    const response = await apiClient.get<Report[]>(`/api/reports/user/${userId}`, {
      params: { skip, limit }
    });
    return response.data;
  },

  getReport: async (reportId: number): Promise<Report> => {
    const response = await apiClient.get<Report>(`/api/reports/${reportId}`);
    return response.data;
  },

  deleteReport: async (reportId: number, userId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/reports/${reportId}`, {
      params: { user_id: userId }
    });
    return response.data;
  },

  // Blueprint Generation
  generateBlueprint: async (request: {
    reportType: string;
    selectedDataPoints: string[];
    additionalNotes?: string;
  }): Promise<{
    blueprint: any;
    success: boolean;
    error?: string;
  }> => {
    const response = await apiClient.post('/api/blueprint/generate', request);
    return response.data;
  },
};

export default api;
