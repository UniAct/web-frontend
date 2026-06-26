import { aiApi } from './ai.api';
import type { AiChatRequest } from '../../types';

export const AiService = {
  async health() {
    const res = await aiApi.health();
    return res.data;
  },

  async getFiles(groupId: number) {
    const res = await aiApi.getFiles(groupId);
    return res.data;
  },

  async getChapters(groupId: number) {
    const res = await aiApi.getChapters(groupId);
    return res.data?.chapters ?? [];
  },

  async getIndexInfo(groupId: number) {
    const res = await aiApi.getIndexInfo(groupId);
    return res.data?.collection_info;
  },

  async syncGroupMaterials(groupId: number) {
    const res = await aiApi.syncGroupMaterials(groupId);
    if (!res.data) throw new Error(res.message || 'Failed to sync materials');
    return res.data;
  },

  async listSessions(groupId: number) {
    const res = await aiApi.listSessions(groupId);
    return res.data?.sessions ?? [];
  },

  async createSession(groupId: number, title?: string) {
    const res = await aiApi.createSession(groupId, title);
    if (!res.data?.session_id) throw new Error(res.message || 'Failed to create AI session');
    return res.data.session_id;
  },

  async getSessionHistory(sessionId: string) {
    const res = await aiApi.getSessionHistory(sessionId);
    return res.data?.history ?? [];
  },

  async chat(groupId: number, input: AiChatRequest) {
    const res = await aiApi.chat(groupId, input);
    if (!res.data) throw new Error(res.message || 'Failed to send message');
    return res.data;
  },

  async search(groupId: number, input: { text: string; limit?: number; chapters?: string[]; file_chapter_filters?: Array<{ file_id: string; chapter_title: string }> }) {
    const res = await aiApi.search(groupId, input);
    return res.data?.results ?? [];
  },

  async summarize(groupId: number, content = '') {
    const res = await aiApi.summarize(groupId, content);
    if (!res.data) throw new Error(res.message || 'Failed to summarize materials');
    return res.data;
  },

  async exam(groupId: number, input: { content?: string; difficulty?: string; num_mcq?: number; num_written?: number }) {
    const res = await aiApi.exam(groupId, input);
    if (!res.data) throw new Error(res.message || 'Failed to generate exam');
    return res.data;
  },

  async mindmap(groupId: number, content = '') {
    const res = await aiApi.mindmap(groupId, content);
    if (!res.data) throw new Error(res.message || 'Failed to generate mind map');
    return res.data;
  },

  async listStudyFiles(groupId: number) {
    const res = await aiApi.listStudyFiles(groupId);
    return res.data?.files ?? [];
  },

  async getStudyData(groupId: number, fileId: string) {
    const res = await aiApi.getStudyData(groupId, fileId);
    return res.data ?? { notes: '', bookmarks: [] };
  },

  async saveStudyData(groupId: number, fileId: string, input: { notes: string; bookmarks: Array<{ label: string; page: number }> }) {
    await aiApi.saveStudyData(groupId, fileId, input);
  },
};
