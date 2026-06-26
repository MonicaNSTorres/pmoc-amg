"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type AppSidebarProps = {
    aberto?: boolean;
    aoFechar?: () => void;
};

const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/clientes", label: "Clientes" },
    { href: "/ambientes", label: "Ambientes" },
    { href: "/equipamentos", label: "Equipamentos" },
    { href: "/pmoc", label: "PMOC" },
    { href: "/historico", label: "Histórico" },
    { href: "/usuarios", label: "Usuários" },
];

export function AppSidebar({ aberto = false, aoFechar }: AppSidebarProps) {
    const router = useRouter();

    async function sair() {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        aoFechar?.();
        router.push("/login");
        router.refresh();
    }

    return (
        <>
            {aberto && (
                <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={aoFechar}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <aside
                className={[
                    "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-950 p-5 text-white transition-transform duration-300 lg:w-64 lg:translate-x-0",
                    aberto ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <div className="text-2xl font-black">AMG</div>
                        <div className="text-sm text-slate-400">Sistema PMOC</div>
                    </div>

                    <button
                        type="button"
                        onClick={aoFechar}
                        className="cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-sm font-black lg:hidden"
                    >
                        ✕
                    </button>
                </div>

                <nav className="space-y-2 text-sm font-semibold">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={aoFechar}
                            className="block rounded-xl px-4 py-3 hover:bg-white/10"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/10 pt-5">
                    <button
                        type="button"
                        onClick={sair}
                        className="w-full cursor-pointer rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
                    >
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}