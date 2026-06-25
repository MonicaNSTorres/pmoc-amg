import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const servicos = [
  "Verificar e corrigir o ajuste da moldura na estrutura",
  "Verificar obstrução/inclinação para drenagem do condensado na bandeja",
  "Verificar a existência de danos e corrosão no aletado e moldura",
  "Verificar a operação de drenagem de água da bandeja",
  "Limpeza externa",
  "Aplicação de produtos antibactericida na serpentina",
  "Desincrustar serpentinas, se necessário",
  "Verificar e limpar turbina do ventilador",
  "Verificar danos e corrosão do suporte e existência de frestas",
  "Lavar e remover biofilme da serpentina com produto químico biodegradável",
];

const tags = [
  { tag: "ACG-AT-001", unidade: "PA CARAGUÁ", local: "ATENDIMENTO" },
  { tag: "ACP-AT-001", unidade: "PA CAÇAPAVA", local: "ATENDIMENTO" },
  { tag: "ACJ-AT-001", unidade: "PA CAMPOS DE JORDÃO", local: "ATENDIMENTO" },
  { tag: "ACR-AT-001", unidade: "PA CRUZEIRO", local: "ATENDIMENTO" },
  { tag: "AEM-AT-001", unidade: "PA EUGENIO DE MELO", local: "ATENDIMENTO" },
  { tag: "AIB-AT-001", unidade: "PA ILHA BELA", local: "ATENDIMENTO" },
  { tag: "AJC-AT-001", unidade: "PA JACAREÍ", local: "ATENDIMENTO ESPERA" },
  { tag: "AJC-AT-002", unidade: "PA JACAREÍ", local: "ATENDIMENTO" },
  { tag: "AJM-AT-001", unidade: "PA ORIENTE", local: "ATENDIMENTO" },
  { tag: "APA-AT-007", unidade: "PA PARAIBUNA CENTRO", local: "ATENDIMENTO" },
  { tag: "ASB-AT-001", unidade: "PA SÃO SEBASTIÃO", local: "ATENDIMENTO" },
  { tag: "ASB-AT-002", unidade: "PA SÃO SEBASTIÃO", local: "ATENDIMENTO" },
  { tag: "ASF-AT-001", unidade: "PA SFX", local: "ATENDIMENTO" },
  { tag: "ASF-AT-002", unidade: "PA SFX", local: "ATENDIMENTO SEBRAE" },
  { tag: "ATB-AT-001", unidade: "PA TAUBATÉ", local: "ATENDIMENTO" },
  { tag: "AUB-AT-001", unidade: "PA UBATUBA", local: "ATENDIMENTO" },
];

async function main() {
  const senha = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@amg.com.br" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@amg.com.br",
      senha,
      perfil: "ADMIN",
    },
  });

  await prisma.responsavelTecnico.upsert({
    where: { id: "responsavel-luiz-pellegrini" },
    update: {
      nome: "LUIZ PELLEGRINI",
      crea: "0682189924",
      registroConselho: "ENGENHEIRO INDUSTRIAL - MECÂNICA - RNP 2602139106",
      art: "2620250917094",
      ativo: true,
    },
    create: {
      id: "responsavel-luiz-pellegrini",
      nome: "LUIZ PELLEGRINI",
      crea: "0682189924",
      registroConselho: "ENGENHEIRO INDUSTRIAL - MECÂNICA - RNP 2602139106",
      art: "2620250917094",
      ativo: true,
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { id: "cliente-sicoob-cressem" },
    update: {
      nome: "SICOOB CRESSEM",
      cnpj: "54190525000166",
      contrato: "AMG 300525",
      endereco: "AV. MIGUEL VARLEZ, Nº 227",
      cidade: "CARAGUATATUBA",
      estado: "SP",
      cep: "11660-650",
    },
    create: {
      id: "cliente-sicoob-cressem",
      nome: "SICOOB CRESSEM",
      cnpj: "54190525000166",
      contrato: "AMG 300525",
      endereco: "AV. MIGUEL VARLEZ, Nº 227",
      cidade: "CARAGUATATUBA",
      estado: "SP",
      cep: "11660-650",
    },
  });

  for (const item of tags) {
    const ambiente = await prisma.ambiente.upsert({
      where: { id: `ambiente-${slug(item.unidade)}-${slug(item.local)}` },
      update: {
        nome: item.unidade,
        descricao: item.local,
        clienteId: cliente.id,
      },
      create: {
        id: `ambiente-${slug(item.unidade)}-${slug(item.local)}`,
        nome: item.unidade,
        descricao: item.local,
        clienteId: cliente.id,
      },
    });

    const equipamento = await prisma.equipamento.upsert({
      where: { id: `equipamento-${slug(item.tag)}` },
      update: {
        tag: item.tag.trim(),
        nome: `${item.unidade.trim()} - ${item.local.trim()}`,
        localizacao: item.local.trim(),
        ambienteId: ambiente.id,
      },
      create: {
        id: `equipamento-${slug(item.tag)}`,
        tag: item.tag.trim(),
        nome: `${item.unidade.trim()} - ${item.local.trim()}`,
        localizacao: item.local.trim(),
        ambienteId: ambiente.id,
      },
    });

    const plano = await prisma.planoManutencao.upsert({
      where: { id: `plano-${slug(item.tag)}-mensal` },
      update: {
        nome: "Plano PMOC Mensal",
        periodicidade: "MENSAL",
        equipamentoId: equipamento.id,
      },
      create: {
        id: `plano-${slug(item.tag)}-mensal`,
        nome: "Plano PMOC Mensal",
        periodicidade: "MENSAL",
        equipamentoId: equipamento.id,
      },
    });

    await prisma.itemManutencao.deleteMany({
      where: { planoId: plano.id },
    });

    await prisma.itemManutencao.createMany({
      data: servicos.map((descricao, index) => ({
        descricao,
        periodicidade: "MENSAL",
        ordem: index + 1,
        planoId: plano.id,
      })),
    });
  }

  console.log("Seed PMOC AMG executado com sucesso.");
}

function slug(value: string) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });