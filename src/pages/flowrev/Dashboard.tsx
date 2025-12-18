import { FlowrevHeader } from '@/components/flowrev/Header';
import { StatsCard } from '@/components/flowrev/StatsCard';
import { ProductCard } from '@/components/flowrev/ProductCard';
import { FaseTimeline } from '@/components/flowrev/FaseTimeline';
import { useProdutos, useDashboardStats } from '@/hooks/useFlowrev';
import { Newspaper, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SeedInsumosBtn } from '@/components/flowrev/SeedInsumosBtn';

export default function FlowrevDashboard() {
  const { data: produtos, isLoading: loadingProdutos } = useProdutos();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center pr-6">
        <FlowrevHeader title="Dashboard" subtitle={`Edição de ${mesAtual}`} />
        <SeedInsumosBtn />
      </div>

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Produtos Ativos"
            value={produtos?.length || 0}
            icon={<Newspaper className="h-5 w-5" />}
            variant="info"
          />
          <StatsCard
            title="Progresso Geral"
            value={`${Math.round(stats?.progressoGeral || 0)}%`}
            description="Média de todas as revistas"
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            title="Insumos Pendentes"
            value={stats?.totalPendentes || 0}
            description="Aguardando envio"
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatsCard
            title="Atrasados"
            value={stats?.totalAtrasados || 0}
            description="Requerem atenção"
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            <FaseTimeline
              faseAtual={stats?.edicoes?.[0]?.fase_atual || 'kickoff'}
              percentualConclusao={Math.round(stats?.progressoGeral || 0)}
            />
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Produtos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loadingProdutos ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))
            ) : (
              produtos?.map((produto) => {
                const edicao = stats?.edicoes?.find(e => e.produto_id === produto.id);
                const produtoStats = edicao ? stats?.statsPorEdicao?.[edicao.id] : undefined;

                return (
                  <ProductCard
                    key={produto.id}
                    produto={produto}
                    edicao={edicao}
                    insumosStats={produtoStats}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
