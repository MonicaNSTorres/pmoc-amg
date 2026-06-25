import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

        doc.setFont("helvetica", "bold");
        doc.text("ENGENHEIRO RESPONSÁVEL", 105, finalY + 10, { align: "center" });

        if (responsavel.assinaturaBase64) {
            doc.addImage(responsavel.assinaturaBase64, "JPEG", 75, finalY + 15, 60, 25);
        }

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