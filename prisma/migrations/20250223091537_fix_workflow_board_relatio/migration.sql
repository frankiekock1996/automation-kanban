/*
  Warnings:

  - You are about to drop the column `userId` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Column` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subtask` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[boardId]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkId` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `Subtask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_userId_fkey";

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_workflowId_fkey";

-- DropIndex
DROP INDEX "Board_userId_idx";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Column" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT;

-- AlterTable
ALTER TABLE "Subtask" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "userId",
ADD COLUMN     "clerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "boardId" TEXT;

-- CreateIndex
CREATE INDEX "Board_clerkId_idx" ON "Board"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_boardId_key" ON "Workflow"("boardId");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
