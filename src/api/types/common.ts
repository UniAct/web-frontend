export type JSendStatus = 'success' | 'fail' | 'error';

export interface ApiResponse<T = unknown> {
  status: JSendStatus;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: T[];
}
