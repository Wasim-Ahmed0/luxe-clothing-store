/*
  Warnings:

  - A unique constraint covering the columns `[store_id,variant_id]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Inventory_store_id_variant_id_key" ON "Inventory"("store_id", "variant_id");
