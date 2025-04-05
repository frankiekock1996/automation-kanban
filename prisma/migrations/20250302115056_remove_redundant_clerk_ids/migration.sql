/*
  Warnings:

  - You are about to drop the column `clerkId` on the `Subtask` table. All the data in the column will be lost.
  - You are about to drop the column `clerkId` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subtask" DROP COLUMN "clerkId";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "clerkId";
