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
                    role: "analista" as any,
                    produtos_acesso: []
                };
                login(userProfile);
                toast.success(`Bem-vindo, ${userProfile.nome}! (Modo Dev)`);
                navigate("/flowrev");
                setLoading(false);
                return;
            }

            // Verifica se o usuário existe no banco 'profiles' buscando apenas pelo e-mail primeiro para debug
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, matricula, full_name, role')
                .eq('email', email.trim())
                .maybeSingle(); // Usar maybeSingle para não estourar erro se não achar

            if (error) {
                console.error("Erro ao buscar usuário:", error);
                toast.error("Erro de conexão ao buscar usuário.");
                setLoading(false);
                return;
            }

            if (!data) {
                console.error("Usuário não encontrado com este e-mail.");
                toast.error("E-mail não encontrado na base de dados.");
                setLoading(false);
                return;
            }

            // Validação da Matrícula
            if (data.matricula !== matricula.trim()) {
                console.error(`Matrícula inválida. Esperado: ${data.matricula}, Recebido: ${matricula.trim()}`);
                toast.error("Matrícula incorreta para este usuário.");
                setLoading(false);
                return;
            }



            // Verifica se o usuário existe no banco 'profiles' buscando apenas pelo e-mail primeiro para debug
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, matricula, full_name, role')
                .eq('email', email.trim())
                .maybeSingle(); // Usar maybeSingle para não estourar erro se não achar

            if (error) {
                console.error("Erro ao buscar usuário:", error);
                toast.error("Erro de conexão ao buscar usuário.");
                setLoading(false);
                return;
            }

            if (!data) {
                console.error("Usuário não encontrado com este e-mail.");
                toast.error("E-mail não encontrado na base de dados.");
                setLoading(false);
                return;
            }

            // Validação da Matrícula
            if (data.matricula !== matricula.trim()) {
                console.error(`Matrícula inválida. Esperado: ${data.matricula}, Recebido: ${matricula.trim()}`);
                toast.error("Matrícula incorreta para este usuário.");
                setLoading(false);
                return;
            }

            // Mapeia para o formato esperado pelo AuthStore
            // Assume que role do profile é compatível ou faz cast, e produtos_acesso vazio por enquanto
            const userProfile = {
                id: data.id,
                email: data.email,
                nome: data.full_name,
                matricula: data.matricula || "",
                role: (data.role as any) || "analista", // Fallback seguro
                produtos_acesso: [] // TODO: Buscar de tabela de permissões se existir
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
