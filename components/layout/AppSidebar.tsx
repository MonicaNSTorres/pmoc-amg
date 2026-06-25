import Link from "next/link";

export function AppSidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 p-5 text-white">
            <div className="mb-10">
                <div className="text-2xl font-black">AMG</div>
                <div className="text-sm text-slate-400">Sistema PMOC</div>
            </div>

            <nav className="space-y-2 text-sm font-semibold">
                <Link href="/dashboard" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Dashboard
                </Link>
                <Link href="/clientes" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Clientes
                </Link>
                <Link href="/ambientes" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Ambientes
                </Link>
                <Link href="/equipamentos" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Equipamentos
                </Link>
                <Link href="/pmoc" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    PMOC
                </Link>
                <Link href="/historico" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Histórico
                </Link>
                <Link href="/usuarios" className="block rounded-xl px-4 py-3 hover:bg-white/10">
                    Usuários
                </Link>
            </nav>
        </aside>
    );
}