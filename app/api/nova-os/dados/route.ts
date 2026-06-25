import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
}

export async function GET() {
    try {
        const prisma = await getPrisma();

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
                orderBy: {
                    tag: "asc",
                },
            }),

            prisma.planoManutencao.findMany({
                where: { ativo: true },
                include: {
                    equipamento: true,
                    itens: {
                        where: {
                            ativo: true,
                        },
                        orderBy: {
                            ordem: "asc",
                        },
                    },
                },
                orderBy: {
                    criadoEm: "desc",
                },
            }),

            prisma.responsavelTecnico.findMany({
                where: {
                    ativo: true,
                },
                orderBy: {
                    criadoEm: "desc",
                },
            }),
        ]);

        return NextResponse.json({
            equipamentos,
            planos,
            responsaveis,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Erro ao carregar dados.",
            },
            {
                status: 500,
            }
        );
    }
}