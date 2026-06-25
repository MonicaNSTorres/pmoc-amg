import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const planos = await prisma.planoManutencao.findMany({
        include: {
            equipamento: true,
            itens: {
                orderBy: { ordem: "asc" },
            },
        },
        orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(planos);
}

export async function POST(req: Request) {
    const body = await req.json();

    const plano = await prisma.planoManutencao.create({
        data: {
            nome: body.nome,
            periodicidade: body.periodicidade,
            equipamentoId: body.equipamentoId,
            itens: {
                create: body.itens.map((item: string, index: number) => ({
                    descricao: item,
                    periodicidade: body.periodicidade,
                    ordem: index + 1,
                })),
            },
        },
    });

    return NextResponse.json(plano);
}