import { Outlet } from 'react-router-dom';
import { FlowrevSidebar } from '@/components/flowrev/Sidebar';

export function FlowrevLayout() {
  return (
    <div className="min-h-screen bg-background">
      <FlowrevSidebar />
      <main className="pl-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
