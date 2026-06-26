import type { PaginatedResponse } from './common';

export type LearningGroupRole = 'Owner' | 'Member';
export type LearningGroupPostType = 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'MATERIAL';

export interface LearningGroupCourse {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export interface LearningGroupSummary {
  groupId: number;
  groupName: string;
  accessCode: string | null;
  allowStudentPosts: boolean;
  course: LearningGroupCourse;
  myRole: LearningGroupRole;
}

export interface LearningGroupDetails extends LearningGroupSummary {
  createdAt: string;
  semester: {
    id: number;
    year: number;
    term: number;
    type: string;
  };
  memberCount: number;
}

export interface LearningGroupMember {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: LearningGroupRole;
  joinedAt: string;
}

export interface LearningGroupAttachment {
  attachmentId: number;
  fileName: string;
  fileType: string;
  url: string;
  fileSize: number | null;
}

export interface LearningGroupPost {
  postId: number;
  postType: LearningGroupPostType;
  content: string | null;
  dueDate: string | null;
  isPinned: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    userId: number;
    firstName: string;
    lastName: string;
  };
  attachments: LearningGroupAttachment[];
  commentCount: number;
}

export type LearningGroupPostPage = PaginatedResponse<LearningGroupPost>;

export interface LearningGroupComment {
  id: number;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    userId: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateLearningGroupPostInput {
  postType: LearningGroupPostType;
  content?: string;
  dueDate?: string;
  files?: File[];
}
