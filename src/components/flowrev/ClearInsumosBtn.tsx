import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface ClearInsumosBtnProps {
    edicaoId?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export function ClearInsumosBtn({ edicaoId, variant = "destructive", size = "sm" }: ClearInsumosBtnProps) {
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleClear = async () => {
        if (!edicaoId) {
            toast.error("Edição não identificada.");
            return;
        }

        setLoading(true);
        try {
            const { error, count } = await supabase
                .from('flowrev_insumos')
                .delete({ count: 'estimated' })
                .eq('edicao_id', edicaoId);

            if (error) throw error;

            toast.success("Insumos removidos com sucesso!");

            // Invalidate queries to refresh the board
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            queryClient.invalidateQueries({ queryKey: ['manager-stats'] });

        } catch (error) {
            console.error("Erro ao limpar insumos:", error);
            const msg = error instanceof Error ? error.message : "Erro desconhecido ao limpar dados";
            toast.error(`Erro: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={variant} size={size} disabled={loading || !edicaoId} className="gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Zerar Cards
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá apagar <b>todos</b> os insumos (cards) desta edição permanentemente.
                        <br /><br />
                        Isso não pode ser desfeito.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sim, zerar tudo
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
