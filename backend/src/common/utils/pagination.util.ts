import { CursorPaginated } from '../interfaces/api-response.interface';
import { encodeCursor } from './cursor.util';

export function buildCursorPaginated<T extends { id: number }>(
  rows: T[],
  limit: number,
  sortBy: keyof T,
): CursorPaginated<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const last = items[items.length - 1];

  return {
    items,
    meta: {
      limit,
      hasMore,
      nextCursor:
        hasMore && last
          ? encodeCursor({ id: last.id, sort: last[sortBy] })
          : null,
    },
  };
}
