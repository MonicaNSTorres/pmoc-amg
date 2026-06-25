"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Historico = {
    id: string;
    dataExecucao: string;
    dataGeracao: string;
    pdfBase64?: string | null;
    equipamento: {
        tag: string;
        nome: string;
        ambiente: {
            nome: string;
            cliente: {
                nome: string;
            };
        };
    };
    responsavel: {
        nome: string;
    };
};

export default function HistoricoPage() {
    const [historico, setHistorico] = useState<Historico[]>([]);

    async function carregarHistorico() {
        const res = await fetch("/api/auth/historico");
        const data = await res.json();
        setHistorico(data);
    }

    function baixarPdf(item: Historico) {
        if (!item.pdfBase64) {
            alert("PDF não encontrado.");
            return;
        }

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${item.pdfBase64}`;
        link.download = `pmoc-${item.equipamento.tag}.pdf`;
        link.click();
    }

    useEffect(() => {
        carregarHistorico();
    }, []);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Histórico PMOC
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Consulte os relatórios PMOC gerados.
                </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Data execução</th>
                                <th>Cliente</th>
                                <th>Ambiente</th>
                                <th>TAG</th>
                                <th>Equipamento</th>
                                <th>Responsável</th>
                                <th>PDF</th>
                            </tr>
                        </thead>

                        <tbody>
                            {historico.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-4 font-bold">
                                        {new Date(item.dataExecucao).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td>{item.equipamento.ambiente.cliente.nome}</td>
                                    <td>{item.equipamento.ambiente.nome}</td>
                                    <td className="font-bold text-blue-900">
                                        {item.equipamento.tag}
                                    </td>
                                    <td>{item.equipamento.nome}</td>
                                    <td>{item.responsavel.nome}</td>
                                    <td>
                                        <button
                                            onClick={() => baixarPdf(item)}
                                            className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-black text-white"
                                        >
                                            Baixar PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!historico.length && (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Nenhum PMOC gerado ainda.
                        </p>
                    )}
                </div>
            </div>
        </AppShell>
    );
}