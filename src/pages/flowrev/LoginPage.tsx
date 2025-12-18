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
            // Verifica se o usuário existe no banco
            const { data, error } = await supabase
                .from('flowrev_users')
                .select('*')
                .eq('email', email)
                .eq('matricula', matricula)
                .single();

            if (error || !data) {
                toast.error("Credenciais inválidas. Verifique e-mail e matrícula.");
                setLoading(false);
                return;
            }

            // Login bem sucedido
            login(data);
            toast.success(`Bem-vindo, ${data.nome}!`);
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
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                        <Newspaper className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">FlowRev Login</CardTitle>
                    <CardDescription>
                        Entre com seu e-mail corporativo e matrícula para acessar
                    </CardDescription>
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
