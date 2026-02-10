import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useCurrentUser } from "@/hooks/usePermission";
import { ChevronUp, UserCircle } from "lucide-react";

export function UserSwitcher() {
    const { setSelectedEmail } = useAuthStore();
    const { data: currentUser } = useCurrentUser();

    const users = [
        { name: 'Maria Clara (Sup. Claro)', email: 'a.maria.clara@aec.com.br' },
        { name: 'Silvia (Sup. Claro)', email: 'silvia.silvia@aec.com.br' },
        { name: 'Mariana Veras (Sup. iFood)', email: 'a.mariana.veras@if-aec.com.br' },
        { name: 'Yara Silva (Analista Pleno)', email: 'a.yara.ssilva@aec.com.br' },
        { name: 'Mickael (Analista Claro)', email: 'mickael.bandeira@aec.com.br' },
        { name: 'Maria Clara (Analista iFood)', email: 'maria.franca@aec.com.br' },
        { name: 'Kelciane (Coord.)', email: 'kelciane.lima@aec.com.br' },
        { name: 'Jonathan (Gerente)', email: 'jonathan.silva@aec.com.br' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent">
                    <div className="flex items-center gap-2 w-full">
                        <UserCircle className="h-5 w-5" />
                        <div className="text-left flex-1 truncate">
                            <span className="block text-xs font-semibold">{currentUser?.nome.split(' ')[0] || 'Usuário'}</span>
                            <span className="block text-[10px] text-muted-foreground capitalize">{currentUser?.role || 'Selecione'}</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="top">
                <DropdownMenuLabel>Trocar Usuário (Dev)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map((u) => (
                    <DropdownMenuItem key={u.email} onClick={() => setSelectedEmail(u.email)}>
                        <div className="flex flex-col">
                            <span className="font-medium text-xs">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
