-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "specialtyId" INTEGER NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(500),
    "questionCount" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL,
    "difficulty" "Difficulty",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exam_specialtyId_isActive_idx" ON "Exam"("specialtyId", "isActive");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
