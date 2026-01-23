import { Bell, Search, Info, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRealNotifications } from '@/hooks/useRealNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function FlowrevHeader({ title = 'Dashboard', subtitle, searchTerm, onSearchChange }: HeaderProps) {
  const { data: notifications = [] } = useRealNotifications();

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const unreadCount = notifications.length;

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
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Notificações</h3>
            </div>
            <ScrollArea className="h-[350px]">
              <div className="p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhuma notificação recente.
                  </div>
                ) : notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer relative group">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 
                          ${notif.type === 'deadline' ? 'bg-red-500' : ''}
                          ${notif.type === 'adjustment' ? 'bg-amber-500' : ''}
                          ${notif.type === 'approved' ? 'bg-emerald-500' : ''}
                          ${notif.type === 'sent' ? 'bg-blue-500' : ''}
                       `} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{notif.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{notif.message}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatDistanceToNow(notif.date, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
