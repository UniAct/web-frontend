export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'EVENT';
  audience: 'ALL' | 'STUDENTS' | 'STAFF' | 'FACULTY';
  status: 'DRAFT' | 'PUBLISHED';
  event_date?: string | null;
  event_location?: string | null;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  type: Announcement['type'];
  audience: Announcement['audience'];
  status: Announcement['status'];
  event_date?: string | null;
  event_location?: string | null;
}
