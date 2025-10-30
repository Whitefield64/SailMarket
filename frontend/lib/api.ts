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

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  // Core identification
  id: number;
  user_id: number;

  // Report metadata
  report_type?: string;
  title: string;
  status: string;

  // Generation metadata
  llm_provider?: string;
  model_used?: string;
  tokens_used?: number;
  generation_time?: number;

  // Report content and structure
  form_selections?: any;
  blueprint?: any;
  prompt_used?: string;
  generated_content?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Error handling
  error_message?: string;
}

export interface ReportCreate {
  user_id: number;
  title: string;
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
    analysisSubject: string;
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

  // Report Generation from Blueprint
  generateReportFromBlueprint: async (request: {
    user_id: number;
    blueprint: any;
    form_selections: any;
  }): Promise<{
    report_id: number;
    status: string;
    message: string;
  }> => {
    const response = await apiClient.post('/api/reports/generate', request);
    return response.data;
  },
};

export default api;
