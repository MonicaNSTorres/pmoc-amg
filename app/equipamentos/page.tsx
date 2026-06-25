"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Ambiente = {
    id: string;
    nome: string;
    cliente: {
        nome: string;
    };
};

type Equipamento = {
    id: string;
    tag: string;
    nome: string;
    marca?: string | null;
    modelo?: string | null;
    capacidade?: string | null;
    localizacao?: string | null;
    ambiente: Ambiente;
};

export default function EquipamentosPage() {
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

    const [ambienteId, setAmbienteId] = useState("");
    const [tag, setTag] = useState("");
    const [nome, setNome] = useState("");
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [capacidade, setCapacidade] = useState("");
    const [localizacao, setLocalizacao] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalAberta, setModalAberta] = useState(false);
    const [editandoId, setEditandoId] = useState("");
    const [editAmbienteId, setEditAmbienteId] = useState("");
    const [editTag, setEditTag] = useState("");
    const [editNome, setEditNome] = useState("");
    const [editMarca, setEditMarca] = useState("");
    const [editModelo, setEditModelo] = useState("");
    const [editCapacidade, setEditCapacidade] = useState("");
    const [editLocalizacao, setEditLocalizacao] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    async function carregarDados() {
        const [resAmbientes, resEquipamentos] = await Promise.all([
            fetch("/api/auth/ambientes"),
            fetch("/api/auth/equipamentos"),
        ]);

        setAmbientes(await resAmbientes.json());
        setEquipamentos(await resEquipamentos.json());
    }

    async function salvarEquipamento() {
        if (!ambienteId) return alert("Selecione o ambiente.");
        if (!tag.trim()) return alert("Informe a TAG.");
        if (!nome.trim()) return alert("Informe o nome do equipamento.");

        setLoading(true);

        await fetch("/api/auth/equipamentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ambienteId,
                tag,
                nome,
                marca,
                modelo,
                capacidade,
                localizacao,
            }),
        });

        setAmbienteId("");
        setTag("");
        setNome("");
        setMarca("");
        setModelo("");
        setCapacidade("");
        setLocalizacao("");

        await carregarDados();
        setLoading(false);
    }

    function abrirModalEdicao(equipamento: Equipamento) {
        setEditandoId(equipamento.id);
        setEditAmbienteId(equipamento.ambiente.id);
        setEditTag(equipamento.tag || "");
        setEditNome(equipamento.nome || "");
        setEditMarca(equipamento.marca || "");
        setEditModelo(equipamento.modelo || "");
        setEditCapacidade(equipamento.capacidade || "");
        setEditLocalizacao(equipamento.localizacao || "");
        setModalAberta(true);
    }

    function fecharModal() {
        setModalAberta(false);
        setEditandoId("");
    }

    async function salvarEdicao() {
        if (!editAmbienteId) return alert("Selecione o ambiente.");
        if (!editTag.trim()) return alert("Informe a TAG.");
        if (!editNome.trim()) return alert("Informe o nome do equipamento.");

        setSalvandoEdicao(true);

        await fetch("/api/auth/equipamentos", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editandoId,
                ambienteId: editAmbienteId,
                tag: editTag,
                nome: editNome,
                marca: editMarca,
                modelo: editModelo,
                capacidade: editCapacidade,
                localizacao: editLocalizacao,
            }),
        });

        await carregarDados();
        setSalvandoEdicao(false);
        fecharModal();
    }

    useEffect(() => {
        carregarDados();
    }, []);

    async function excluirEquipamento(id: string) {
        const confirmar = confirm(
            "Deseja realmente excluir este equipamento?"
        );

        if (!confirmar) return;

        await fetch(`/api/auth/equipamentos?id=${id}`, {
            method: "DELETE",
        });

        await carregarDados();
    }

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Equipamentos
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Cadastro de TAGs e equipamentos do PMOC.
                </p>
            </div>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Novo equipamento
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <select
                        value={ambienteId}
                        onChange={(e) => setAmbienteId(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="">Selecione o ambiente</option>
                        {ambientes.map((ambiente) => (
                            <option key={ambiente.id} value={ambiente.id}>
                                {ambiente.cliente.nome} - {ambiente.nome}
                            </option>
                        ))}
                    </select>

                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="TAG. Ex: ACG-AT-001" value={tag} onChange={(e) => setTag(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nome. Ex: PA CARAGUÁ - ATENDIMENTO" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Capacidade" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Localização" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} />
                </div>

                <button
                    onClick={salvarEquipamento}
                    disabled={loading}
                    className="mt-5 rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white"
                >
                    {loading ? "Salvando..." : "Salvar equipamento"}
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Equipamentos cadastrados
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Cliente</th>
                                <th>Ambiente</th>
                                <th>TAG</th>
                                <th>Nome</th>
                                <th>Marca</th>
                                <th>Capacidade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {equipamentos.map((equipamento) => (
                                <tr key={equipamento.id} className="border-b">
                                    <td className="py-4 font-bold">
                                        {equipamento.ambiente.cliente.nome}
                                    </td>
                                    <td>{equipamento.ambiente.nome}</td>
                                    <td className="font-bold text-blue-900">
                                        {equipamento.tag}
                                    </td>
                                    <td>{equipamento.nome}</td>
                                    <td>{equipamento.marca || "-"}</td>
                                    <td>{equipamento.capacidade || "-"}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(equipamento)}
                                                className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-black text-white"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => excluirEquipamento(equipamento.id)}
                                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white hover:bg-red-700"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalAberta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Editar equipamento
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Altere as informações da TAG/equipamento.
                                </p>
                            </div>

                            <button
                                onClick={fecharModal}
                                className="rounded-xl border px-4 py-2 text-sm font-black text-slate-700"
                            >
                                Fechar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <select
                                value={editAmbienteId}
                                onChange={(e) => setEditAmbienteId(e.target.value)}
                                className="rounded-xl border px-4 py-3 text-sm"
                            >
                                <option value="">Selecione o ambiente</option>
                                {ambientes.map((ambiente) => (
                                    <option key={ambiente.id} value={ambiente.id}>
                                        {ambiente.cliente.nome} - {ambiente.nome}
                                    </option>
                                ))}
                            </select>

                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="TAG" value={editTag} onChange={(e) => setEditTag(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Marca" value={editMarca} onChange={(e) => setEditMarca(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Modelo" value={editModelo} onChange={(e) => setEditModelo(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Capacidade" value={editCapacidade} onChange={(e) => setEditCapacidade(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm md:col-span-2" placeholder="Localização" value={editLocalizacao} onChange={(e) => setEditLocalizacao(e.target.value)} />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={fecharModal}
                                className="rounded-xl border px-6 py-3 text-sm font-black text-slate-700"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={salvarEdicao}
                                disabled={salvandoEdicao}
                                className="rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
                            >
                                {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}