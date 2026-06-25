import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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