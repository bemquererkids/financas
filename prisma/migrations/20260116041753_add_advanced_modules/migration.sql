/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Debt` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Debt` table. All the data in the column will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Debt" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "remainingValue" DECIMAL(10,2),
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "creditCardId" TEXT,
ADD COLUMN     "subcategory" TEXT;

-- DropTable
DROP TABLE "Budget";

-- CreateTable
CREATE TABLE "PaymentWindow" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "windowDay" INTEGER NOT NULL,
    "receivedAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PaymentWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payable" (
    "id" TEXT NOT NULL,
    "paymentWindowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Payable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetEnvelope" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetPercentage" DECIMAL(5,2) NOT NULL,
    "month" TEXT NOT NULL,

    CONSTRAINT "BudgetEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentProjection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialBalance" DECIMAL(15,2) NOT NULL,
    "monthlyContribution" DECIMAL(10,2) NOT NULL,
    "annualReturnRate" DECIMAL(5,2) NOT NULL,
    "adminFeeRate" DECIMAL(5,2) NOT NULL,
    "years" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAmount" DECIMAL(15,2),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBalance" DECIMAL(15,2) NOT NULL,
    "totalDebt" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "FinancialSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_paymentWindowId_fkey" FOREIGN KEY ("paymentWindowId") REFERENCES "PaymentWindow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
