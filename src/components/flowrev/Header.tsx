import { Bell, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function FlowrevHeader({ title = 'Dashboard', subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : (
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar insumos, produtos..."
            className="w-64 pl-9 bg-secondary/50"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4">
              <h3 className="font-semibold mb-2">Notificações</h3>
              <div className="space-y-3">
                <div className="flex gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="h-2 w-2 mt-2 rounded-full bg-warning" />
                  <div>
                    <p className="text-sm font-medium">Prazo próximo</p>
                    <p className="text-xs text-muted-foreground">Editorial Claro vence em 2 dias</p>
                  </div>
                </div>
                <div className="flex gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="h-2 w-2 mt-2 rounded-full bg-info" />
                  <div>
                    <p className="text-sm font-medium">Novo insumo enviado</p>
                    <p className="text-xs text-muted-foreground">Sumário iFood foi enviado para análise</p>
                  </div>
                </div>
                <div className="flex gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="h-2 w-2 mt-2 rounded-full bg-destructive" />
                  <div>
                    <p className="text-sm font-medium">Ajuste solicitado</p>
                    <p className="text-xs text-muted-foreground">Big Numbers Ton precisa de revisão</p>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
