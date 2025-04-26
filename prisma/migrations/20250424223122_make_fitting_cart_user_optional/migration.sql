-- DropForeignKey
ALTER TABLE "FittingCart" DROP CONSTRAINT "FittingCart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "FittingRoomRequest" DROP CONSTRAINT "FittingRoomRequest_user_id_fkey";

-- AlterTable
ALTER TABLE "FittingCart" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FittingRoomRequest" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FittingCart" ADD CONSTRAINT "FittingCart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FittingRoomRequest" ADD CONSTRAINT "FittingRoomRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
