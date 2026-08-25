export interface CursorPaginationMeta {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorPaginated<T> {
  items: T[];
  meta: CursorPaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: CursorPaginationMeta;
  timestamp: string;
  path: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}

export function isPaginated<T>(
  payload: unknown,
): payload is CursorPaginated<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray((payload as CursorPaginated<T>).items) &&
    typeof (payload as CursorPaginated<T>).meta === 'object'
  );
}
