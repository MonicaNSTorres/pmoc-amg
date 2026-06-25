import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
}

export async function GET() {
    const prisma = await getPrisma();

    const usuarios = await prisma.user.findMany({
        orderBy: { criadoEm: "desc" },
        select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
            ativo: true,
            criadoEm: true,
        },
    });

    return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    if (!body.nome || !body.email || !body.senha) {
        return NextResponse.json(
            { error: "Nome, email e senha são obrigatórios." },
            { status: 400 }
        );
    }

    const senhaHash = await bcrypt.hash(body.senha, 10);

    const usuario = await prisma.user.create({
        data: {
            nome: body.nome,
            email: body.email,
            senha: senhaHash,
            perfil: body.perfil || "TECNICO",
            ativo: true,
        },
    });

    return NextResponse.json(usuario);
}

export async function PUT(req: Request) {
    const prisma = await getPrisma();
    const body = await req.json();

    if (!body.id) {
        return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const data: any = {
        nome: body.nome,
        email: body.email,
        perfil: body.perfil,
        ativo: Boolean(body.ativo),
    };

    if (body.senha) {
        data.senha = await bcrypt.hash(body.senha, 10);
    }

    const usuario = await prisma.user.update({
        where: { id: body.id },
        data,
    });

    return NextResponse.json(usuario);
}

export async function DELETE(req: Request) {
    const prisma = await getPrisma();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "ID não informado." }, { status: 400 });
    }

    await prisma.user.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}