-- Savollar endi mutaxassislikka emas, bevosita imtihonga tegishli.
-- Mavjud savollar o'z mutaxassisligining eng eski imtihoniga ko'chiriladi.

ALTER TABLE "Question" ADD COLUMN "examId" INTEGER;
ALTER TABLE "Question" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

UPDATE "Question" q
SET "examId" = (
  SELECT e."id"
  FROM "Exam" e
  WHERE e."specialtyId" = q."specialtyId"
  ORDER BY e."id" ASC
  LIMIT 1
);

-- Imtihoni bo'lmagan mutaxassislikdagi savollar egasiz qoladi.
DELETE FROM "Question" WHERE "examId" IS NULL;

-- Har bir imtihon ichida tartib raqamini 0 dan boshlab beramiz.
WITH ordered AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "examId" ORDER BY "id") - 1 AS pos
  FROM "Question"
)
UPDATE "Question" q
SET "position" = o.pos
FROM ordered o
WHERE q."id" = o."id";

ALTER TABLE "Question" ALTER COLUMN "examId" SET NOT NULL;
ALTER TABLE "Question" ALTER COLUMN "position" DROP DEFAULT;

ALTER TABLE "Question" DROP CONSTRAINT "Question_specialtyId_fkey";
DROP INDEX "Question_specialtyId_difficulty_isActive_idx";
DROP INDEX "Question_createdAt_idx";
ALTER TABLE "Question" DROP COLUMN "specialtyId";

ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey"
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Question_examId_position_key" ON "Question"("examId", "position");
CREATE INDEX "Question_examId_isActive_idx" ON "Question"("examId", "isActive");

-- Imtihon o'z savollaridan ko'proq savol so'ramasligi kerak.
UPDATE "Exam" e
SET "questionCount" = GREATEST(1, LEAST(
  e."questionCount",
  (SELECT COUNT(*) FROM "Question" q WHERE q."examId" = e."id" AND q."isActive")
));

-- Savolsiz qolgan imtihonlar nofaol qilinadi — aks holda ular ishga tushmaydi.
UPDATE "Exam" e
SET "isActive" = false
WHERE NOT EXISTS (SELECT 1 FROM "Question" q WHERE q."examId" = e."id" AND q."isActive");

-- Daraja filtri endi keraksiz: savollar imtihonga qo'lda biriktiriladi.
ALTER TABLE "Exam" DROP COLUMN "difficulty";
