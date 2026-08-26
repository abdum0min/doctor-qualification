import { Difficulty } from 'src/generated/prisma/enums';

export interface ParsedOption {
  text: string;
  isCorrect: boolean;
}

export interface ParsedQuestion {
  /** Fayldagi qator raqami — xatoni foydalanuvchiga ko'rsatish uchun. */
  row: number;
  text: string;
  difficulty: Difficulty | null;
  options: ParsedOption[];
}

export interface RowError {
  row: number;
  message: string;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  errors: RowError[];
}

/** Sarlavha nomlari o'zbekcha ham, inglizcha ham yozilishi mumkin. */
const COLUMN_ALIASES: Record<string, string[]> = {
  text: ['savol', 'savol matni', 'question', 'question text'],
  A: ['a', 'variant a', 'javob a', 'option a'],
  B: ['b', 'variant b', 'javob b', 'option b'],
  C: ['c', 'variant c', 'javob c', 'option c'],
  D: ['d', 'variant d', 'javob d', 'option d'],
  E: ['e', 'variant e', 'javob e', 'option e'],
  F: ['f', 'variant f', 'javob f', 'option f'],
  correct: [
    'togri javob',
    'tugri javob',
    'javob',
    'correct',
    'correct answer',
    'answer',
  ],
  difficulty: ['daraja', 'qiyinlik', 'difficulty', 'level'],
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

const REQUIRED_COLUMNS = ['text', 'A', 'B', 'correct'] as const;

/** Daraja ustuni ingliz kalitida ham, o'zbekcha nom bilan ham yozilishi mumkin. */
const DIFFICULTY_ALIASES: Record<string, Difficulty> = {
  beginner: Difficulty.BEGINNER,
  boshlangich: Difficulty.BEGINNER,
  oson: Difficulty.BEGINNER,
  intermediate: Difficulty.INTERMEDIATE,
  orta: Difficulty.INTERMEDIATE,
  advanced: Difficulty.ADVANCED,
  yuqori: Difficulty.ADVANCED,
  qiyin: Difficulty.ADVANCED,
  expert: Difficulty.EXPERT,
  ekspert: Difficulty.EXPERT,
};

// CreateQuestionDto bilan bir xil chegaralar — import ham, forma ham
// bir xil qoidaga bo'ysunadi.
export const MIN_TEXT_LENGTH = 10;
export const MAX_TEXT_LENGTH = 1000;
export const MAX_OPTION_LENGTH = 500;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;

/** Apostrof va harf registri sarlavhalarni solishtirishga ta'sir qilmasin. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/['`‘’ʻʼ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sarlavha qatoridan ustun indekslarini aniqlaydi. Ustunlar tartibi muhim
 * emas — faqat nomlari mos kelishi kifoya. Majburiy ustun topilmasa `null`.
 */
export function mapColumns(header: string[]): Map<string, number> | null {
  const normalized = header.map((cell) => normalize(cell ?? ''));
  const columns = new Map<string, number>();

  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const index = normalized.findIndex((cell) => aliases.includes(cell));

    if (index >= 0) {
      columns.set(key, index);
    }
  }

  return REQUIRED_COLUMNS.every((key) => columns.has(key)) ? columns : null;
}

export function parseRows(
  header: string[],
  rows: string[][],
  headerRowNumber = 1,
): ParseResult {
  const columns = mapColumns(header);

  if (!columns) {
    return {
      questions: [],
      errors: [
        {
          row: headerRowNumber,
          message:
            'Sarlavha qatorida quyidagi ustunlar bo`lishi kerak: Savol, A, B, To`g`ri javob',
        },
      ],
    };
  }

  const questions: ParsedQuestion[] = [];
  const errors: RowError[] = [];
  const seenTexts = new Set<string>();

  rows.forEach((cells, index) => {
    const row = headerRowNumber + index + 1;
    const read = (key: string) => {
      const column = columns.get(key);

      return column === undefined ? '' : (cells[column] ?? '').trim();
    };

    const parsed = parseRow(row, read, seenTexts);

    if ('message' in parsed) {
      errors.push({ row, message: parsed.message });
      return;
    }

    seenTexts.add(parsed.question.text.toLowerCase());
    questions.push(parsed.question);
  });

  return { questions, errors };
}

type RowOutcome = { question: ParsedQuestion } | { message: string };

function parseRow(
  row: number,
  read: (key: string) => string,
  seenTexts: Set<string>,
): RowOutcome {
  const text = read('text');

  if (!text) {
    return { message: 'Savol matni bo`sh' };
  }

  if (text.length < MIN_TEXT_LENGTH) {
    return {
      message: `Savol matni kamida ${MIN_TEXT_LENGTH} ta belgi bo\`lishi kerak`,
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return { message: `Savol matni ${MAX_TEXT_LENGTH} belgidan uzun` };
  }

  if (seenTexts.has(text.toLowerCase())) {
    return { message: 'Fayl ichida takrorlangan savol' };
  }

  const filled = OPTION_LABELS.map((label) => ({
    label,
    text: read(label),
  })).filter((option) => option.text.length > 0);

  if (filled.length < MIN_OPTIONS) {
    return {
      message: `Kamida ${MIN_OPTIONS} ta variant to\`ldirilishi kerak`,
    };
  }

  if (filled.length > MAX_OPTIONS) {
    return { message: `Variantlar soni ${MAX_OPTIONS} tadan oshmasin` };
  }

  const tooLong = filled.find(
    (option) => option.text.length > MAX_OPTION_LENGTH,
  );

  if (tooLong) {
    return {
      message: `${tooLong.label} varianti ${MAX_OPTION_LENGTH} belgidan uzun`,
    };
  }

  const answer = read('correct').toUpperCase();
  const correct = filled.find((option) => option.label === answer);

  if (!correct) {
    const available = filled.map((option) => option.label).join(', ');

    return {
      message: `To\`g\`ri javob ${available} dan biri bo\`lishi kerak (kiritilgan: "${read('correct')}")`,
    };
  }

  const rawDifficulty = read('difficulty');
  const difficulty = rawDifficulty
    ? DIFFICULTY_ALIASES[normalize(rawDifficulty)]
    : null;

  if (rawDifficulty && !difficulty) {
    return {
      message: `Daraja noma\`lum: "${rawDifficulty}". Ruxsat etilgan: Boshlang\`ich, O\`rta, Yuqori, Ekspert`,
    };
  }

  return {
    question: {
      row,
      text,
      difficulty: difficulty ?? null,
      options: filled.map((option) => ({
        text: option.text,
        isCorrect: option.label === correct.label,
      })),
    },
  };
}
