-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'TECNICO');

-- CreateEnum
CREATE TYPE "Periodicidade" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'TECNICO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contrato" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ambiente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,

    CONSTRAINT "Ambiente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipamento" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "capacidade" TEXT,
    "localizacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "ambienteId" TEXT NOT NULL,

    CONSTRAINT "Equipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponsavelTecnico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "crea" TEXT NOT NULL,
    "registroConselho" TEXT NOT NULL,
    "art" TEXT NOT NULL,
    "assinaturaBase64" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponsavelTecnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoManutencao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "equipamentoId" TEXT NOT NULL,

    CONSTRAINT "PlanoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemManutencao" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "planoId" TEXT NOT NULL,

    CONSTRAINT "ItemManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmocGerado" (
    "id" TEXT NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL,
    "dataGeracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "pdfBase64" TEXT,
    "usuarioId" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,

    CONSTRAINT "PmocGerado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPmocExecutado" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT true,
    "pmocGeradoId" TEXT NOT NULL,
    "itemManutencaoId" TEXT,

    CONSTRAINT "ItemPmocExecutado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ambiente" ADD CONSTRAINT "Ambiente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipamento" ADD CONSTRAINT "Equipamento_ambienteId_fkey" FOREIGN KEY ("ambienteId") REFERENCES "Ambiente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoManutencao" ADD CONSTRAINT "PlanoManutencao_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemManutencao" ADD CONSTRAINT "ItemManutencao_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "PlanoManutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmocGerado" ADD CONSTRAINT "PmocGerado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmocGerado" ADD CONSTRAINT "PmocGerado_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "Equipamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmocGerado" ADD CONSTRAINT "PmocGerado_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "ResponsavelTecnico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPmocExecutado" ADD CONSTRAINT "ItemPmocExecutado_pmocGeradoId_fkey" FOREIGN KEY ("pmocGeradoId") REFERENCES "PmocGerado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPmocExecutado" ADD CONSTRAINT "ItemPmocExecutado_itemManutencaoId_fkey" FOREIGN KEY ("itemManutencaoId") REFERENCES "ItemManutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
