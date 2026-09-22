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

type ModoGeracao = "INDIVIDUAL" | "LOTE";

export default function NovaOsPage() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [planos, setPlanos] = useState<Plano[]>([]);

    const [modoGeracao, setModoGeracao] = useState<ModoGeracao>("INDIVIDUAL");

    // Fluxo individual
    const [equipamentoId, setEquipamentoId] = useState("");
    const [dataExecucao, setDataExecucao] = useState("");
    const [observacao, setObservacao] = useState("");
    const [itensMarcados, setItensMarcados] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fluxo em lote
    const [clienteLote, setClienteLote] = useState("");
    const [ambienteLote, setAmbienteLote] = useState("");
    const [equipamentosMarcados, setEquipamentosMarcados] = useState<string[]>([]);
    const [dataExecucaoLote, setDataExecucaoLote] = useState("");
    const [observacaoLote, setObservacaoLote] = useState("");
    const [loadingLote, setLoadingLote] = useState(false);
    const [progressoLote, setProgressoLote] = useState("");

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

    const clientes = useMemo(() => {
        return [...new Set(equipamentos.map((equipamento) => equipamento.ambiente.cliente.nome))]
            .sort((a, b) => a.localeCompare(b));
    }, [equipamentos]);

    const ambientesDoCliente = useMemo(() => {
        if (!clienteLote) return [];

        return [
            ...new Set(
                equipamentos
                    .filter(
                        (equipamento) =>
                            equipamento.ambiente.cliente.nome === clienteLote
                    )
                    .map((equipamento) => equipamento.ambiente.nome)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [equipamentos, clienteLote]);

    const equipamentosDoAmbiente = useMemo(() => {
        if (!clienteLote || !ambienteLote) return [];

        return equipamentos
            .filter(
                (equipamento) =>
                    equipamento.ambiente.cliente.nome === clienteLote &&
                    equipamento.ambiente.nome === ambienteLote
            )
            .sort((a, b) => a.tag.localeCompare(b.tag));
    }, [equipamentos, clienteLote, ambienteLote]);

    const equipamentosComPlano = useMemo(() => {
        return equipamentosDoAmbiente.filter((equipamento) =>
            planos.some((plano) => plano.equipamentoId === equipamento.id)
        );
    }, [equipamentosDoAmbiente, planos]);

    const todosDisponiveisMarcados =
        equipamentosComPlano.length > 0 &&
        equipamentosComPlano.every((equipamento) =>
            equipamentosMarcados.includes(equipamento.id)
        );

    function obterPlanoDoEquipamento(equipamentoIdBusca: string) {
        return planos.find((plano) => plano.equipamentoId === equipamentoIdBusca);
    }

    function marcarItem(itemId: string) {
        setItensMarcados((atual) =>
            atual.includes(itemId)
                ? atual.filter((id) => id !== itemId)
                : [...atual, itemId]
        );
    }

    function marcarEquipamento(equipamentoIdMarcado: string) {
        setEquipamentosMarcados((atual) =>
            atual.includes(equipamentoIdMarcado)
                ? atual.filter((id) => id !== equipamentoIdMarcado)
                : [...atual, equipamentoIdMarcado]
        );
    }

    function alternarTodosEquipamentos() {
        if (todosDisponiveisMarcados) {
            setEquipamentosMarcados([]);
            return;
        }

        setEquipamentosMarcados(
            equipamentosComPlano.map((equipamento) => equipamento.id)
        );
    }

    function alterarClienteLote(cliente: string) {
        setClienteLote(cliente);
        setAmbienteLote("");
        setEquipamentosMarcados([]);
        setProgressoLote("");
    }

    function alterarAmbienteLote(ambiente: string) {
        setAmbienteLote(ambiente);
        setProgressoLote("");

        if (!ambiente) {
            setEquipamentosMarcados([]);
            return;
        }

        const equipamentosDoAmbienteSelecionado = equipamentos.filter(
            (equipamento) =>
                equipamento.ambiente.cliente.nome === clienteLote &&
                equipamento.ambiente.nome === ambiente
        );

        const equipamentosComPlano = equipamentosDoAmbienteSelecionado.filter(
            (equipamento) =>
                planos.some(
                    (plano) => plano.equipamentoId === equipamento.id
                )
        );

        setEquipamentosMarcados(
            equipamentosComPlano.map((equipamento) => equipamento.id)
        );
    }

    async function gerarPmoc() {
        if (!equipamentoId) return alert("Selecione a TAG/equipamento.");
        if (!planoSelecionado) return alert("Nenhum plano PMOC encontrado para esta TAG.");
        if (!dataExecucao) return alert("Informe a data de execução.");
        if (!itensMarcados.length) return alert("Marque pelo menos um serviço executado.");

        setLoading(true);

        try {
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
                return;
            }

            baixarPdfBase64(
                data.pdfBase64,
                `pmoc-${equipamentoSelecionado?.tag || "amg"}.pdf`
            );
        } finally {
            setLoading(false);
        }
    }

    async function gerarPmocsEmLote() {
        if (!clienteLote) return alert("Selecione o cliente.");
        if (!ambienteLote) return alert("Selecione o ambiente.");
        if (!equipamentosMarcados.length) {
            return alert("Selecione pelo menos um equipamento.");
        }
        if (!dataExecucaoLote) return alert("Informe a data de execução.");

        const selecionados = equipamentosDoAmbiente.filter((equipamento) =>
            equipamentosMarcados.includes(equipamento.id)
        );

        if (!selecionados.length) {
            return alert("Nenhum equipamento válido foi selecionado.");
        }

        setLoadingLote(true);
        setProgressoLote("");

        const gerados: string[] = [];
        const erros: string[] = [];

        try {
            for (let index = 0; index < selecionados.length; index++) {
                const equipamento = selecionados[index];
                const plano = obterPlanoDoEquipamento(equipamento.id);

                setProgressoLote(
                    `Gerando ${index + 1} de ${selecionados.length}: ${equipamento.tag}`
                );

                if (!plano) {
                    erros.push(`${equipamento.tag}: sem plano PMOC`);
                    continue;
                }

                try {
                    const res = await fetch("/api/pmoc", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            planoId: plano.id,
                            dataExecucao: dataExecucaoLote,
                            observacao: observacaoLote,
                            itensMarcados: plano.itens.map((item) => item.id),
                        }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        erros.push(
                            `${equipamento.tag}: ${data.error || "erro ao gerar PMOC"}`
                        );
                        continue;
                    }

                    baixarPdfBase64(
                        data.pdfBase64,
                        `pmoc-${equipamento.tag}.pdf`
                    );

                    gerados.push(equipamento.tag);

                    // Pequeno intervalo entre downloads para reduzir bloqueios do navegador.
                    await aguardar(250);
                } catch {
                    erros.push(`${equipamento.tag}: erro de comunicação`);
                }
            }

            if (erros.length) {
                alert(
                    `${gerados.length} PMOC(s) gerado(s) com sucesso.\n\n` +
                    `${erros.length} equipamento(s) não foram gerados:\n` +
                    erros.join("\n")
                );
            } else {
                alert(
                    `${gerados.length} PMOC(s) gerado(s) com sucesso para o ambiente ${ambienteLote}.`
                );
            }
        } finally {
            setLoadingLote(false);
            setProgressoLote("");
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    useEffect(() => {
        setItensMarcados(planoSelecionado?.itens.map((item) => item.id) || []);
    }, [planoSelecionado]);

    return (
        <AppShell>
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                    Nova OS PMOC
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Gere um PMOC individual por TAG ou vários PMOCs de uma vez por ambiente.
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-slate-100 p-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setModoGeracao("INDIVIDUAL")}
                    className={`rounded-xl px-5 py-3 text-sm font-black transition ${modoGeracao === "INDIVIDUAL"
                            ? "bg-blue-900 text-white shadow-sm"
                            : "bg-transparent text-slate-600 hover:bg-white"
                        }`}
                >
                    Individual por equipamento
                </button>

                <button
                    type="button"
                    onClick={() => setModoGeracao("LOTE")}
                    className={`rounded-xl px-5 py-3 text-sm font-black transition ${modoGeracao === "LOTE"
                            ? "bg-blue-900 text-white shadow-sm"
                            : "bg-transparent text-slate-600 hover:bg-white"
                        }`}
                >
                    Em lote por ambiente
                </button>
            </div>

            {modoGeracao === "INDIVIDUAL" ? (
                <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        <select
                            value={equipamentoId}
                            onChange={(e) => setEquipamentoId(e.target.value)}
                            className="w-full rounded-xl border px-4 py-3 text-sm"
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
                            className="w-full rounded-xl border px-4 py-3 text-sm"
                        />
                    </div>

                    {equipamentoSelecionado && (
                        <div className="mt-5 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <Info
                                    label="Cliente"
                                    value={equipamentoSelecionado.ambiente.cliente.nome}
                                />
                                <Info
                                    label="Ambiente"
                                    value={equipamentoSelecionado.ambiente.nome}
                                />
                                <Info
                                    label="TAG"
                                    value={equipamentoSelecionado.tag}
                                />
                            </div>
                        </div>
                    )}

                    {equipamentoId && !planoSelecionado && (
                        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">
                            Nenhum plano PMOC encontrado para esta TAG. Cadastre um plano na tela PMOC.
                        </div>
                    )}

                    {planoSelecionado && (
                        <div className="mt-8">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">
                                        Serviços executados
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Checklist carregado automaticamente do plano {planoSelecionado.periodicidade}.
                                    </p>
                                </div>

                                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-900">
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
                                            className="mt-1 h-5 w-5 shrink-0"
                                        />

                                        <span className="font-semibold leading-relaxed text-slate-700">
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
                            className="w-full rounded-xl bg-blue-900 px-8 py-3 text-sm font-black text-white disabled:opacity-60 sm:w-auto"
                        >
                            {loading ? "Gerando..." : "Gerar PMOC"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            Geração em lote por ambiente
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Selecione o cliente e o ambiente para gerar um PDF individual para cada equipamento escolhido.
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Cliente
                            </label>
                            <select
                                value={clienteLote}
                                onChange={(e) => alterarClienteLote(e.target.value)}
                                className="w-full rounded-xl border px-4 py-3 text-sm"
                            >
                                <option value="">Selecione o cliente</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente} value={cliente}>
                                        {cliente}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                Ambiente
                            </label>
                            <select
                                value={ambienteLote}
                                onChange={(e) => alterarAmbienteLote(e.target.value)}
                                disabled={!clienteLote}
                                className="w-full rounded-xl border px-4 py-3 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                            >
                                <option value="">Selecione o ambiente</option>
                                {ambientesDoCliente.map((ambiente) => (
                                    <option key={ambiente} value={ambiente}>
                                        {ambiente}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {ambienteLote && (
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Data da execução
                                </label>
                                <input
                                    type="date"
                                    value={dataExecucaoLote}
                                    onChange={(e) => setDataExecucaoLote(e.target.value)}
                                    className="w-full rounded-xl border px-4 py-3 text-sm"
                                />
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="text-xs font-bold uppercase text-blue-700">
                                    Selecionados
                                </p>
                                <p className="mt-1 text-2xl font-black text-blue-900">
                                    {equipamentosMarcados.length}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-blue-700">
                                    PDF(s) individual(is) serão gerados.
                                </p>
                            </div>
                        </div>
                    )}

                    {ambienteLote && (
                        <div className="mt-8">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="font-black text-slate-900">
                                        Equipamentos do ambiente
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {equipamentosDoAmbiente.length} equipamento(s) encontrado(s).
                                    </p>
                                </div>

                                {!!equipamentosComPlano.length && (
                                    <button
                                        type="button"
                                        onClick={alternarTodosEquipamentos}
                                        className="w-full rounded-xl border border-blue-900 px-4 py-2 text-sm font-black text-blue-900 sm:w-auto"
                                    >
                                        {todosDisponiveisMarcados
                                            ? "Desmarcar todos"
                                            : "Selecionar todos"}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                {equipamentosDoAmbiente.map((equipamento) => {
                                    const plano = obterPlanoDoEquipamento(equipamento.id);
                                    const possuiPlano = !!plano;

                                    return (
                                        <label
                                            key={equipamento.id}
                                            className={`flex items-start gap-3 rounded-2xl border p-4 ${possuiPlano
                                                    ? "cursor-pointer bg-white"
                                                    : "cursor-not-allowed bg-slate-50 opacity-70"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={equipamentosMarcados.includes(
                                                    equipamento.id
                                                )}
                                                onChange={() =>
                                                    marcarEquipamento(equipamento.id)
                                                }
                                                disabled={!possuiPlano}
                                                className="mt-1 h-5 w-5 shrink-0"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-black text-blue-900">
                                                            {equipamento.tag}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-700">
                                                            {equipamento.nome}
                                                        </p>
                                                    </div>

                                                    {possuiPlano ? (
                                                        <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
                                                            Plano disponível
                                                        </span>
                                                    ) : (
                                                        <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                                                            Sem plano PMOC
                                                        </span>
                                                    )}
                                                </div>

                                                {plano && (
                                                    <p className="mt-2 text-xs font-bold text-slate-400">
                                                        {plano.nome} • {plano.periodicidade}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {!equipamentosDoAmbiente.length && (
                                <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                                    Nenhum equipamento encontrado neste ambiente.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            Observações
                        </label>

                        <textarea
                            value={observacaoLote}
                            onChange={(e) => setObservacaoLote(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border px-4 py-3 text-sm"
                            placeholder="Esta observação será aplicada aos PMOCs gerados neste lote, se houver."
                        />
                    </div>

                    {progressoLote && (
                        <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-900">
                            {progressoLote}
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={gerarPmocsEmLote}
                            disabled={loadingLote || !equipamentosMarcados.length}
                            className="w-full rounded-xl bg-blue-900 px-8 py-3 text-sm font-black text-white disabled:opacity-60 sm:w-auto"
                        >
                            {loadingLote
                                ? "Gerando PMOCs..."
                                : `Gerar ${equipamentosMarcados.length || ""} PMOC${equipamentosMarcados.length === 1 ? "" : "s"
                                }`}
                        </button>
                    </div>
                </div>
            )}
        </AppShell>
    );
}

function baixarPdfBase64(pdfBase64: string, nomeArquivo: string) {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function aguardar(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function Info({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
            <p className="font-semibold text-slate-700">{value || "-"}</p>
        </div>
    );
}
