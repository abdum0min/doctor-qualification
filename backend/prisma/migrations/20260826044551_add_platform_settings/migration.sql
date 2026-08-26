-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "averageScoreWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "bestScoreWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "volumeWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "passRateWeight" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "volumeTargetAttempts" INTEGER NOT NULL DEFAULT 5,
    "certificateValidityMonths" INTEGER NOT NULL DEFAULT 12,
    "defaultQuestionCount" INTEGER NOT NULL DEFAULT 10,
    "defaultTimeLimitMinutes" INTEGER NOT NULL DEFAULT 20,
    "defaultPassingScore" INTEGER NOT NULL DEFAULT 60,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
