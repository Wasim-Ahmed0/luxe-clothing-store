-- DropForeignKey
ALTER TABLE "VirtualCart" DROP CONSTRAINT "VirtualCart_user_id_fkey";

-- AlterTable
ALTER TABLE "VirtualCart" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "VirtualCart" ADD CONSTRAINT "VirtualCart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
