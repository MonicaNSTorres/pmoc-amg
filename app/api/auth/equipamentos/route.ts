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

    const equipamentos = await prisma.equipamento.findMany({
        include: {
            ambiente: {
                include: {
                    cliente: true,
                },
            },
        },
        orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(equipamentos);
}

export async function POST(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    const equipamento = await prisma.equipamento.create({
        data: {
            tag: body.tag,
            nome: body.nome,
            marca: body.marca || null,
            modelo: body.modelo || null,
            capacidade: body.capacidade || null,
            localizacao: body.localizacao || null,
            ambienteId: body.ambienteId,
        },
    });

    return NextResponse.json(equipamento);
}

export async function PUT(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    if (!body.id) {
        return NextResponse.json(
            { error: "ID do equipamento é obrigatório." },
            { status: 400 }
        );
    }

    const equipamento = await prisma.equipamento.update({
        where: { id: body.id },
        data: {
            tag: body.tag,
            nome: body.nome,
            marca: body.marca || null,
            modelo: body.modelo || null,
            capacidade: body.capacidade || null,
            localizacao: body.localizacao || null,
            ambienteId: body.ambienteId,
        },
    });

    return NextResponse.json(equipamento);
}

export async function DELETE(req: Request) {
    const prisma = await getPrisma();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "ID não informado." },
            { status: 400 }
        );
    }

    await prisma.equipamento.delete({
        where: { id },
    });

    return NextResponse.json({
        success: true,
    });
}