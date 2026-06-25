import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardPage() {
    const [clientes, ambientes, equipamentos, pmocs] = await Promise.all([
        prisma.cliente.count(),
        prisma.ambiente.count(),
        prisma.equipamento.count(),
        prisma.pmocGerado.count(),
    ]);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Dashboard
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Visão geral do sistema PMOC AMG
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Card title="Clientes" value={clientes} />
                <Card title="Ambientes" value={ambientes} />
                <Card title="Equipamentos" value={equipamentos} />
                <Card title="PMOCs emitidos" value={pmocs} />
            </div>
        </AppShell>
    );
}

function Card({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <h2 className="mt-4 text-4xl font-black text-slate-900">
                {value}
            </h2>
        </div>
    );
}