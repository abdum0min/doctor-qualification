import { Readable } from 'node:stream';

import { BadRequestException } from '@nestjs/common';
import ExcelJS from 'exceljs';

export interface SheetData {
  header: string[];
  rows: string[][];
}

const CSV_EXTENSION = /\.csv$/i;
const EXCEL_EXTENSION = /\.xlsx$/i;

/**
 * CSV va XLSX fayllarini bir xil `SheetData` ko'rinishiga keltiradi.
 * Faqat birinchi varaq o'qiladi — import formati bitta jadvaldan iborat.
 */
export async function readWorkbook(
  buffer: Buffer,
  filename: string,
): Promise<SheetData> {
  const workbook = new ExcelJS.Workbook();

  if (CSV_EXTENSION.test(filename)) {
    await workbook.csv.read(Readable.from(buffer));
  } else if (EXCEL_EXTENSION.test(filename)) {
    await workbook.xlsx.read(Readable.from(buffer));
  } else {
    throw new BadRequestException('Only .csv and .xlsx files are supported');
  }

  const sheet = workbook.worksheets[0];

  if (!sheet || sheet.rowCount < 2) {
    throw new BadRequestException(
      'File must contain a header row and at least one question',
    );
  }

  const table: string[][] = [];

  sheet.eachRow((row) => {
    const cells: string[] = [];

    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cells[columnNumber - 1] = toPlainText(cell.value);
    });

    table.push(cells);
  });

  const [header, ...rows] = table;

  return {
    header,
    // Excel'da oxirida qolib ketgan bo'sh qatorlar xato sifatida sanalmasin.
    rows: rows.filter((cells) => cells.some((cell) => cell?.trim())),
  };
}

function toPlainText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if ('richText' in value) {
      return value.richText.map((part) => part.text).join('');
    }

    if ('text' in value) {
      return String(value.text);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if ('result' in value) {
      return toPlainText(value.result);
    }

    return '';
  }

  return String(value);
}
