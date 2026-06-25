"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type Usuario = {
    id: string;
    nome: string;
    email: string;
    perfil: "ADMIN" | "TECNICO";
    ativo: boolean;
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [perfil, setPerfil] = useState<"ADMIN" | "TECNICO">("TECNICO");
    const [loading, setLoading] = useState(false);

    const [modalAberta, setModalAberta] = useState(false);
    const [editandoId, setEditandoId] = useState("");
    const [editNome, setEditNome] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editSenha, setEditSenha] = useState("");
    const [editPerfil, setEditPerfil] = useState<"ADMIN" | "TECNICO">("TECNICO");
    const [editAtivo, setEditAtivo] = useState(true);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);

    async function carregarUsuarios() {
        const res = await fetch("/api/auth/usuarios");
        const data = await res.json();
        setUsuarios(data);
    }

    async function salvarUsuario() {
        if (!nome.trim()) return alert("Informe o nome.");
        if (!email.trim()) return alert("Informe o email.");
        if (!senha.trim()) return alert("Informe a senha.");

        setLoading(true);

        const res = await fetch("/api/auth/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha, perfil }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao salvar usuário.");
            setLoading(false);
            return;
        }

        setNome("");
        setEmail("");
        setSenha("");
        setPerfil("TECNICO");

        await carregarUsuarios();
        setLoading(false);
    }

    function abrirModalEdicao(usuario: Usuario) {
        setEditandoId(usuario.id);
        setEditNome(usuario.nome);
        setEditEmail(usuario.email);
        setEditSenha("");
        setEditPerfil(usuario.perfil);
        setEditAtivo(usuario.ativo);
        setModalAberta(true);
    }

    function fecharModal() {
        setModalAberta(false);
        setEditandoId("");
    }

    async function salvarEdicao() {
        if (!editNome.trim()) return alert("Informe o nome.");
        if (!editEmail.trim()) return alert("Informe o email.");

        setSalvandoEdicao(true);

        const res = await fetch("/api/auth/usuarios", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: editandoId,
                nome: editNome,
                email: editEmail,
                senha: editSenha,
                perfil: editPerfil,
                ativo: editAtivo,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao editar usuário.");
            setSalvandoEdicao(false);
            return;
        }

        await carregarUsuarios();
        setSalvandoEdicao(false);
        fecharModal();
    }

    async function excluirUsuario(id: string) {
        const confirmar = confirm("Deseja realmente excluir este usuário?");
        if (!confirmar) return;

        const res = await fetch(`/api/auth/usuarios?id=${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao excluir usuário.");
            return;
        }

        await carregarUsuarios();
    }

    useEffect(() => {
        carregarUsuarios();
    }, []);

    return (
        <AppShell>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">
                    Usuários
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Gerencie administradores e técnicos do sistema.
                </p>
            </div>

            <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Novo usuário
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />

                    <select
                        value={perfil}
                        onChange={(e) => setPerfil(e.target.value as "ADMIN" | "TECNICO")}
                        className="rounded-xl border px-4 py-3 text-sm"
                    >
                        <option value="TECNICO">Técnico</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>

                <button
                    onClick={salvarUsuario}
                    disabled={loading}
                    className="mt-5 rounded-xl bg-blue-900 px-6 py-3 text-sm font-black text-white"
                >
                    {loading ? "Salvando..." : "Salvar usuário"}
                </button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                    Usuários cadastrados
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-slate-500">
                                <th className="py-3">Nome</th>
                                <th>Email</th>
                                <th>Perfil</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id} className="border-b">
                                    <td className="py-4 font-bold text-slate-800">
                                        {usuario.nome}
                                    </td>
                                    <td>{usuario.email}</td>
                                    <td>{usuario.perfil}</td>
                                    <td>
                                        <span className={usuario.ativo ? "font-bold text-green-700" : "font-bold text-red-600"}>
                                            {usuario.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => abrirModalEdicao(usuario)}
                                                className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-black text-white"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => excluirUsuario(usuario.id)}
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

                    {!usuarios.length && (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Nenhum usuário cadastrado.
                        </p>
                    )}
                </div>
            </div>

            {modalAberta && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Editar usuário
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Deixe a senha em branco para manter a atual.
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
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                            <input className="rounded-xl border px-4 py-3 text-sm" placeholder="Nova senha" type="password" value={editSenha} onChange={(e) => setEditSenha(e.target.value)} />

                            <select
                                value={editPerfil}
                                onChange={(e) => setEditPerfil(e.target.value as "ADMIN" | "TECNICO")}
                                className="rounded-xl border px-4 py-3 text-sm"
                            >
                                <option value="TECNICO">Técnico</option>
                                <option value="ADMIN">Admin</option>
                            </select>

                            <select
                                value={editAtivo ? "S" : "N"}
                                onChange={(e) => setEditAtivo(e.target.value === "S")}
                                className="rounded-xl border px-4 py-3 text-sm md:col-span-2"
                            >
                                <option value="S">Ativo</option>
                                <option value="N">Inativo</option>
                            </select>
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