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
      <div className="md:hidden border-b-4 border-slate-900 p-4 flex items-center gap-4 bg-slate-900 text-white sticky top-0 z-30 shadow-[0_4px_10px_0_rgba(15,23,42,0.1)]">
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:bg-slate-800 rounded-none border-2 border-slate-700">
          <Menu className="h-6 w-6" />
        </Button>
        <span className="font-black uppercase tracking-widest text-sm italic">Flow Editorial</span>
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
