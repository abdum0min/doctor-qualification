import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Difficulty } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/modules/prisma/prisma.service';

import {
  ImportQuestionsDto,
  ImportResultDto,
} from '../dto/import-questions.dto';
import { parseRows, type ParsedQuestion } from './question-import.parser';
import { readWorkbook } from './workbook.reader';

const MAX_ROWS = 2_000;
const IMPORT_TRANSACTION_TIMEOUT_MS = 120_000;

@Injectable()
export class QuestionsImportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fayl to'liq tekshiriladi, so'ng bitta tranzaksiyada yoziladi. Xato
   * topilsa va `skipInvalidRows` yoqilmagan bo'lsa bazaga hech narsa
   * yozilmaydi — import yarim holatda qolmaydi.
   */
  async import(
    examId: number,
    file: Express.Multer.File | undefined,
    dto: ImportQuestionsDto,
  ): Promise<ImportResultDto> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('File is empty');
    }

    const sheet = await readWorkbook(file.buffer, file.originalname);

    if (sheet.rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `File contains ${sheet.rows.length} rows, the limit is ${MAX_ROWS}`,
      );
    }

    const { questions, errors } = parseRows(sheet.header, sheet.rows);

    const existing = await this.findExistingTexts(examId, questions);
    const fresh = questions.filter(
      (question) => !existing.has(question.text.toLowerCase()),
    );

    const result = {
      totalRows: sheet.rows.length,
      duplicates: questions.length - fresh.length,
      failed: errors.length,
      errors,
    };

    if (errors.length > 0 && !dto.skipInvalidRows) {
      return { ...result, imported: 0 };
    }

    const defaultDifficulty = dto.defaultDifficulty ?? Difficulty.INTERMEDIATE;

    return {
      ...result,
      imported: await this.persist(examId, fresh, defaultDifficulty),
    };
  }

  /** Bir xil matnli savol imtihonda ikki marta turmasligi kerak. */
  private async findExistingTexts(
    examId: number,
    questions: ParsedQuestion[],
  ): Promise<Set<string>> {
    if (questions.length === 0) {
      return new Set();
    }

    const rows = await this.prisma.question.findMany({
      where: {
        examId,
        text: { in: questions.map((question) => question.text) },
      },
      select: { text: true },
    });

    return new Set(rows.map((row) => row.text.toLowerCase()));
  }

  private async persist(
    examId: number,
    questions: ParsedQuestion[],
    defaultDifficulty: Difficulty,
  ): Promise<number> {
    if (questions.length === 0) {
      return 0;
    }

    return this.prisma.$transaction(
      async (tx) => {
        const last = await tx.question.findFirst({
          where: { examId },
          orderBy: { position: 'desc' },
          select: { position: true },
        });

        let position = (last?.position ?? -1) + 1;

        // `createMany` ichma-ich variantlarni qo'llab-quvvatlamaydi, shuning
        // uchun har bir savol o'z variantlari bilan birga yaratiladi.
        for (const question of questions) {
          await tx.question.create({
            data: {
              examId,
              text: question.text,
              difficulty: question.difficulty ?? defaultDifficulty,
              position,
              options: {
                create: question.options.map((option, index) => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                  position: index,
                })),
              },
            },
            select: { id: true },
          });

          position += 1;
        }

        return questions.length;
      },
      { timeout: IMPORT_TRANSACTION_TIMEOUT_MS },
    );
  }
}
