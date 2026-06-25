import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const clientes = await prisma.cliente.findMany({
        orderBy: { criadoEm: "desc" },
    });

    return NextResponse.json(clientes);
}

export async function POST(req: Request) {
    const body = await req.json();

    const cliente = await prisma.cliente.create({
        data: {
            nome: body.nome,
            cnpj: body.cnpj || null,
            contrato: body.contrato || null,
            endereco: body.endereco || null,
            cidade: body.cidade || null,
            estado: body.estado || null,
            cep: body.cep || null,
        },
    });

    return NextResponse.json(cliente);
}

export async function PUT(req: Request) {
    const body = await req.json();

    if (!body.id) {
        return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const cliente = await prisma.cliente.update({
        where: { id: body.id },
        data: {
            nome: body.nome,
            cnpj: body.cnpj || null,
            contrato: body.contrato || null,
            endereco: body.endereco || null,
            cidade: body.cidade || null,
            estado: body.estado || null,
            cep: body.cep || null,
        },
    });

    return NextResponse.json(cliente);
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID não informado." }, { status: 400 });
    }

    await prisma.cliente.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}