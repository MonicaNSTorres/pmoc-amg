import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ASSINATURA_PELLEGRINI = "data:image/jpeg;base64,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";

export async function POST(req: Request) {
    try {
        const { planoId, dataExecucao, observacao, itensMarcados } = await req.json();

        const plano = await prisma.planoManutencao.findUnique({
            where: { id: planoId },
            include: {
                itens: { orderBy: { ordem: "asc" } },
                equipamento: {
                    include: {
                        ambiente: {
                            include: {
                                cliente: true,
                            },
                        },
                    },
                },
            },
        });

        if (!plano) {
            return NextResponse.json(
                { error: "Plano não encontrado." },
                { status: 404 }
            );
        }

        const itensSelecionados = Array.isArray(itensMarcados) && itensMarcados.length
            ? plano.itens.filter((item) => itensMarcados.includes(item.id))
            : plano.itens;

        if (!itensSelecionados.length) {
            return NextResponse.json(
                { error: "Nenhum serviço selecionado." },
                { status: 400 }
            );
        }

        const responsavel = await prisma.responsavelTecnico.findFirst({
            where: { ativo: true },
        });

        if (!responsavel) {
            return NextResponse.json(
                { error: "Responsável técnico não cadastrado." },
                { status: 400 }
            );
        }

        const equipamento = plano.equipamento;
        const ambiente = equipamento.ambiente;
        const cliente = ambiente.cliente;

        const doc = new jsPDF("p", "mm", "a4");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("PLANO DE MANUTENÇÃO, OPERAÇÃO E CONTROLE - PMOC", 105, 15, {
            align: "center",
        });

        doc.setFontSize(10);
        doc.text("1 - IDENTIFICAÇÃO DO AMBIENTE OU CONJUNTO DE AMBIENTES:", 14, 30);

        doc.setFont("helvetica", "normal");
        doc.text(`NOME: ${cliente.nome}`, 14, 40);
        doc.text(`TAG: ${equipamento.tag} - ${equipamento.nome}`, 14, 47);
        doc.text(`ENDEREÇO: ${cliente.endereco || "-"}`, 14, 54);
        doc.text(`CNPJ: ${cliente.cnpj || "-"}`, 14, 61);
        doc.text(`CONTRATO: ${cliente.contrato || "-"}`, 14, 68);

        doc.setFont("helvetica", "bold");
        doc.text("3 - IDENTIFICAÇÃO DO RESPONSÁVEL TÉCNICO:", 14, 82);

        doc.setFont("helvetica", "normal");
        doc.text(`NOME: ${responsavel.nome}`, 14, 92);
        doc.text(`CREASP: ${responsavel.crea}`, 14, 99);
        doc.text(`REGISTRO NO CONSELHO: ${responsavel.registroConselho}`, 14, 106);
        doc.text(`ART: ${responsavel.art}`, 14, 113);

        doc.setFont("helvetica", "bold");
        doc.text("5 - PLANO DE MANUTENÇÃO E CONTROLE", 14, 128);

        autoTable(doc, {
            startY: 135,
            head: [["DESCRIÇÃO", "PERIODICIDADE", "DATA EXECUÇÃO"]],
            body: itensSelecionados.map((item) => [
                item.descricao,
                item.periodicidade,
                formatDateBR(dataExecucao),
            ]),
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [30, 41, 59],
            },
            columnStyles: {
                0: { cellWidth: 110 },
                1: { cellWidth: 35 },
                2: { cellWidth: 35 },
            },
        });

        let finalY = (doc as any).lastAutoTable.finalY + 12;

        if (observacao) {
            doc.setFont("helvetica", "bold");
            doc.text("OBSERVAÇÕES:", 14, finalY);

            doc.setFont("helvetica", "normal");
            const linhasObs = doc.splitTextToSize(String(observacao), 180);
            doc.text(linhasObs, 14, finalY + 7);

            finalY += 18 + linhasObs.length * 4;
        }

        const assinatura =
            responsavel.assinaturaBase64 || ASSINATURA_PELLEGRINI;

        // largura da linha
        const larguraLinha = 90;
        const inicioLinha = (210 - larguraLinha) / 2;
        const fimLinha = inicioLinha + larguraLinha;

        // linha da assinatura
        doc.setDrawColor(80);
        doc.setLineWidth(0.4);
        doc.line(inicioLinha, finalY + 18, fimLinha, finalY + 18);

        // assinatura
        doc.addImage(
            assinatura,
            "JPEG",
            78,
            finalY - 6,
            54,
            22
        );

        //texto
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ENGENHEIRO RESPONSÁVEL", 105, finalY + 25, {
            align: "center",
        });

        //nome
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(responsavel.nome.toUpperCase(), 105, finalY + 31, {
            align: "center",
        });

        //CREA
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`CREA: ${responsavel.crea}`, 105, finalY + 36, {
            align: "center",
        });

        //ART
        doc.text(`ART: ${responsavel.art}`, 105, finalY + 41, {
            align: "center",
        });
        doc.setFontSize(9);
        doc.text(`DATA DE GERAÇÃO: ${formatDateBR(new Date())}`, 14, 285);

        const pdfBase64 = Buffer.from(doc.output("arraybuffer")).toString("base64");

        const pmocGerado = await prisma.pmocGerado.create({
            data: {
                dataExecucao: new Date(dataExecucao),
                observacao: observacao || null,
                pdfBase64,
                usuarioId: "cmqs5c8h50000j8kzb3v5rhw4",
                equipamentoId: equipamento.id,
                responsavelId: responsavel.id,
                itensExecutados: {
                    create: itensSelecionados.map((item) => ({
                        descricao: item.descricao,
                        periodicidade: item.periodicidade,
                        dataExecucao: new Date(dataExecucao),
                        concluido: true,
                        itemManutencaoId: item.id,
                    })),
                },
            },
        });

        return NextResponse.json({
            id: pmocGerado.id,
            pdfBase64,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erro ao gerar PMOC." },
            { status: 500 }
        );
    }
}

function formatDateBR(value: string | Date) {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR");
}