"use client";

import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100">
            <AppSidebar aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />

            <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white px-4 shadow-sm lg:hidden">
                <button
                    type="button"
                    onClick={() => setMenuAberto(true)}
                    className="rounded-xl border px-3 py-2 text-xl font-black text-slate-900 hover:bg-blue-900 hover:text-white hover:border-blue-900 cursor-pointer"
                >
                    ☰
                </button>

                <div>
                    <p className="text-sm font-black text-slate-900">AMG</p>
                    <p className="text-xs text-slate-500">Sistema PMOC</p>
                </div>
            </header>

            <main className="min-h-screen p-4 lg:ml-64 lg:p-8">
                {children}
            </main>
        </div>
    );
}