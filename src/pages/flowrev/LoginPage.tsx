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
                    produtos_acesso: ["claro"]
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center text-center">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-2">
                            <Newspaper className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-center">Revistas do Treinamento</h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Entre com seu e-mail corporativo e matrícula
                        </p>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome.sobrenome@aec.com.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matricula">Matrícula</Label>
                            <Input
                                id="matricula"
                                type="text"
                                placeholder="123456"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
