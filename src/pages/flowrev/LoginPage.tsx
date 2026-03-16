import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/usePermission";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Newspaper } from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [matricula, setMatricula] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();

    // Interface local para tipar o retorno do banco de usuários
    interface DbUser {
        id: string;
        email: string;
        nome?: string;
        full_name?: string;
        name?: string;
        matricula?: string;
        registration?: string;
        role?: string;
        cargo?: string;
        produtos_acesso?: string[] | null;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // BYPASS FOR DEV/TESTING
            if (email.trim() === 'mickael.bandeira@aec.com.br' && matricula.trim() === '461576') {
                const userProfile = {
                    id: "dev-bypass-id",
                    email: "mickael.bandeira@aec.com.br",
                    nome: "Mickael Bandeira",
                    matricula: "461576",
                    role: "analista" as const,
                    produtos_acesso: ["claro", "rh", "ton"]
                };
                login(userProfile);
                toast.success(`Bem-vindo, ${userProfile.nome}! (Modo Dev)`);
                navigate("/flowrev");
                setLoading(false);
                return;
            }

            // Verifica se o usuário existe no banco 'flowrev_users' (conforme solicitado pelo usuário, apesar de não estar nos types)
            console.log("Tentando buscar em flowrev_users para o email:", email.trim());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: rawData, error } = await (supabase as any)
                .from('flowrev_users')
                .select('*')
                .eq('email', email.trim())
                .maybeSingle();

            if (error) {
                console.error("Erro ao buscar usuário em flowrev_users:", error);
                // Fallback para toast detalhado se for erro de relation undefined
                if (error.message?.includes("relation") && error.message?.includes("does not exist")) {
                    toast.error("Erro interno: Tabela de usuários não encontrada.");
                } else {
                    toast.error(`Erro ao buscar usuário: ${error.message || "Erro desconhecido"}`);
                }
                setLoading(false);
                return;
            }

            if (!rawData) {
                console.warn("Usuário não encontrado em flowrev_users com este e-mail.");
                toast.error("Usuário não encontrado na base de dados (e-mail incorreto?).");
                setLoading(false);
                return;
            }

            const data = rawData as DbUser;

            console.log("Usuário encontrado:", data);

            // Validação da Matrícula
            // Verifica campos possíveis para matricula já que não temos types
            const dbMatricula = data.matricula || data.registration || "";
            if (String(dbMatricula).trim() !== matricula.trim()) {
                console.error(`Matrícula inválida. Esperado: ${dbMatricula}, Recebido: ${matricula.trim()}`);
                toast.error("Matrícula incorreta para este usuário.");
                setLoading(false);
                return;
            }

            // Mapeia para o formato esperado pelo AuthStore
            // Tenta obter produtos_acesso direto da tabela, ou array vazio
            // Importante: Garantir que o role seja um dos valores permitidos ou fallback para analista
            const role = (data.role || data.cargo || "analista") as "analista" | "supervisor" | "analista_pleno" | "coordenador" | "gerente";

            const userProfile = {
                id: data.id,
                email: data.email,
                nome: data.nome || data.full_name || data.name || "Usuário",
                matricula: String(dbMatricula),
                role: role,
                produtos_acesso: Array.isArray(data.produtos_acesso) ? data.produtos_acesso : []
            };

            // Login bem sucedido
            // Login bem sucedido
            login(userProfile);
            toast.success(`Bem-vindo, ${userProfile.nome}!`);
            navigate("/flowrev");

        } catch (error) {
            console.error(error);
            toast.error("Erro ao tentar fazer login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 animate-fade-in">
            <Card className="w-full max-w-md rounded-none border-4 border-slate-900 shadow-[16px_16px_0_0_rgba(15,23,42,1)] bg-white overflow-hidden">
                <CardHeader className="space-y-4 flex flex-col items-center text-center bg-slate-900 p-8 border-b-4 border-slate-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-none border-4 border-white bg-white flex items-center justify-center rotate-3 shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]">
                            <Newspaper className="h-8 w-8 text-slate-900" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">AEC Flow</h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Editorial & Production Central</p>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6 p-8">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">E-mail Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="NOME.SOBRENOME@AEC.COM.BR"
                                className="h-12 rounded-none border-2 border-slate-900 focus-visible:ring-slate-900 font-bold placeholder:text-slate-300 placeholder:text-[10px] uppercase"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matricula" className="text-xs font-black uppercase tracking-widest text-slate-500">Matrícula</Label>
                            <Input
                                id="matricula"
                                type="text"
                                placeholder="000000"
                                className="h-12 rounded-none border-2 border-slate-900 focus-visible:ring-slate-900 font-bold placeholder:text-slate-300 placeholder:text-[10px] uppercase"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                        <Button type="submit" className="w-full h-14 rounded-none border-2 border-slate-900 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] transition-all active:translate-y-[2px] active:shadow-none" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Acessar Sistema"}
                        </Button>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            Acesso restrito a colaboradores autorizados
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
