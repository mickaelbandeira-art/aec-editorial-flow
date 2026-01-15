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
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-transform duration-300 md:translate-x-0",
          // Mobile: hidden by default (translate-x-full reversed), shown if isOpen
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Width handling
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
                  <h1 className="text-sm font-bold text-sidebar-foreground">Revistas do Treinamento</h1>
                  <p className="text-xs text-sidebar-foreground/60">IA Editorial</p>
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
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <div className="md:hidden">
                <ChevronLeft className="h-4 w-4" />
              </div>
              <div className="hidden md:block">
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </div>
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
            {!collapsed && filteredProdutos && filteredProdutos.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 px-3 text-xs font-semibold uppercase text-sidebar-foreground/50">
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

            {collapsed && filteredProdutos && (
              <div className="mt-8 space-y-2">
                {filteredProdutos.map((produto) => (
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
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {user?.nome?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.nome || 'Usuário'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                    {user?.role?.replace('_', ' ') || 'Cargo'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {user?.nome?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
      );
}
