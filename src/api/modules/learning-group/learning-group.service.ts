import { learningGroupApi } from './learning-group.api';
import type { CreateLearningGroupPostInput, LearningGroupPostType } from '../../types';

export const LearningGroupService = {
  async getMyGroups(semesterId?: number | null) {
    const res = await learningGroupApi.getMyGroups(semesterId);
    return res.data ?? [];
  },

  async getDetails(groupId: number) {
    const res = await learningGroupApi.getDetails(groupId);
    if (!res.data) throw new Error(res.message || 'Failed to load learning group');
    return res.data;
  },

  async getMembers(groupId: number) {
    const res = await learningGroupApi.getMembers(groupId);
    return res.data ?? [];
  },

  async join(accessCode: string) {
    const res = await learningGroupApi.join(accessCode);
    if (!res.data) throw new Error(res.message || 'Failed to join group');
    return res.data;
  },

  async getPosts(groupId: number, postType?: LearningGroupPostType) {
    const res = await learningGroupApi.getPosts(groupId, { postType, pageNumber: 1, pageSize: 50 });
    if (!res.data) throw new Error(res.message || 'Failed to load posts');
    return res.data;
  },

  async createPost(groupId: number, input: CreateLearningGroupPostInput) {
    const res = await learningGroupApi.createPost(groupId, input);
    if (!res.data) throw new Error(res.message || 'Failed to create post');
    return res.data;
  },

  async togglePin(groupId: number, postId: number) {
    const res = await learningGroupApi.togglePin(groupId, postId);
    if (!res.data) throw new Error(res.message || 'Failed to pin post');
    return res.data;
  },

  async deletePost(groupId: number, postId: number) {
    await learningGroupApi.deletePost(groupId, postId);
  },

  async getComments(groupId: number, postId: number) {
    const res = await learningGroupApi.getComments(groupId, postId);
    return res.data ?? [];
  },

  async createComment(groupId: number, postId: number, content: string) {
    const res = await learningGroupApi.createComment(groupId, postId, content);
    if (!res.data) throw new Error(res.message || 'Failed to add comment');
    return res.data;
  },
};
