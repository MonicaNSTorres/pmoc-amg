import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const [equipamentos, planos, responsaveis] = await Promise.all([
        prisma.equipamento.findMany({
            where: { ativo: true },
            include: {
                ambiente: {
                    include: {
                        cliente: true,
                    },
                },
            },
            orderBy: { tag: "asc" },
        }),

        prisma.planoManutencao.findMany({
            where: { ativo: true },
            include: {
                equipamento: true,
                itens: {
                    where: { ativo: true },
                    orderBy: { ordem: "asc" },
                },
            },
            orderBy: { criadoEm: "desc" },
        }),

        prisma.responsavelTecnico.findMany({
            where: { ativo: true },
            orderBy: { criadoEm: "desc" },
        }),
    ]);

    return NextResponse.json({
        equipamentos,
        planos,
        responsaveis,
    });
}