/*
  Warnings:

  - A unique constraint covering the columns `[tag]` on the table `Equipamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Equipamento" ADD COLUMN     "numeroSerie" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Equipamento_tag_key" ON "Equipamento"("tag");
