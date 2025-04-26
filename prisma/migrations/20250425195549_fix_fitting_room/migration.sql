/*
  Warnings:

  - You are about to drop the column `requested_items` on the `FittingRoomRequest` table. All the data in the column will be lost.
  - Added the required column `variant_id` to the `FittingRoomRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FittingRoomRequest" DROP COLUMN "requested_items",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FittingRoomRequest" ADD CONSTRAINT "FittingRoomRequest_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ProductVariant"("variant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
