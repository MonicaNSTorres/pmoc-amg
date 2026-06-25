import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";

type UltimoPmoc = {
    id: string;
    dataGeracao: Date;
    equipamento: {
        tag: string;
        nome: string;
        ambiente: {
            cliente: {
                nome: string;
            };
        };
    };
    responsavel: {
        nome: string;
    };
};

export default async function DashboardPage() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [
        clientes,
        ambientes,
        equipamentos,
        pmocs,
        pmocsMes,
        ultimosPmocs,
    ] = await Promise.all([
        prisma.cliente.count(),
        prisma.ambiente.count(),
        prisma.equipamento.count(),
        prisma.pmocGerado.count(),
        prisma.pmocGerado.count({
            where: {
                dataGeracao: {
                    gte: inicioMes,
                },
            },
        }),
        prisma.pmocGerado.findMany({
            take: 5,
            orderBy: { dataGeracao: "desc" },
            include: {
                equipamento: {
                    include: {
                        ambiente: {
                            include: {
                                cliente: true,
                            },
                        },
                    },
                },
                responsavel: true,
            },
        }),
    ]);

    return (
        <AppShell>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Visão geral do sistema PMOC AMG
                    </p>
                </div>

                <Link
                    href="/nova-os"
                    className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-black text-white"
                >
                    + Nova OS PMOC
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                <Card title="Clientes" value={clientes} />
                <Card title="Ambientes" value={ambientes} />
                <Card title="Equipamentos" value={equipamentos} />
                <Card title="PMOCs emitidos" value={pmocs} />
                <Card title="PMOCs no mês" value={pmocsMes} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-black text-slate-900">
                        Últimos PMOCs gerados
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-slate-500">
                                    <th className="py-3">Data</th>
                                    <th>Cliente</th>
                                    <th>TAG</th>
                                    <th>Equipamento</th>
                                    <th>Responsável</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ultimosPmocs.map((pmoc: UltimoPmoc) => (
                                    <tr key={pmoc.id} className="border-b">
                                        <td className="py-4 font-bold">
                                            {pmoc.dataGeracao.toLocaleDateString("pt-BR")}
                                        </td>
                                        <td>
                                            {pmoc.equipamento.ambiente.cliente.nome}
                                        </td>
                                        <td className="font-bold text-blue-900">
                                            {pmoc.equipamento.tag}
                                        </td>
                                        <td>{pmoc.equipamento.nome}</td>
                                        <td>{pmoc.responsavel.nome}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!ultimosPmocs.length && (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Nenhum PMOC gerado ainda.
                            </p>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-black text-slate-900">
                        Ações rápidas
                    </h2>

                    <div className="space-y-3">
                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-slate-50" href="/nova-os">
                            Gerar nova OS PMOC
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-slate-50" href="/historico">
                            Ver histórico de PMOCs
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-slate-50" href="/equipamentos">
                            Cadastrar equipamento/TAG
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-slate-50" href="/pmoc">
                            Gerenciar planos PMOC
                        </Link>
                    </div>
                </div>
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