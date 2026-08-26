import { Difficulty } from 'src/generated/prisma/enums';

import { mapColumns, parseRows } from './question-import.parser';

const HEADER = ['Savol', 'A', 'B', 'C', 'D', "To'g'ri javob", 'Daraja'];

const TEXT = 'Miokard infarktining asosiy belgisi qaysi?';

function row(text = TEXT, correct = 'B', difficulty = "O'rta"): string[] {
  return [text, 'Bosh og`riq', 'Ko`krak og`rig`i', 'Yo`tal', 'Isitma', correct, difficulty];
}

describe('mapColumns', () => {
  it('accepts columns in any order and English headers', () => {
    const columns = mapColumns(['Correct answer', 'B', 'A', 'Question']);

    expect(columns?.get('text')).toBe(3);
    expect(columns?.get('correct')).toBe(0);
  });

  it('ignores apostrophe style and letter case', () => {
    expect(mapColumns(['SAVOL', 'a', 'b', 'To`g`ri javob'])).not.toBeNull();
    expect(mapColumns(['Savol', 'A', 'B', "To'g'ri javob"])).not.toBeNull();
  });

  it('rejects a sheet without the required columns', () => {
    expect(mapColumns(['Savol', 'A', 'B'])).toBeNull();
  });
});

describe('parseRows', () => {
  it('parses a valid sheet and marks the correct option', () => {
    const { questions, errors } = parseRows(HEADER, [row()]);

    expect(errors).toEqual([]);
    expect(questions).toHaveLength(1);
    expect(questions[0]).toMatchObject({
      row: 2,
      text: TEXT,
      difficulty: Difficulty.INTERMEDIATE,
    });
    expect(questions[0].options).toHaveLength(4);
    expect(questions[0].options.filter((option) => option.isCorrect)).toEqual([
      { text: 'Ko`krak og`rig`i', isCorrect: true },
    ]);
  });

  it('keeps only the filled options', () => {
    const { questions } = parseRows(HEADER, [
      [TEXT, 'Birinchi', 'Ikkinchi', '', '', 'A', ''],
    ]);

    expect(questions[0].options).toHaveLength(2);
    expect(questions[0].difficulty).toBeNull();
  });

  it('reports a missing header row once, with no question rows', () => {
    const { questions, errors } = parseRows(['Savol', 'A'], [[TEXT, 'x']]);

    expect(questions).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(1);
  });

  it('reports an invalid correct answer with the file row number', () => {
    const { questions, errors } = parseRows(HEADER, [row(), row(TEXT + '?', 'Z')]);

    expect(questions).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(3);
    expect(errors[0].message).toContain('Z');
  });

  it('rejects an answer pointing at an empty option', () => {
    const { errors } = parseRows(HEADER, [
      [TEXT, 'Birinchi', 'Ikkinchi', '', '', 'C', ''],
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('A, B');
  });

  it('requires at least two options', () => {
    const { errors } = parseRows(HEADER, [
      [TEXT, 'Yagona variant', '', '', '', 'A', ''],
    ]);

    expect(errors[0].message).toContain('2 ta variant');
  });

  it('enforces the same text limits as the create form', () => {
    const short = parseRows(HEADER, [row('Qisqa')]);
    expect(short.errors[0].message).toContain('10 ta belgi');

    const long = parseRows(HEADER, [row('x'.repeat(1001))]);
    expect(long.errors[0].message).toContain('1000');
  });

  it('reports an empty question text', () => {
    const { errors } = parseRows(HEADER, [
      ['', 'Birinchi', 'Ikkinchi', '', '', 'A', ''],
    ]);

    expect(errors[0].message).toContain('bo`sh');
  });

  it('flags a question duplicated inside the same file', () => {
    const { questions, errors } = parseRows(HEADER, [
      row(),
      row(TEXT.toUpperCase()),
    ]);

    expect(questions).toHaveLength(1);
    expect(errors).toEqual([
      { row: 3, message: 'Fayl ichida takrorlangan savol' },
    ]);
  });

  it('accepts Uzbek and English difficulty names', () => {
    const { questions, errors } = parseRows(HEADER, [
      row(TEXT, 'A', 'Boshlang`ich'),
      row(`${TEXT} (2)`, 'A', 'EXPERT'),
      row(`${TEXT} (3)`, 'A', 'yuqori'),
    ]);

    expect(errors).toEqual([]);
    expect(questions.map((question) => question.difficulty)).toEqual([
      Difficulty.BEGINNER,
      Difficulty.EXPERT,
      Difficulty.ADVANCED,
    ]);
  });

  it('rejects an unknown difficulty instead of guessing', () => {
    const { errors } = parseRows(HEADER, [row(TEXT, 'A', 'juda qiyin')]);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('juda qiyin');
  });
});
