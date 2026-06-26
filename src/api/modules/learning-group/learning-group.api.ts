import { httpClient } from '../../core/http-client';
import type {
  ApiResponse,
  CreateLearningGroupPostInput,
  LearningGroupComment,
  LearningGroupDetails,
  LearningGroupMember,
  LearningGroupPost,
  LearningGroupPostPage,
  LearningGroupPostType,
  LearningGroupSummary,
} from '../../types';

function buildPostForm(input: CreateLearningGroupPostInput): FormData {
  const form = new FormData();
  form.append('postType', input.postType);
  if (input.content) form.append('content', input.content);
  if (input.dueDate) form.append('dueDate', input.dueDate);
  input.files?.forEach((file) => form.append('files', file));
  return form;
}

export const learningGroupApi = {
  getMyGroups(semesterId?: number | null): Promise<ApiResponse<LearningGroupSummary[]>> {
    const query = semesterId ? `?semesterId=${semesterId}` : '';
    return httpClient.request<LearningGroupSummary[]>('GET', `/learning-group${query}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getDetails(groupId: number): Promise<ApiResponse<LearningGroupDetails>> {
    return httpClient.request<LearningGroupDetails>('GET', `/learning-group/${groupId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getMembers(groupId: number): Promise<ApiResponse<LearningGroupMember[]>> {
    return httpClient.request<LearningGroupMember[]>('GET', `/learning-group/${groupId}/members`, undefined, {
      requireResolvedTenant: true,
    });
  },

  join(accessCode: string): Promise<ApiResponse<{ groupId: number; groupName: string }>> {
    return httpClient.request<{ groupId: number; groupName: string }>('POST', '/learning-group/join', { accessCode }, {
      requireResolvedTenant: true,
    });
  },

  getPosts(groupId: number, params: { postType?: LearningGroupPostType; pageNumber?: number; pageSize?: number } = {}): Promise<ApiResponse<LearningGroupPostPage>> {
    const query = new URLSearchParams();
    if (params.postType) query.set('postType', params.postType);
    if (params.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));

    return httpClient.request<LearningGroupPostPage>('GET', `/learning-group/${groupId}/posts${query.toString() ? `?${query}` : ''}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  createPost(groupId: number, input: CreateLearningGroupPostInput): Promise<ApiResponse<LearningGroupPost>> {
    return httpClient.request<LearningGroupPost>('POST', `/learning-group/${groupId}/posts`, buildPostForm(input), {
      requireResolvedTenant: true,
      includeJsonContentType: false,
    });
  },

  togglePin(groupId: number, postId: number): Promise<ApiResponse<LearningGroupPost>> {
    return httpClient.request<LearningGroupPost>('PATCH', `/learning-group/${groupId}/posts/${postId}/pin`, undefined, {
      requireResolvedTenant: true,
    });
  },

  deletePost(groupId: number, postId: number): Promise<ApiResponse<void>> {
    return httpClient.request<void>('DELETE', `/learning-group/${groupId}/posts/${postId}`, undefined, {
      requireResolvedTenant: true,
    });
  },

  getComments(groupId: number, postId: number): Promise<ApiResponse<LearningGroupComment[]>> {
    return httpClient.request<LearningGroupComment[]>('GET', `/learning-group/${groupId}/posts/${postId}/comments`, undefined, {
      requireResolvedTenant: true,
    });
  },

  createComment(groupId: number, postId: number, content: string): Promise<ApiResponse<LearningGroupComment>> {
    return httpClient.request<LearningGroupComment>('POST', `/learning-group/${groupId}/posts/${postId}/comments`, { content }, {
      requireResolvedTenant: true,
    });
  },
};
