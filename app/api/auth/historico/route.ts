import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
}

export async function GET() {
    const prisma = await getPrisma();

    const historico = await prisma.pmocGerado.findMany({
        include: {
            equipamento: {
                include: {
                    ambiente: {
                        include: {
                            cliente: true,
                        },
                    },
                },
            },
            responsavel: true,
        },
        orderBy: {
            dataGeracao: "desc",
        },
    });

    return NextResponse.json(historico);
}