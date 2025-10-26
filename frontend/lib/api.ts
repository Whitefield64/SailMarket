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
};

export default apiClient;
