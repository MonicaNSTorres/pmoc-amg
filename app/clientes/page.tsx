"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Cliente = {
    id: string;
    nome: string;
    cnpj?: string | null;
    contrato?: string | null;
    endereco?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
};

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [nome, setNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [contrato, setContrato] = useState("");
    const [endereco, setEndereco] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [cep, setCep] = useState("");
    const [loading, setLoading] = useState(false);

    const [modalAberta, setModalAberta] = useState(false);
    const [editandoId, setEditandoId] = useState("");
    const [editNome, setEditNome] = useState("");
    const [editCnpj, setEditCnpj] = useState("");
    const [editContrato, setEditContrato] = useState("");
    const [editEndereco, setEditEndereco] = useState("");
    const [editCidade, setEditCidade] = useState("");
    const [editEstado, setEditEstado] = useState("");
    const [editCep, setEditCep] = useState("");
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    async function carregarClientes() {
        const res = await fetch("/api/auth/clientes");
        const data = await res.json();
        setClientes(data);
    }

    async function salvarCliente() {
        if (!nome.trim()) return alert("Informe o nome do cliente.");

        setLoading(true);

        await fetch("/api/auth/clientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, cnpj, contrato, endereco, cidade, estado, cep }),
        });

        setNome("");
        setCnpj("");
        setContrato("");
        setEndereco("");
        setCidade("");
        setEstado("");
        setCep("");

        await carregarClientes();
        setLoading(false);
    }

    function abrirModalEdicao(cliente: Cliente) {
        setEditandoId(cliente.id);
        setEditNome(cliente.nome || "");
        setEditCnpj(cliente.cnpj || "");
        setEditContrato(cliente.contrato || "");
        setEditEndereco(cliente.endereco || "");
        setEditCidade(cliente.cidade || "");
        setEditEstado(cliente.estado || "");
        setEditCep(cliente.cep || "");
        setModalAberta(true);
    }

    function fecharModal() {
        setModalAberta(false);
        setEditandoId("");
    }

    async function salvarEdicao() {
        if (!editNome.trim()) return alert("Informe o nome do cliente.");

        setSalvandoEdicao(true);

        await fetch("/api/auth/clientes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editandoId,
                nome: editNome,
                cnpj: editCnpj,
                contrato: editContrato,
                endereco: editEndereco,
                cidade: editCidade,
                estado: editEstado,
                cep: editCep,
            }),
        });

        await carregarClientes();
        setSalvandoEdicao(false);
        fecharModal();
    }

    async function excluirCliente(id: string) {
        const confirmar = confirm("Deseja realmente excluir este cliente?");
        if (!confirmar) return;

        const res = await fetch(`/api/auth/clientes?id=${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao excluir cliente.");
            return;
        }

        await carregarClientes();
    }

    useEffect(() => {
        carregarClientes();
    }, []);

    return (
        <AppShell>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">
                        Clientes
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Cadastro de clientes do sistema PMOC.
                    </p>
                </div>
            </div>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Novo cliente
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Contrato" value={contrato} onChange={(e) => setContrato(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
                </div>

                <button
                    onClick={salvarCliente}
                    disabled={loading}
                    className="mt-5 rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white"
                >
                    {loading ? "Salvando..." : "Salvar cliente"}
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Clientes cadastrados
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Nome</th>
                                <th>CNPJ</th>
                                <th>Contrato</th>
                                <th>Cidade</th>
                                <th>UF</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente.id} className="border-b">
                                    <td className="py-4 font-bold text-slate-800">
                                        {cliente.nome}
                                    </td>
                                    <td>{cliente.cnpj || "-"}</td>
                                    <td>{cliente.contrato || "-"}</td>
                                    <td>{cliente.cidade || "-"}</td>
                                    <td>{cliente.estado || "-"}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(cliente)}
                                                className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-black text-white"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => excluirCliente(cliente.id)}
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
                                    Editar cliente
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Altere as informações do cliente.
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
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="CNPJ" value={editCnpj} onChange={(e) => setEditCnpj(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Contrato" value={editContrato} onChange={(e) => setEditContrato(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Endereço" value={editEndereco} onChange={(e) => setEditEndereco(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Cidade" value={editCidade} onChange={(e) => setEditCidade(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Estado" value={editEstado} onChange={(e) => setEditEstado(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="CEP" value={editCep} onChange={(e) => setEditCep(e.target.value)} />
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