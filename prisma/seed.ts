import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import path from "node:path";

const prisma = new PrismaClient();

type LinhaExcel = {
  NOME: string;
  AMBIENTE: string;
  LOCAL: string;
  TAG: string;
  ENDERECO: string;
  CNPJ: string;
  MODELO: string;
  NUMERO_SERIE: string;
};

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

async function main() {
  console.log("================================================");
  console.log("Iniciando seed do sistema PMOC AMG");
  console.log("================================================");

  await criarUsuarioAdministrador();
  await criarResponsavelTecnico();

  const cliente = await criarClienteSicoob();

  const linhas = lerPlanilha();

  console.log(`Linhas encontradas na planilha: ${linhas.length}`);

  const tagsProcessadas = new Set<string>();

  let ambientesCriados = 0;
  let ambientesAtualizados = 0;
  let equipamentosCriados = 0;
  let equipamentosAtualizados = 0;
  let linhasIgnoradas = 0;
  let tagsDuplicadas = 0;
  let planosProcessados = 0;

  for (const [indice, linha] of linhas.entries()) {
    const numeroLinhaExcel = indice + 2;

    try {
      const nomeUnidade = normalizarTexto(linha.NOME);
      const nomeAmbiente = normalizarTexto(linha.AMBIENTE);
      const local = normalizarTexto(linha.LOCAL);
      const tag = normalizarTexto(linha.TAG).toUpperCase();
      const endereco = normalizarTexto(linha.ENDERECO);
      const modelo = normalizarTexto(linha.MODELO);
      const numeroSerie = normalizarTexto(linha.NUMERO_SERIE);

      if (!nomeUnidade || !nomeAmbiente || !local || !tag) {
        console.warn(
          `Linha ${numeroLinhaExcel} ignorada: NOME, AMBIENTE, LOCAL ou TAG não preenchidos.`,
        );

        linhasIgnoradas++;
        continue;
      }

      /*
       * A coluna TAG possui valores únicos no banco.
       * Caso a planilha tenha a mesma TAG mais de uma vez,
       * apenas a primeira ocorrência será importada.
       */
      if (tagsProcessadas.has(tag)) {
        console.warn(
          `Linha ${numeroLinhaExcel} ignorada: TAG duplicada na planilha (${tag}).`,
        );

        tagsDuplicadas++;
        continue;
      }

      tagsProcessadas.add(tag);

      const ambienteId = `ambiente-${slug(nomeUnidade)}-${slug(nomeAmbiente)}`;

      const ambienteExistente = await prisma.ambiente.findUnique({
        where: {
          id: ambienteId,
        },
        select: {
          id: true,
        },
      });

      const descricaoAmbiente = montarDescricaoAmbiente({
        nomeUnidade,
        endereco,
      });

      const ambiente = await prisma.ambiente.upsert({
        where: {
          id: ambienteId,
        },
        update: {
          nome: nomeAmbiente,
          descricao: descricaoAmbiente,
          clienteId: cliente.id,
          ativo: true,
        },
        create: {
          id: ambienteId,
          nome: nomeAmbiente,
          descricao: descricaoAmbiente,
          clienteId: cliente.id,
          ativo: true,
        },
      });

      if (ambienteExistente) {
        ambientesAtualizados++;
      } else {
        ambientesCriados++;
      }

      const equipamentoExistente = await prisma.equipamento.findUnique({
        where: {
          tag,
        },
        select: {
          id: true,
        },
      });

      const marca = identificarMarca(modelo);
      const capacidade = identificarCapacidade(modelo);

      const equipamento = await prisma.equipamento.upsert({
        where: {
          tag,
        },
        update: {
          nome: montarNomeEquipamento({
            tag,
            local,
          }),
          marca,
          modelo: modelo || null,
          numeroSerie: numeroSerie || null,
          capacidade,
          localizacao: local,
          ambienteId: ambiente.id,
          ativo: true,
        },
        create: {
          id: `equipamento-${slug(tag)}`,
          tag,
          nome: montarNomeEquipamento({
            tag,
            local,
          }),
          marca,
          modelo: modelo || null,
          numeroSerie: numeroSerie || null,
          capacidade,
          localizacao: local,
          ambienteId: ambiente.id,
          ativo: true,
        },
      });

      if (equipamentoExistente) {
        equipamentosAtualizados++;
      } else {
        equipamentosCriados++;
      }

      const planoId = `plano-${slug(tag)}-mensal`;

      const plano = await prisma.planoManutencao.upsert({
        where: {
          id: planoId,
        },
        update: {
          nome: "Plano PMOC Mensal",
          periodicidade: "MENSAL",
          equipamentoId: equipamento.id,
          ativo: true,
        },
        create: {
          id: planoId,
          nome: "Plano PMOC Mensal",
          periodicidade: "MENSAL",
          equipamentoId: equipamento.id,
          ativo: true,
        },
      });

      /*
       * Remove somente os itens do plano que está sendo processado.
       * Não apaga equipamentos, ambientes nem históricos de PMOC.
       */
      await prisma.itemManutencao.deleteMany({
        where: {
          planoId: plano.id,
        },
      });

      await prisma.itemManutencao.createMany({
        data: servicos.map((descricao, index) => ({
          descricao,
          periodicidade: "MENSAL",
          ordem: index + 1,
          ativo: true,
          planoId: plano.id,
        })),
      });

      planosProcessados++;

      console.log(
        `Linha ${numeroLinhaExcel}: ${tag} importada com sucesso.`,
      );
    } catch (erro) {
      linhasIgnoradas++;

      console.error(
        `Erro ao processar a linha ${numeroLinhaExcel}:`,
        erro,
      );
    }
  }

  console.log("");
  console.log("================================================");
  console.log("Seed concluído com sucesso");
  console.log("================================================");
  console.log(`Ambientes criados: ${ambientesCriados}`);
  console.log(`Ambientes atualizados: ${ambientesAtualizados}`);
  console.log(`Equipamentos criados: ${equipamentosCriados}`);
  console.log(`Equipamentos atualizados: ${equipamentosAtualizados}`);
  console.log(`Planos processados: ${planosProcessados}`);
  console.log(`TAGs duplicadas ignoradas: ${tagsDuplicadas}`);
  console.log(`Outras linhas ignoradas: ${linhasIgnoradas}`);
  console.log("================================================");
}

async function criarUsuarioAdministrador() {
  const senha = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@amg.com.br",
    },
    update: {
      nome: "Administrador",
      perfil: "ADMIN",
      ativo: true,
    },
    create: {
      nome: "Administrador",
      email: "admin@amg.com.br",
      senha,
      perfil: "ADMIN",
      ativo: true,
    },
  });

  console.log("Usuário administrador processado.");
}

async function criarResponsavelTecnico() {
  await prisma.responsavelTecnico.upsert({
    where: {
      id: "responsavel-luiz-pellegrini",
    },
    update: {
      nome: "LUIZ PELLEGRINI",
      crea: "0682189924",
      registroConselho:
        "ENGENHEIRO INDUSTRIAL - MECÂNICA - RNP 2602139106",
      art: "2620250917094",
      ativo: true,
    },
    create: {
      id: "responsavel-luiz-pellegrini",
      nome: "LUIZ PELLEGRINI",
      crea: "0682189924",
      registroConselho:
        "ENGENHEIRO INDUSTRIAL - MECÂNICA - RNP 2602139106",
      art: "2620250917094",
      ativo: true,
    },
  });

  console.log("Responsável técnico processado.");
}

async function criarClienteSicoob() {
  const cliente = await prisma.cliente.upsert({
    where: {
      id: "cliente-sicoob-cressem",
    },
    update: {
      nome: "SICOOB CRESSEM",
      cnpj: "54190525000166",
      contrato: "AMG 300525",
      endereco:
        "RUA HENRIQUE DIAS, 1000, MONTE CASTELO",
      cidade: "SÃO JOSÉ DOS CAMPOS",
      estado: "SP",
      cep: "12215-260",
      ativo: true,
    },
    create: {
      id: "cliente-sicoob-cressem",
      nome: "SICOOB CRESSEM",
      cnpj: "54190525000166",
      contrato: "AMG 300525",
      endereco:
        "RUA HENRIQUE DIAS, 1000, MONTE CASTELO",
      cidade: "SÃO JOSÉ DOS CAMPOS",
      estado: "SP",
      cep: "12215-260",
      ativo: true,
    },
  });

  console.log("Cliente SICOOB CRESSEM processado.");

  return cliente;
}

function lerPlanilha(): LinhaExcel[] {
  const caminhoArquivo = path.join(
    process.cwd(),
    "scripts",
    "PMOC SICOOBCRESSEM 2026.xlsx",
  );

  console.log(`Lendo planilha: ${caminhoArquivo}`);

  const workbook = XLSX.readFile(caminhoArquivo);

  const nomePrimeiraAba = workbook.SheetNames[0];

  if (!nomePrimeiraAba) {
    throw new Error("A planilha não possui nenhuma aba.");
  }

  const planilha = workbook.Sheets[nomePrimeiraAba];

  if (!planilha) {
    throw new Error(
      `Não foi possível acessar a aba ${nomePrimeiraAba}.`,
    );
  }

  const dadosBrutos = XLSX.utils.sheet_to_json<
    Record<string, unknown>
  >(planilha, {
    defval: "",
    raw: false,
  });

  return dadosBrutos
    .map((linha) => normalizarLinhaExcel(linha))
    .filter((linha) => {
      return Boolean(
        linha.NOME ||
          linha.AMBIENTE ||
          linha.LOCAL ||
          linha.TAG,
      );
    });
}

function normalizarLinhaExcel(
  linhaOriginal: Record<string, unknown>,
): LinhaExcel {
  /*
   * Sua planilha possui alguns títulos com espaços no final,
   * como "LOCAL ", "TAG " e "ENDEREÇO ".
   *
   * Aqui removemos esses espaços automaticamente.
   */
  const linha: Record<string, unknown> = {};

  for (const [chave, valor] of Object.entries(linhaOriginal)) {
    const chaveNormalizada = normalizarCabecalho(chave);
    linha[chaveNormalizada] = valor;
  }

  return {
    NOME: converterParaTexto(linha.NOME),
    AMBIENTE: converterParaTexto(linha.AMBIENTE),
    LOCAL: converterParaTexto(linha.LOCAL),
    TAG: converterParaTexto(linha.TAG),
    ENDERECO: converterParaTexto(linha.ENDERECO),
    CNPJ: somenteNumeros(converterParaTexto(linha.CNPJ)),
    MODELO: converterParaTexto(linha.MODELO),
    NUMERO_SERIE: converterParaTexto(linha.NUMERO_DE_SERIE),
  };
}

function normalizarCabecalho(valor: string) {
  return String(valor)
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function converterParaTexto(valor: unknown) {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor).trim();
}

function normalizarTexto(valor: unknown) {
  return converterParaTexto(valor)
    .replace(/\s+/g, " ")
    .trim();
}

function somenteNumeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function montarDescricaoAmbiente({
  nomeUnidade,
  endereco,
}: {
  nomeUnidade: string;
  endereco: string;
}) {
  const partes = [`Unidade: ${nomeUnidade}`];

  if (endereco) {
    partes.push(`Endereço: ${endereco}`);
  }

  return partes.join(" | ");
}

function montarNomeEquipamento({
  tag,
  local,
}: {
  tag: string;
  local: string;
}) {
  return `Ar-condicionado ${tag} - ${local}`;
}

function identificarMarca(modelo: string): string | null {
  if (!modelo) {
    return null;
  }

  const texto = modelo.toUpperCase();

  const marcas = [
    "LG",
    "SAMSUNG",
    "SPRINGER",
    "MIDEA",
    "CARRIER",
    "DAIKIN",
    "FUJITSU",
    "GREE",
    "ELGIN",
    "ELECTROLUX",
    "PHILCO",
    "AGRATTO",
    "KOMECO",
    "YORK",
    "HITACHI",
    "TRANE",
    "CONSUL",
  ];

  const marcaEncontrada = marcas.find((marca) =>
    texto.includes(marca),
  );

  return marcaEncontrada || null;
}

function identificarCapacidade(modelo: string): string | null {
  if (!modelo) {
    return null;
  }

  const texto = modelo.toUpperCase();

  const capacidadeMatch = texto.match(
    /(\d{1,3}(?:[.\s]?\d{3})?)\s*(?:BTU|BTUS)/i,
  );

  if (!capacidadeMatch?.[1]) {
    return null;
  }

  const capacidadeNumerica = capacidadeMatch[1].replace(
    /[.\s]/g,
    "",
  );

  return `${capacidadeNumerica} BTUs`;
}

function slug(valor: string) {
  const resultado = String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return resultado || "sem-identificacao";
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error("");
    console.error("Erro ao executar o seed:");
    console.error(erro);

    await prisma.$disconnect();
    process.exit(1);
  });