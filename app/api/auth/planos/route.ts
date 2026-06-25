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

        const planos = await prisma.planoManutencao.findMany({
            include: {
                equipamento: true,
                itens: {
                    orderBy: {
                        ordem: "asc",
                    },
                },
            },
            orderBy: {
                criadoEm: "desc",
            },
        });

        return NextResponse.json(planos);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao buscar planos." },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const prisma = await getPrisma();

        const body = await req.json();

        const plano = await prisma.planoManutencao.create({
            data: {
                nome: body.nome,
                periodicidade: body.periodicidade,
                equipamentoId: body.equipamentoId,
                itens: {
                    create: body.itens.map(
                        (item: string, index: number) => ({
                            descricao: item,
                            periodicidade: body.periodicidade,
                            ordem: index + 1,
                        })
                    ),
                },
            },
        });

        return NextResponse.json(plano);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao salvar plano." },
            { status: 500 }
        );
    }
}