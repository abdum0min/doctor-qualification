export interface CursorPayload {
  id: number;
  sort: unknown;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string): CursorPayload | null {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8'),
    ) as CursorPayload;

    if (!Number.isInteger(parsed.id) || parsed.id < 1) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
