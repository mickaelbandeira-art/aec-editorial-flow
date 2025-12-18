import { FlowrevHeader } from '@/components/flowrev/Header';
import { StatsCard } from '@/components/flowrev/StatsCard';
import { ProductCard } from '@/components/flowrev/ProductCard';
import { FaseTimeline } from '@/components/flowrev/FaseTimeline';
import { useProdutos } from '@/hooks/useFlowrev';
import { usePermissions } from '@/hooks/usePermission';
import { ManagerDashboard } from '@/components/flowrev/dashboards/ManagerDashboard';
import { AnalystDashboard } from '@/components/flowrev/dashboards/AnalystDashboard';

export default function FlowrevDashboard() {
  const { user } = usePermissions();

  if (user?.role === 'gerente' || user?.role === 'coordenador') {
    return <ManagerDashboard />;
  }

  // OPERATIONAL DASHBOARD (Analyst View)
  return <AnalystDashboard />;
}


