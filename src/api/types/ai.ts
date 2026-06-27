export interface AiHealth {
  app_name?: string;
  app_version?: string;
  signal?: string;
}

export interface AiProjectFiles {
  signal: string;
  assets: Array<{
    asset_id: string;
    asset_name: string;
    asset_size: number;
    chunk_count?: number;
  }>;
  filesystem: Array<{
    name: string;
    size: number | null;
  }>;
}

export interface AiProjectChapters {
  signal: string;
  chapters: Array<{
    file_id?: string;
    chapter_title?: string;
    title?: string;
    [key: string]: unknown;
  }>;
}

export interface AiIndexInfo {
  signal: string;
  collection_info: unknown;
}

export interface AiSearchResponse {
  signal: string;
  results: Array<{
    text?: string;
    score?: number;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
  }>;
}

export interface AiStudyFiles {
  files: Array<{
    id: string;
    name: string;
    size: number;
  }>;
}

export interface AiStudyData {
  notes: string;
  bookmarks: Array<{ label: string; page: number }>;
}

export interface AiSyncResult {
  projectId: string;
  supportedMaterials: number;
  indexed: number;
  skipped: number;
  failed: number;
  results: Array<{
    attachmentId: number;
    fileName: string;
    status: 'indexed' | 'skipped' | 'failed';
    detail?: string;
  }>;
}

export interface AiSession {
  session_id: string;
  title: string;
  created_at: string | null;
  filters?: unknown;
}

export interface AiSessionList {
  signal: string;
  sessions: AiSession[];
}

export interface AiHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AiSessionHistory {
  signal: string;
  history: AiHistoryMessage[];
}

export interface AiChatRequest {
  text: string;
  sessionId?: string;
  includeTranscript?: boolean;
  studentId?: number;
  limit?: number;
}

export interface AiChatResponse {
  sessionId: string;
  answer: string;
  signal?: string;
}

export interface AiExamResponse {
  signal: string;
  exam: {
    difficulty?: string;
    mcq_questions?: Array<{
      question: string;
      choices: string[];
      correct_answer: string;
      answer_explanation?: string;
    }>;
    written_questions?: Array<{
      question: string;
      answer: string;
    }>;
    [key: string]: unknown;
  };
}

export interface AiSummaryResponse {
  signal: string;
  summary: string;
}

export interface AiMindMapResponse {
  signal: string;
  mindmap: unknown;
}
