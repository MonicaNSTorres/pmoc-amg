-- AlterEnum
ALTER TYPE "Periodicidade" ADD VALUE 'BIMESTRAL';

-- AlterTable
ALTER TABLE "PlanoManutencao" ADD COLUMN     "mesesExecucao" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
