import { Paginated } from '../interfaces/api-response.interface';

/** Sahifalash uchun kerak bo'ladigan yagona ikkita maydon. */
export interface PageParams {
  page: number;
  limit: number;
}

export interface SkipTake {
  skip: number;
  take: number;
}

export function toSkipTake({ page, limit }: PageParams): SkipTake {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginated<T>(
  items: T[],
  total: number,
  { page, limit }: PageParams,
): Paginated<T> {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
