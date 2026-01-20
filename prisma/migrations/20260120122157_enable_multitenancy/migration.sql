/*
  Warnings:

  - Added the required column `userId` to the `BudgetEnvelope` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Debt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `FinancialSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `InvestmentProjection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PaymentWindow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payable" DROP CONSTRAINT "Payable_paymentWindowId_fkey";

-- AlterTable
ALTER TABLE "BudgetEnvelope" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FinancialSnapshot" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InvestmentProjection" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PaymentWindow" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentWindow" ADD CONSTRAINT "PaymentWindow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payable" ADD CONSTRAINT "Payable_paymentWindowId_fkey" FOREIGN KEY ("paymentWindowId") REFERENCES "PaymentWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetEnvelope" ADD CONSTRAINT "BudgetEnvelope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentProjection" ADD CONSTRAINT "InvestmentProjection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSnapshot" ADD CONSTRAINT "FinancialSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
