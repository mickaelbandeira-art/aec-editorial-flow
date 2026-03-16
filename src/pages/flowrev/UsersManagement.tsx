import { useState } from "react";
import { useUsersManagement, useUpdateUserRole, useProdutos, useCreateUser, useDeleteUser } from "@/hooks/useFlowrev";
import { Loader2, UserCog, Shield, Package, Save, Plus, Trash2, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FlowrevRole } from "@/types/flowrev";

export default function UsersManagement() {
    const { data: users, isLoading: loadingUsers } = useUsersManagement();
    const { data: produtos } = useProdutos();
    const { mutate: updateRole, isPending: updating } = useUpdateUserRole();
    const { mutate: createUser, isPending: creating } = useCreateUser();
    const { mutate: deleteUser, isPending: deleting } = useDeleteUser();

    // Editor State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [tempRole, setTempRole] = useState<FlowrevRole | ''>('');
    const [tempProducts, setTempProducts] = useState<string[]>([]);

    // New User State
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        nome: '',
        matricula: '',
        role: 'analista' as FlowrevRole,
        produtos_acesso: [] as string[]
    });

    const handleEdit = (user: any) => {
        setEditingUserId(user.id);
        setTempRole(user.role);
        setTempProducts(user.produtos_acesso || []);
    };

    const handleSave = () => {
        if (!editingUserId) return;
        updateRole({
            userId: editingUserId,
            role: tempRole as string,
            produtos_acesso: tempProducts
        }, {
            onSuccess: () => {
                toast.success("Permissões atualizadas com sucesso!");
                setEditingUserId(null);
            },
            onError: (err: any) => {
                console.error("Erro ao atualizar usuário:", err);
                toast.error(err.message || "Erro ao atualizar usuário.");
            }
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.email || !newUser.nome || !newUser.matricula) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        createUser(newUser, {
            onSuccess: () => {
                toast.success("Usuário criado com sucesso!");
                setIsAdding(false);
                setNewUser({ email: '', nome: '', matricula: '', role: 'analista', produtos_acesso: [] });
            },
            onError: (err: any) => toast.error(err.message || "Erro ao criar usuário.")
        });
    };

    const handleDelete = (userId: string, userName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
            deleteUser(userId, {
                onSuccess: () => toast.success("Usuário excluído com sucesso!"),
                onError: (err: any) => toast.error(err.message || "Erro ao excluir usuário.")
            });
        }
    };

    const toggleProduct = (slug: string) => {
        setTempProducts(prev => 
            prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
        );
    };

    const toggleNewUserProduct = (slug: string) => {
        setNewUser(prev => ({
            ...prev,
            produtos_acesso: prev.produtos_acesso.includes(slug)
                ? prev.produtos_acesso.filter(p => p !== slug)
                : [...prev.produtos_acesso, slug]
        }));
    };

    if (loadingUsers) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="mb-8 border-b-4 border-slate-900 pb-6 flex items-end justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                        <UserCog className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Gestão de Usuários</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                            Controle de papéis e acessos a produtos da operação.
                        </p>
                    </div>
                </div>

                <Button 
                    onClick={() => setIsAdding(!isAdding)}
                    className={cn(
                        "h-12 px-6 rounded-none border-2 border-slate-900 font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all",
                        isAdding ? "bg-red-500 text-white hover:bg-red-600" : "bg-primary text-primary-foreground hover:translate-y-[-2px]"
                    )}
                >
                    {isAdding ? <X className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                    {isAdding ? "Cancelar" : "Novo Usuário"}
                </Button>
            </div>

            {isAdding && (
                <div className="mb-10 bg-white border-4 border-slate-900 shadow-[12px_12px_0_0_rgba(15,23,42,1)] p-8 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <UserPlus className="w-5 h-5" /> Cadastrar Novo Colaborador
                    </h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <div className="space-y-2">
                            <label>Nome Completo</label>
                            <input 
                                type="text" 
                                value={newUser.nome}
                                onChange={e => setNewUser({...newUser, nome: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-slate-900 p-3 font-bold text-slate-900 outline-none focus:bg-white"
                                placeholder="EX: FULANO DE TAL"
                            />
                        </div>
                        <div className="space-y-2">
                            <label>E-mail Corporativo</label>
                            <input 
                                type="email" 
                                value={newUser.email}
                                onChange={e => setNewUser({...newUser, email: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-slate-900 p-3 font-bold text-slate-900 outline-none focus:bg-white"
                                placeholder="NOME.SOBRENOME@AEC.COM.BR"
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Matrícula</label>
                            <input 
                                type="text" 
                                value={newUser.matricula}
                                onChange={e => setNewUser({...newUser, matricula: e.target.value})}
                                className="w-full bg-slate-50 border-2 border-slate-900 p-3 font-bold text-slate-900 outline-none focus:bg-white"
                                placeholder="000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label>Papel no Sistema</label>
                            <select 
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value as FlowrevRole})}
                                className="w-full bg-slate-50 border-2 border-slate-900 p-3 font-black text-slate-900 outline-none cursor-pointer"
                            >
                                <option value="analista">ANALISTA</option>
                                <option value="analista_pleno">ANALISTA PLENO</option>
                                <option value="supervisor">SUPERVISOR</option>
                                <option value="coordenador">COORDENADOR</option>
                                <option value="gerente">GERENTE</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label>Acesso a Produtos</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {produtos?.map(p => (
                                    <button
                                        type="button"
                                        key={p.id}
                                        onClick={() => toggleNewUserProduct(p.slug)}
                                        className={cn(
                                            "px-3 py-1.5 text-[10px] font-black border-2 transition-all",
                                            newUser.produtos_acesso.includes(p.slug)
                                                ? "bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                        )}
                                    >
                                        {p.nome}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-3 pt-4">
                            <Button 
                                type="submit" 
                                disabled={creating}
                                className="w-full md:w-auto h-12 px-10 rounded-none border-2 border-slate-900 bg-slate-900 text-white font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] active:translate-y-px transition-all"
                            >
                                {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Salvar Novo Usuário
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6">
                <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0_0_rgba(15,23,42,1)] overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest italic">
                            <tr>
                                <th className="text-left px-6 py-4 border-r-2 border-slate-700">Usuário</th>
                                <th className="text-left px-6 py-4 border-r-2 border-slate-700">Papel / Cargo</th>
                                <th className="text-left px-6 py-4 border-r-2 border-slate-700">Produtos Autorizados</th>
                                <th className="text-center px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200">
                            {users?.map((u) => (
                                <tr key={u.id} className={cn(
                                    "transition-colors",
                                    editingUserId === u.id ? "bg-yellow-50" : "hover:bg-slate-50"
                                )}>
                                    <td className="px-6 py-4 border-r-2 border-slate-200">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 uppercase text-xs">{u.nome}</span>
                                            <span className="text-[10px] font-bold text-slate-500">{u.email}</span>
                                            <span className="text-[9px] font-mono text-slate-400 mt-1">MAT: {u.matricula}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r-2 border-slate-200">
                                        {editingUserId === u.id ? (
                                            <select 
                                                value={tempRole} 
                                                onChange={(e) => setTempRole(e.target.value as FlowrevRole)}
                                                className="w-full bg-white border-2 border-slate-900 p-2 font-black uppercase text-[10px] tracking-widest outline-none shadow-[2px_2px_0_0_rgba(15,23,42,1)]"
                                            >
                                                <option value="analista">ANALISTA</option>
                                                <option value="analista_pleno">ANALISTA PLENO</option>
                                                <option value="supervisor">SUPERVISOR</option>
                                                <option value="coordenador">COORDENADOR</option>
                                                <option value="gerente">GERENTE</option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3 h-3 text-slate-900" />
                                                <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 tracking-tighter">
                                                    {u.role?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-r-2 border-slate-200">
                                        {editingUserId === u.id ? (
                                            <div className="flex flex-wrap gap-2 max-w-sm">
                                                {produtos?.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => toggleProduct(p.slug)}
                                                        className={cn(
                                                            "px-2 py-1 text-[9px] font-black uppercase tracking-tighter border-2 transition-all",
                                                            tempProducts.includes(p.slug)
                                                                ? "bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]"
                                                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                                                        )}
                                                    >
                                                        {p.nome}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {u.produtos_acesso?.length > 0 ? u.produtos_acesso.map((slug: string) => (
                                                    <div key={slug} className="flex items-center gap-1 bg-slate-100 border-2 border-slate-200 px-1.5 py-0.5">
                                                        <Package className="w-2.5 h-2.5 text-slate-500" />
                                                        <span className="text-[9px] font-bold text-slate-700 uppercase">{slug}</span>
                                                    </div>
                                                )) : <span className="text-[9px] italic text-slate-400">Nenhum produto</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {editingUserId === u.id ? (
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm"
                                                        onClick={handleSave}
                                                        disabled={updating}
                                                        className="bg-green-500 hover:bg-green-600 text-white border-2 border-slate-900 rounded-none h-8 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-none hover:translate-y-px transition-all"
                                                    >
                                                        {updating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingUserId(null)}
                                                        className="bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-none h-8 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-none hover:translate-y-px transition-all"
                                                    >
                                                        CANCELAR
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(u)}
                                                        className="bg-white hover:bg-slate-900 hover:text-white text-slate-900 border-2 border-slate-900 rounded-none h-8 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-all font-black text-[10px] uppercase tracking-widest px-4"
                                                    >
                                                        Gerenciar
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(u.id, u.nome)}
                                                        disabled={deleting}
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-none border-2 border-transparent hover:border-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
