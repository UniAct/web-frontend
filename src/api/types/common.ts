export type JSendStatus = 'success' | 'fail' | 'error';

export interface ApiResponse<T = unknown> {
  status: JSendStatus;
  data?: T;
  message?: string;
}
