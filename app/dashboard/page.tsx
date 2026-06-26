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

    const [clientes, ambientes, equipamentos, pmocs, pmocsMes, ultimosPmocs] =
        await Promise.all([
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
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Visão geral do sistema PMOC AMG
                    </p>
                </div>

                <Link
                    href="/nova-os"
                    className="w-full rounded-xl bg-blue-900 px-5 py-3 text-center text-sm font-black text-white sm:w-auto"
                >
                    + Nova OS PMOC
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Card title="Clientes" value={clientes} />
                <Card title="Ambientes" value={ambientes} />
                <Card title="Equipamentos" value={equipamentos} />
                <Card title="PMOCs emitidos" value={pmocs} />
                <Card title="PMOCs no mês" value={pmocsMes} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:mt-8 xl:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="mb-5 text-lg font-black text-slate-900">
                        Últimos PMOCs gerados
                    </h2>

                    <div className="hidden overflow-x-auto md:block">
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
                                        <td>{pmoc.equipamento.ambiente.cliente.nome}</td>
                                        <td className="font-bold text-blue-900">
                                            {pmoc.equipamento.tag}
                                        </td>
                                        <td>{pmoc.equipamento.nome}</td>
                                        <td>{pmoc.responsavel.nome}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3 md:hidden">
                        {ultimosPmocs.map((pmoc: UltimoPmoc) => (
                            <div key={pmoc.id} className="rounded-2xl border p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-black text-slate-900">
                                        {pmoc.equipamento.tag}
                                    </p>
                                    <span className="text-xs font-bold text-slate-500">
                                        {pmoc.dataGeracao.toLocaleDateString("pt-BR")}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                    {pmoc.equipamento.ambiente.cliente.nome}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {pmoc.equipamento.nome}
                                </p>
                                <p className="mt-3 text-xs font-bold text-slate-400">
                                    Responsável: {pmoc.responsavel.nome}
                                </p>
                            </div>
                        ))}
                    </div>

                    {!ultimosPmocs.length && (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Nenhum PMOC gerado ainda.
                        </p>
                    )}
                </div>

                <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                    <h2 className="mb-5 text-lg font-black text-slate-900">
                        Ações rápidas
                    </h2>

                    <div className="space-y-3">
                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-blue-900 hover:text-white" href="/nova-os">
                            Gerar nova OS PMOC
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-blue-900 hover:text-white" href="/historico">
                            Ver histórico de PMOCs
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-blue-900 hover:text-white" href="/equipamentos">
                            Cadastrar equipamento/TAG
                        </Link>

                        <Link className="block rounded-2xl border p-4 text-sm font-black text-slate-800 hover:bg-blue-900 hover:text-white" href="/pmoc">
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
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-bold text-slate-500">{title}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:mt-4 sm:text-4xl">
                {value}
            </h2>
        </div>
    );
}