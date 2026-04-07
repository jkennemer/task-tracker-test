-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" ALTER COLUMN "actorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
