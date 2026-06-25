"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Equipamento = {
    id: string;
    tag: string;
    nome: string;
};

type Plano = {
    id: string;
    nome: string;
    periodicidade: string;
    equipamento: Equipamento;
    itens: {
        id: string;
        descricao: string;
    }[];
};

const itensPadrao = [
    "verificar e corrigir o ajuste da moldura na estrutura",
    "verificar obstrução/inclinação para drenagem do condensado na bandeja",
    "verificar a existência de danos e corrosão no aletado e moldura",
    "verificar a operação de drenagem de água da bandeja",
    "limpeza externa",
    "aplicação de produtos antibactericida na serpentina",
];

export default function PmocPage() {
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [planos, setPlanos] = useState<Plano[]>([]);

    const [equipamentoId, setEquipamentoId] = useState("");
    const [nome, setNome] = useState("Plano PMOC Mensal");
    const [periodicidade, setPeriodicidade] = useState("MENSAL");
    const [itens, setItens] = useState<string[]>(itensPadrao);
    const [loading, setLoading] = useState(false);
    const [gerandoPdfId, setGerandoPdfId] = useState<string | null>(null);

    async function carregarDados() {
        const [resEquipamentos, resPlanos] = await Promise.all([
            fetch("/api/auth/equipamentos"),
            fetch("/api/auth/planos"),
        ]);

        setEquipamentos(await resEquipamentos.json());
        setPlanos(await resPlanos.json());
    }

    function alterarItem(index: number, value: string) {
        const copia = [...itens];
        copia[index] = value;
        setItens(copia);
    }

    function adicionarItem() {
        setItens([...itens, ""]);
    }

    async function salvarPlano() {
        if (!equipamentoId) return alert("Selecione o equipamento.");
        if (!nome.trim()) return alert("Informe o nome do plano.");

        const itensValidos = itens.filter((item) => item.trim());

        if (!itensValidos.length) {
            return alert("Informe pelo menos um item de manutenção.");
        }

        setLoading(true);

        await fetch("/api/auth/planos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                equipamentoId,
                nome,
                periodicidade,
                itens: itensValidos,
            }),
        });

        setEquipamentoId("");
        setNome("Plano PMOC Mensal");
        setPeriodicidade("MENSAL");
        setItens(itensPadrao);

        await carregarDados();
        setLoading(false);
    }

    async function gerarPdf(planoId: string) {
        try {
            setGerandoPdfId(planoId);

            const dataExecucao = new Date().toISOString();

            const res = await fetch("/api/pmoc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planoId,
                    dataExecucao,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erro ao gerar PDF.");
                return;
            }

            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${data.pdfBase64}`;
            link.download = "pmoc-amg.pdf";
            link.click();

            await carregarDados();
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF.");
        } finally {
            setGerandoPdfId(null);
        }
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    PMOC
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Cadastro dos planos de manutenção e controle.
                </p>
            </div>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Novo plano PMOC
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <select
                        value={equipamentoId}
                        onChange={(e) => setEquipamentoId(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="">Selecione o equipamento</option>
                        {equipamentos.map((equipamento) => (
                            <option key={equipamento.id} value={equipamento.id}>
                                {equipamento.tag} - {equipamento.nome}
                            </option>
                        ))}
                    </select>

                    <input
                        className="rounded-xl border px-4 py-3 text-sm"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Nome do plano"
                    />

                    <select
                        value={periodicidade}
                        onChange={(e) => setPeriodicidade(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="MENSAL">Mensal</option>
                        <option value="TRIMESTRAL">Trimestral</option>
                        <option value="SEMESTRAL">Semestral</option>
                        <option value="ANUAL">Anual</option>
                    </select>
                </div>

                <div className="mt-6 space-y-3">
                    {itens.map((item, index) => (
                        <input
                            key={index}
                            className="w-full rounded-xl border px-4 py-3 text-sm"
                            value={item}
                            onChange={(e) => alterarItem(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                        />
                    ))}
                </div>

                <div className="mt-5 flex gap-3">
                    <button
                        type="button"
                        onClick={adicionarItem}
                        className="rounded-xl border px-6 py-3 text-sm font-black text-slate-700"
                    >
                        + Adicionar item
                    </button>

                    <button
                        onClick={salvarPlano}
                        disabled={loading}
                        className="rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white"
                    >
                        {loading ? "Salvando..." : "Salvar plano"}
                    </button>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Planos cadastrados
                </h2>

                <div className="space-y-4">
                    {planos.map((plano) => (
                        <div key={plano.id} className="rounded-2xl border p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-black text-slate-900">
                                        {plano.nome}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {plano.equipamento.tag} - {plano.equipamento.nome}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-900">
                                        {plano.periodicidade}
                                    </span>

                                    <button
                                        onClick={() => gerarPdf(plano.id)}
                                        disabled={gerandoPdfId === plano.id}
                                        className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                                    >
                                        {gerandoPdfId === plano.id ? "Gerando..." : "Gerar PDF"}
                                    </button>
                                </div>
                            </div>

                            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                                {plano.itens.map((item) => (
                                    <li key={item.id}>{item.descricao}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}