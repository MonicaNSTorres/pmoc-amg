import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const ambientes = await prisma.ambiente.findMany({
        include: {
            cliente: true,
        },
        orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(ambientes);
}

export async function POST(req: Request) {
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "ID não informado." },
            { status: 400 }
        );
    }

    await prisma.ambiente.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}