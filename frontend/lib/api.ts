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

export const api = {
  health: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/api/health');
    return response.data;
  },

  debugConfig: async (): Promise<DebugConfigResponse> => {
    const response = await apiClient.get<DebugConfigResponse>('/api/debug/config');
    return response.data;
  },
};

export default apiClient;
