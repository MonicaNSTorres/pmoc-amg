"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Cliente = {
    id: string;
    nome: string;
};

type Ambiente = {
    id: string;
    nome: string;
    descricao?: string | null;
    cliente: Cliente;
};

export default function AmbientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    const [clienteId, setClienteId] = useState("");
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalAberta, setModalAberta] = useState(false);
    const [editandoId, setEditandoId] = useState("");
    const [editClienteId, setEditClienteId] = useState("");
    const [editNome, setEditNome] = useState("");
    const [editDescricao, setEditDescricao] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    async function carregarDados() {
        const [resClientes, resAmbientes] = await Promise.all([
            fetch("/api/auth/clientes"),
            fetch("/api/auth/ambientes"),
        ]);

        setClientes(await resClientes.json());
        setAmbientes(await resAmbientes.json());
    }

    async function salvarAmbiente() {
        if (!clienteId) return alert("Selecione o cliente.");
        if (!nome.trim()) return alert("Informe o nome do ambiente.");

        setLoading(true);

        await fetch("/api/auth/ambientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clienteId, nome, descricao }),
        });

        setClienteId("");
        setNome("");
        setDescricao("");

        await carregarDados();
        setLoading(false);
    }

    function abrirModalEdicao(ambiente: Ambiente) {
        setEditandoId(ambiente.id);
        setEditClienteId(ambiente.cliente.id);
        setEditNome(ambiente.nome || "");
        setEditDescricao(ambiente.descricao || "");
        setModalAberta(true);
    }

    function fecharModal() {
        setModalAberta(false);
        setEditandoId("");
    }

    async function salvarEdicao() {
        if (!editClienteId) return alert("Selecione o cliente.");
        if (!editNome.trim()) return alert("Informe o nome do ambiente.");

        setSalvandoEdicao(true);

        await fetch("/api/auth/ambientes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editandoId,
                clienteId: editClienteId,
                nome: editNome,
                descricao: editDescricao,
            }),
        });

        await carregarDados();
        setSalvandoEdicao(false);
        fecharModal();
    }

    async function excluirAmbiente(id: string) {
        const confirmar = confirm("Deseja realmente excluir este ambiente?");
        if (!confirmar) return;

        const res = await fetch(`/api/auth/ambientes?id=${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao excluir ambiente.");
            return;
        }

        await carregarDados();
    }

    useEffect(() => {
        carregarDados();
    }, []);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Ambientes
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Cadastro de unidades, setores e ambientes.
                </p>
            </div>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Novo ambiente
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <select
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="">Selecione o cliente</option>
                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nome}
                            </option>
                        ))}
                    </select>

                    <input
                        className="rounded-xl border px-4 py-3 text-sm"
                        placeholder="Nome do ambiente"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />

                    <input
                        className="rounded-xl border px-4 py-3 text-sm"
                        placeholder="Descrição"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </div>

                <button
                    onClick={salvarAmbiente}
                    disabled={loading}
                    className="mt-5 rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white"
                >
                    {loading ? "Salvando..." : "Salvar ambiente"}
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Ambientes cadastrados
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Cliente</th>
                                <th>Ambiente</th>
                                <th>Descrição</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ambientes.map((ambiente) => (
                                <tr key={ambiente.id} className="border-b">
                                    <td className="py-4 font-bold">
                                        {ambiente.cliente.nome}
                                    </td>
                                    <td>{ambiente.nome}</td>
                                    <td>{ambiente.descricao || "-"}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(ambiente)}
                                                className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-black text-white"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => excluirAmbiente(ambiente.id)}
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
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Editar ambiente
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Altere as informações da unidade ou setor.
                                </p>
                            </div>

                            <button
                                onClick={fecharModal}
                                className="rounded-xl border px-4 py-2 text-sm font-black text-slate-700"
                            >
                                Fechar
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <select
                                value={editClienteId}
                                onChange={(e) => setEditClienteId(e.target.value)}
                                className="rounded-xl border px-4 py-3 text-sm"
                            >
                                <option value="">Selecione o cliente</option>
                                {clientes.map((cliente) => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="rounded-xl border px-4 py-3 text-sm"
                                placeholder="Nome do ambiente"
                                value={editNome}
                                onChange={(e) => setEditNome(e.target.value)}
                            />

                            <input
                                className="rounded-xl border px-4 py-3 text-sm"
                                placeholder="Descrição"
                                value={editDescricao}
                                onChange={(e) => setEditDescricao(e.target.value)}
                            />
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