import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

async function getPrisma() {
    const { prisma } = await import("@/lib/prisma");
    return prisma;
}

export async function POST(req: Request) {
    try {
        const prisma = await getPrisma();
        const { email, senha } = await req.json();

        if (!email || !senha) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.ativo) {
            return NextResponse.json(
                { error: "Usuário ou senha inválidos." },
                { status: 401 }
            );
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return NextResponse.json(
                { error: "Usuário ou senha inválidos." },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil,
            },
            process.env.JWT_SECRET || "pmoc-amg-secret",
            { expiresIn: "8h" }
        );

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil,
            },
        });

        response.cookies.set("pmoc_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8,
        });

        return response;
    } catch (error) {
        console.error("Erro no login:", error);

        return NextResponse.json(
            { error: "Erro interno ao realizar login." },
            { status: 500 }
        );
    }
}