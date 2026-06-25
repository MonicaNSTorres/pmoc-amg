"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("admin@amg.com.br");
    const [senha, setSenha] = useState("123456");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            setLoading(true);
            setErro("");

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErro(data.error || "Erro ao realizar login.");
                return;
            }

            router.push("/dashboard");
        } catch (error) {
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-xl font-black text-white">
                        AMG
                    </div>

                    <h1 className="text-2xl font-black text-slate-900">
                        PMOC AMG
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Acesse o sistema de manutenção PMOC
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-900"
                            placeholder="admin@amg.com.br"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-700">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-900"
                            placeholder="Digite sua senha"
                        />
                    </div>

                    {erro && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-800 disabled:opacity-60"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </main>
    );
}