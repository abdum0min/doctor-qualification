-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "certificateId" VARCHAR(32) NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "doctorProfileId" INTEGER NOT NULL,
    "doctorFullname" VARCHAR(100) NOT NULL,
    "specialtyName" VARCHAR(100) NOT NULL,
    "examTitle" VARCHAR(160) NOT NULL,
    "score" INTEGER NOT NULL,
    "qualification" "QualificationLevel" NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" VARCHAR(300),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateId_key" ON "Certificate"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_attemptId_key" ON "Certificate"("attemptId");

-- CreateIndex
CREATE INDEX "Certificate_doctorProfileId_issuedAt_idx" ON "Certificate"("doctorProfileId", "issuedAt");

-- CreateIndex
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sertifikat raqami ketma-ketligi: DOC-{yil}-{6 xonali}.
-- Ketma-ketlik atomik, shuning uchun raqam hech qachon takrorlanmaydi.
CREATE SEQUENCE IF NOT EXISTS "certificate_number_seq" START 1;
