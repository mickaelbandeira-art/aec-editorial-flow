import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Produto, Edicao } from '@/types/flowrev';
import { FASES_PRODUCAO } from '@/types/flowrev';
import { ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

interface ProductCardProps {
  produto: Produto;
  edicao?: Edicao | null;
  insumosStats?: {
    total: number;
    aprovados: number;
    pendentes: number;
    atrasados: number;
  };
}

export function ProductCard({ produto, edicao, insumosStats }: ProductCardProps) {
  const faseAtual = edicao?.fase_atual || 'kickoff';
  const faseInfo = FASES_PRODUCAO.find(f => f.fase === faseAtual);
  const percentual = edicao?.percentual_conclusao || 0;

  return (
    <Link to={`/flowrev/produto/${produto.slug}`}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-soft hover:-translate-y-1">
        {/* Gradient Accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: produto.cor_tema }}
        />

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative">
              <img
                src={logoMap[produto.slug]}
                alt={produto.nome}
                className="h-14 w-14 rounded-xl object-contain bg-white p-2 shadow-sm"
              />
              {insumosStats?.atrasados && insumosStats.atrasados > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[10px] font-bold text-destructive-foreground">
                    {insumosStats.atrasados}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{produto.nome}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{produto.descricao}</p>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  {faseInfo?.icon && (
                    <faseInfo.icon className="h-4 w-4 text-gray-500" />
                  )}
                  <span>{faseInfo?.label || 'Kickoff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{edicao?.data_entrega_prevista || 'N/A'}</span>
                </div>
              </div>

              {edicao && (
                <div className="mt-4">
                  <Progress value={percentual} className="h-2" indicatorColor={produto.cor_tema} />
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Progresso</span>
                    <span>{percentual}%</span>
                  </div>
                </div>
              )}

              {insumosStats && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {insumosStats.aprovados > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
                      <CheckCircle2 className="h-3 w-3" />
                      {insumosStats.aprovados} Aprovados
                    </Badge>
                  )}
                  {insumosStats.pendentes > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-200 bg-yellow-50">
                      <Clock className="h-3 w-3" />
                      {insumosStats.pendentes} Pendentes
                    </Badge>
                  )}
                  {insumosStats.atrasados > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200 bg-red-50">
                      <AlertTriangle className="h-3 w-3" />
                      {insumosStats.atrasados} Atrasados
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </Card>
    </Link >
  );
}
