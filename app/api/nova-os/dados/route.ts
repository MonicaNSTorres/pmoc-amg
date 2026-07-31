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

        let equipamentos;

        try {
            equipamentos = await prisma.equipamento.findMany({
                where: {
                    ativo: true,
                },
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
            });
        } catch (error) {
            console.error(
                "Erro ao buscar equipamentos da Nova OS:",
                error
            );

            throw new Error(
                `Erro ao buscar equipamentos: ${obterMensagemErro(error)}`
            );
        }

        let planos;

        try {
            planos = await prisma.planoManutencao.findMany({
                where: {
                    ativo: true,
                },
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
            });
        } catch (error) {
            console.error(
                "Erro ao buscar planos da Nova OS:",
                error
            );

            throw new Error(
                `Erro ao buscar planos: ${obterMensagemErro(error)}`
            );
        }

        let responsaveis;

        try {
            responsaveis =
                await prisma.responsavelTecnico.findMany({
                    where: {
                        ativo: true,
                    },
                    orderBy: {
                        criadoEm: "desc",
                    },
                });
        } catch (error) {
            console.error(
                "Erro ao buscar responsáveis da Nova OS:",
                error
            );

            throw new Error(
                `Erro ao buscar responsáveis: ${obterMensagemErro(error)}`
            );
        }

        return NextResponse.json({
            equipamentos,
            planos,
            responsaveis,
        });
    } catch (error) {
        const mensagem = obterMensagemErro(error);

        console.error(
            "Erro na rota GET /api/nova-os/dados:",
            error
        );

        return NextResponse.json(
            {
                error: "Erro ao carregar dados.",
                detail:
                    process.env.NODE_ENV === "development"
                        ? mensagem
                        : undefined,
            },
            {
                status: 500,
            }
        );
    }
}

function obterMensagemErro(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}