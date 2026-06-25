"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Item = {
    id: string;
    descricao: string;
    periodicidade: string;
};

type Plano = {
    id: string;
    nome: string;
    periodicidade: string;
    equipamentoId: string;
    itens: Item[];
};

type Equipamento = {
    id: string;
    tag: string;
    nome: string;
    ambiente: {
        nome: string;
        cliente: {
            nome: string;
        };
    };
};

export default function NovaOsPage() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [planos, setPlanos] = useState<Plano[]>([]);

    const [equipamentoId, setEquipamentoId] = useState("");
    const [dataExecucao, setDataExecucao] = useState("");
    const [observacao, setObservacao] = useState("");
    const [itensMarcados, setItensMarcados] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    async function carregarDados() {
        const res = await fetch("/api/nova-os/dados");
        const data = await res.json();

        setEquipamentos(data.equipamentos || []);
        setPlanos(data.planos || []);
    }

    const equipamentoSelecionado = useMemo(() => {
        return equipamentos.find((equipamento) => equipamento.id === equipamentoId);
    }, [equipamentos, equipamentoId]);

    const planoSelecionado = useMemo(() => {
        return planos.find((plano) => plano.equipamentoId === equipamentoId);
    }, [planos, equipamentoId]);

    function marcarItem(itemId: string) {
        setItensMarcados((atual) =>
            atual.includes(itemId)
                ? atual.filter((id) => id !== itemId)
                : [...atual, itemId]
        );
    }

    async function gerarPmoc() {
        if (!equipamentoId) return alert("Selecione a TAG/equipamento.");
        if (!planoSelecionado) return alert("Nenhum plano PMOC encontrado para esta TAG.");
        if (!dataExecucao) return alert("Informe a data de execução.");
        if (!itensMarcados.length) return alert("Marque pelo menos um serviço executado.");

        setLoading(true);

        const res = await fetch("/api/pmoc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                planoId: planoSelecionado.id,
                dataExecucao,
                observacao,
                itensMarcados,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao gerar PMOC.");
            setLoading(false);
            return;
        }

        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.pdfBase64}`;
        link.download = `pmoc-${equipamentoSelecionado?.tag || "amg"}.pdf`;
        link.click();

        setLoading(false);
    }

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        setItensMarcados(planoSelecionado?.itens.map((item) => item.id) || []);
    }, [planoSelecionado]);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Nova OS PMOC
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Selecione a TAG, marque os serviços executados e gere o relatório PMOC.
                </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <select
                        value={equipamentoId}
                        onChange={(e) => setEquipamentoId(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="">Selecione a TAG</option>
                        {equipamentos.map((equipamento) => (
                            <option key={equipamento.id} value={equipamento.id}>
                                {equipamento.tag} - {equipamento.nome}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dataExecucao}
                        onChange={(e) => setDataExecucao(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    />
                </div>

                {equipamentoSelecionado && (
                    <div className="mt-5 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                        <p>
                            <strong>Cliente:</strong>{" "}
                            {equipamentoSelecionado.ambiente.cliente.nome}
                        </p>
                        <p className="mt-1">
                            <strong>Ambiente:</strong>{" "}
                            {equipamentoSelecionado.ambiente.nome}
                        </p>
                        <p className="mt-1">
                            <strong>TAG:</strong> {equipamentoSelecionado.tag}
                        </p>
                    </div>
                )}

                {equipamentoId && !planoSelecionado && (
                    <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                        Nenhum plano PMOC encontrado para esta TAG. Cadastre um plano na tela PMOC.
                    </div>
                )}

                {planoSelecionado && (
                    <div className="mt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">
                                    Serviços executados
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Checklist carregado automaticamente do plano {planoSelecionado.periodicidade}.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-900">
                                {planoSelecionado.periodicidade}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {planoSelecionado.itens.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={itensMarcados.includes(item.id)}
                                        onChange={() => marcarItem(item.id)}
                                        className="mt-1 h-4 w-4"
                                    />

                                    <span className="font-semibold text-slate-700">
                                        {item.descricao}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                        Observações
                    </label>

                    <textarea
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border px-4 py-3 text-sm"
                        placeholder="Informe observações da execução, se houver."
                    />
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={gerarPmoc}
                        disabled={loading}
                        className="rounded-xl bg-blue-900 px-8 py-3 text-sm font-black text-white disabled:opacity-60"
                    >
                        {loading ? "Gerando..." : "Gerar PMOC"}
                    </button>
                </div>
            </div>
        </AppShell>
    );
}