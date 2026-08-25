export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
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

export function isPaginated<T>(payload: unknown): payload is Paginated<T> {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const candidate = payload as Paginated<T>;

  return (
    Array.isArray(candidate.items) &&
    typeof candidate.meta === 'object' &&
    candidate.meta !== null &&
    typeof candidate.meta.total === 'number'
  );
}
