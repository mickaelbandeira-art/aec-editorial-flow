import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useProdutos } from '@/hooks/useFlowrev';
import { usePermissions, useAuthStore } from '@/hooks/usePermission';
import { Button } from '@/components/ui/button';
// Removed UserSwitcher


// Import logos
import claroLogo from '@/assets/logos/claro.png';
import ifoodLogo from '@/assets/logos/ifood.png';
import ifoodPagoLogo from '@/assets/logos/ifood-pago.png';
import tonLogo from '@/assets/logos/ton.png';
import interLogo from '@/assets/logos/inter.png';
import fabricaLogo from '@/assets/logos/fabrica.png';

const logoMap: Record<string, string> = {
  'claro': claroLogo,
  'ifood': ifoodLogo,
  'ifood-pago': ifoodPagoLogo,
  'ton': tonLogo,
  'inter': interLogo,
  'fabrica': fabricaLogo,
};

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/flowrev' },
  { icon: Newspaper, label: 'Esteira de Produção', href: '/flowrev/production' },
  { icon: Calendar, label: 'Calendário', href: '/flowrev/calendar' },
];

interface FlowrevSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlowrevSidebar({ isOpen, onClose }: FlowrevSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { data: produtos } = useProdutos();
  const { canAccessProduct, user } = usePermissions();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let filteredProdutos = produtos?.filter(p => canAccessProduct(p.slug)) || [];

  // FORCE SHOW FÁBRICA if user has access but it's not in the list (Database/RLS issue fallback)
  const fabricaSlug = 'fabrica';
  const hasFabricaInList = filteredProdutos.some(p => p.slug === fabricaSlug);
  const shouldShowFabrica = canAccessProduct(fabricaSlug) ||
    ['jonathan.silva@aec.com.br', 'a.izaura.bezerra@aec.com.br', 'a.yara.ssilva@aec.com.br', 'a.mariana.veras@aec.com.br', 'gracyelle.azarias@aec.com.br'].includes(user?.email || '');

  if (shouldShowFabrica && !hasFabricaInList) {
    filteredProdutos = [
      ...filteredProdutos,
      {
        id: 'fabrica-fallback-id',
        created_at: new Date().toISOString(),
        nome: 'Fábrica de Conteúdos',
        slug: 'fabrica',
        ordem: 99,
        ativo: true,
        tipo: 'interno',
        cor_tema: '#1a1a1a',
        logo_url: null,
      }
    ];
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 shadow-xl border-r border-sidebar-border/50",
          // Mobile: hidden by default (translate-x-full reversed), shown if isOpen
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Width handling
          collapsed ? "w-20" : "w-72",
          "md:shadow-none"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-6 transition-all",
            collapsed ? "h-20 justify-center" : "h-24"
          )}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
                  <Newspaper className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-base font-bold leading-tight tracking-tight">Revistas do<br />Treinamento</h1>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className={cn(
                "hidden md:flex text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-transparent",
                collapsed && "flex"
              )}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>

            {/* Mobile Close Button */}
            <div className="md:hidden absolute right-4 top-6">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            {/* Main Nav */}
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground")} />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                );
              })}
            </div>

            {/* Products */}
            {!collapsed && filteredProdutos && filteredProdutos.length > 0 && (
              <div className="mt-10 animate-in fade-in slide-in-from-left-2 duration-300">
                <h3 className="mb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
                  Produtos Autorizados
                </h3>
                <div className="space-y-1">
                  {filteredProdutos.map((produto) => {
                    const isActive = location.pathname.includes(`/produto/${produto.slug}`);
                    return (
                      <Link
                        key={produto.id}
                        to={`/flowrev/produto/${produto.slug}`}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <img
                          src={logoMap[produto.slug]}
                          alt={produto.nome}
                          className="h-5 w-5 rounded object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                        />
                        <span className="text-sm">{produto.nome}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {collapsed && filteredProdutos && (
              <div className="mt-8 space-y-3 flex flex-col items-center">
                <div className="h-px w-8 bg-sidebar-border/50 mb-3" />
                {filteredProdutos.map((produto) => (
                  <Link
                    key={produto.id}
                    to={`/flowrev/produto/${produto.slug}`}
                    className="flex justify-center group relative"
                  >
                    <img
                      src={logoMap[produto.slug]}
                      alt={produto.nome}
                      className="h-9 w-9 rounded-lg object-contain bg-white p-1.5 shadow-sm ring-1 ring-slate-100 group-hover:ring-primary group-hover:scale-105 transition-all"
                    />
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* User Card Footer */}
          <div className="p-4">
            <div className={cn(
              "rounded-2xl bg-sidebar-accent/40 border border-sidebar-border/50 flex items-center transition-all",
              collapsed ? "p-2 justify-center aspect-square" : "p-3 gap-3"
            )}>
              {!collapsed ? (
                <>
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                      {user?.nome?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                      {user?.nome?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 font-bold truncate">
                      {user?.role?.replace('_', ' ') || 'Convidado'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-full text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
