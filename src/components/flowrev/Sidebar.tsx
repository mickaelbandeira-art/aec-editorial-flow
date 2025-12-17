import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { useProdutos } from '@/hooks/useFlowrev';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import logos
import claroLogo from '@/assets/logos/claro.png';
import ifoodLogo from '@/assets/logos/ifood.png';
import ifoodPagoLogo from '@/assets/logos/ifood-pago.png';
import tonLogo from '@/assets/logos/ton.png';
import interLogo from '@/assets/logos/inter.png';

const logoMap: Record<string, string> = {
  'claro': claroLogo,
  'ifood': ifoodLogo,
  'ifood-pago': ifoodPagoLogo,
  'ton': tonLogo,
  'inter': interLogo,
};

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/flowrev' },
  { icon: Newspaper, label: 'Esteira de Produção', href: '/flowrev/production' },
  { icon: Calendar, label: 'Calendário', href: '/flowrev/calendario' },
];

export function FlowrevSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { data: produtos } = useProdutos();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground">FlowRev</h1>
                <p className="text-xs text-sidebar-foreground/60">IA Editorial</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {/* Main Nav */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Products */}
          {!collapsed && (
            <div className="mt-8">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase text-sidebar-foreground/50">
                Produtos
              </h3>
              <div className="space-y-1">
                {produtos?.map((produto) => {
                  const isActive = location.pathname.includes(`/produto/${produto.slug}`);
                  return (
                    <Link
                      key={produto.id}
                      to={`/flowrev/produto/${produto.slug}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <img
                        src={logoMap[produto.slug]}
                        alt={produto.nome}
                        className="h-6 w-6 rounded object-contain bg-white p-0.5"
                      />
                      <span className="text-sm">{produto.nome}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {collapsed && produtos && (
            <div className="mt-8 space-y-2">
              {produtos.map((produto) => (
                <Link
                  key={produto.id}
                  to={`/flowrev/produto/${produto.slug}`}
                  className="flex justify-center"
                >
                  <img
                    src={logoMap[produto.slug]}
                    alt={produto.nome}
                    className="h-8 w-8 rounded object-contain bg-white p-1 hover:ring-2 ring-primary transition-all"
                  />
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Usuário
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Coordenador
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  U
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
