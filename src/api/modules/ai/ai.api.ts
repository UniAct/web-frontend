import { httpClient } from '../../core/http-client';
import type {
  AiChatRequest,
  AiChatResponse,
  AiExamResponse,
  AiHealth,
  AiIndexInfo,
  AiMindMapResponse,
  AiProjectChapters,
  AiProjectFiles,
  AiSearchResponse,
  AiSessionHistory,
  AiSessionList,
  AiStudyData,
  AiStudyFiles,
  AiSummaryResponse,
  AiSyncResult,
  ApiResponse,
} from '../../types';

export const aiApi = {
  health(): Promise<ApiResponse<AiHealth>> {
    return httpClient.request<AiHealth>('GET', '/ai/health', undefined, {
      requireResolvedTenant: true,
    });
  },

  getFiles(groupId: number): Promise<ApiResponse<AiProjectFiles>> {
    return httpClient.request<AiProjectFiles>('GET', `/ai/groups/${groupId}/files`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getChapters(groupId: number): Promise<ApiResponse<AiProjectChapters>> {
    return httpClient.request<AiProjectChapters>('GET', `/ai/groups/${groupId}/chapters`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getIndexInfo(groupId: number): Promise<ApiResponse<AiIndexInfo>> {
    return httpClient.request<AiIndexInfo>('GET', `/ai/groups/${groupId}/index`, undefined, {
      requireResolvedTenant: true,
    });
  },

  syncGroupMaterials(groupId: number): Promise<ApiResponse<AiSyncResult>> {
    return httpClient.request<AiSyncResult>('POST', `/ai/groups/${groupId}/sync`, undefined, {
      requireResolvedTenant: true,
    });
  },

  listSessions(groupId: number): Promise<ApiResponse<AiSessionList>> {
    return httpClient.request<AiSessionList>('GET', `/ai/groups/${groupId}/sessions`, undefined, {
      requireResolvedTenant: true,
    });
  },

  createSession(groupId: number, title?: string): Promise<ApiResponse<{ session_id: string; signal: string }>> {
    return httpClient.request<{ session_id: string; signal: string }>('POST', `/ai/groups/${groupId}/sessions`, { title }, {
      requireResolvedTenant: true,
    });
  },

  getSessionHistory(sessionId: string): Promise<ApiResponse<AiSessionHistory>> {
    return httpClient.request<AiSessionHistory>('GET', `/ai/sessions/${encodeURIComponent(sessionId)}/history`, undefined, {
      requireResolvedTenant: true,
    });
  },

  chat(groupId: number, input: AiChatRequest): Promise<ApiResponse<AiChatResponse>> {
    return httpClient.request<AiChatResponse>('POST', `/ai/groups/${groupId}/chat`, input, {
      requireResolvedTenant: true,
    });
  },

  search(groupId: number, input: { text: string; limit?: number; chapters?: string[]; file_chapter_filters?: Array<{ file_id: string; chapter_title: string }> }): Promise<ApiResponse<AiSearchResponse>> {
    return httpClient.request<AiSearchResponse>('POST', `/ai/groups/${groupId}/search`, input, {
      requireResolvedTenant: true,
    });
  },

  summarize(groupId: number, content = ''): Promise<ApiResponse<AiSummaryResponse>> {
    return httpClient.request<AiSummaryResponse>('POST', `/ai/groups/${groupId}/summarize`, { content }, {
      requireResolvedTenant: true,
    });
  },

  exam(groupId: number, input: { content?: string; difficulty?: string; num_mcq?: number; num_written?: number }): Promise<ApiResponse<AiExamResponse>> {
    return httpClient.request<AiExamResponse>('POST', `/ai/groups/${groupId}/exam`, input, {
      requireResolvedTenant: true,
    });
  },

  mindmap(groupId: number, content = ''): Promise<ApiResponse<AiMindMapResponse>> {
    return httpClient.request<AiMindMapResponse>('POST', `/ai/groups/${groupId}/mindmap`, { content }, {
      requireResolvedTenant: true,
    });
  },

  listStudyFiles(groupId: number): Promise<ApiResponse<AiStudyFiles>> {
    return httpClient.request<AiStudyFiles>('GET', `/ai/groups/${groupId}/study/files`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getStudyData(groupId: number, fileId: string): Promise<ApiResponse<AiStudyData>> {
    return httpClient.request<AiStudyData>('GET', `/ai/groups/${groupId}/study/files/${encodeURIComponent(fileId)}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  saveStudyData(groupId: number, fileId: string, input: AiStudyData): Promise<ApiResponse<{ signal: string }>> {
    return httpClient.request<{ signal: string }>('POST', `/ai/groups/${groupId}/study/files/${encodeURIComponent(fileId)}`, input, {
      requireResolvedTenant: true,
    });
  },
};
