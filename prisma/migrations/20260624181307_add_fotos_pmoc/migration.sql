-- CreateEnum
CREATE TYPE "TipoFotoPmoc" AS ENUM ('ANTES', 'DEPOIS');

-- CreateTable
CREATE TABLE "FotoPmoc" (
    "id" TEXT NOT NULL,
    "imagemBase64" TEXT NOT NULL,
    "tipo" "TipoFotoPmoc" NOT NULL,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pmocGeradoId" TEXT NOT NULL,

    CONSTRAINT "FotoPmoc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FotoPmoc" ADD CONSTRAINT "FotoPmoc_pmocGeradoId_fkey" FOREIGN KEY ("pmocGeradoId") REFERENCES "PmocGerado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
