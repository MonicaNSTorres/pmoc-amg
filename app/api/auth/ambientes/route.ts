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

    const ambientes = await prisma.ambiente.findMany({
        include: {
            cliente: true,
        },
        orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(ambientes);
}

export async function POST(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    const ambiente = await prisma.ambiente.create({
        data: {
            nome: body.nome,
            descricao: body.descricao || null,
            clienteId: body.clienteId,
        },
    });

    return NextResponse.json(ambiente);
}

export async function PUT(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    if (!body.id) {
        return NextResponse.json(
            { error: "ID do ambiente é obrigatório." },
            { status: 400 }
        );
    }

    const ambiente = await prisma.ambiente.update({
        where: { id: body.id },
        data: {
            nome: body.nome,
            descricao: body.descricao || null,
            clienteId: body.clienteId,
        },
    });

    return NextResponse.json(ambiente);
}

export async function DELETE(req: Request) {
    try {
        const prisma = await getPrisma();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID do ambiente não informado." },
                { status: 400 }
            );
        }

        const ambiente = await prisma.ambiente.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        equipamentos: true,
                    },
                },
            },
        });

        if (!ambiente) {
            return NextResponse.json(
                { error: "Ambiente não encontrado." },
                { status: 404 }
            );
        }

        if (ambiente._count.equipamentos > 0) {
            return NextResponse.json(
                {
                    error:
                        `Não é possível excluir este ambiente, pois existem ` +
                        `${ambiente._count.equipamentos} equipamento(s) vinculado(s) a ele.`,
                },
                { status: 409 }
            );
        }

        await prisma.ambiente.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Ambiente excluído com sucesso.",
        });
    } catch (error) {
        console.error("Erro ao excluir ambiente:", error);

        return NextResponse.json(
            { error: "Não foi possível excluir o ambiente." },
            { status: 500 }
        );
    }
}