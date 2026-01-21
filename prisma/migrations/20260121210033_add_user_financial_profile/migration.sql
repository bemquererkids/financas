-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creditCardCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "financialSituation" TEXT,
ADD COLUMN     "hasCreditCard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasInvestments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "investmentTypes" TEXT,
ADD COLUMN     "mainGoal" TEXT,
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userProfile" TEXT;
