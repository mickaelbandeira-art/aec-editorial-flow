import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FlowrevSidebar } from '@/components/flowrev/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FlowrevLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:block">
      {/* Mobile Header */}
      <div className="md:hidden border-b p-4 flex items-center gap-4 bg-sidebar text-sidebar-foreground sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-semibold">Flow Editorial</span>
      </div>

      <FlowrevSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />

      <main className={cn(
        "flex-1 transition-all duration-300 overflow-x-hidden w-full",
        isSidebarCollapsed ? "md:pl-20" : "md:pl-72"
      )}>
        <Outlet />
      </main>
    </div>
  );
}
