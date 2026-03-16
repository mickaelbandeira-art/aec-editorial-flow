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
  produto: Produto & { descricao?: string };
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
      <Card className="group relative overflow-hidden bg-white rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
        {/* Gradient Accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: produto.cor_tema }}
        />

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="relative">
              <div className="h-14 w-14 bg-white border-2 border-slate-900 flex items-center justify-center p-2 rounded-none shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                <img
                  src={logoMap[produto.slug]}
                  alt={produto.nome}
                  className="h-full w-full object-contain"
                />
              </div>
              {insumosStats?.atrasados && insumosStats.atrasados > 0 && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-none border-2 border-slate-900 shadow-[1px_1px_0_0_rgba(15,23,42,1)] bg-red-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">
                    {insumosStats.atrasados}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{produto.nome}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest line-clamp-1 mt-1">{produto.descricao}</p>

              <div className="mt-4 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <div className="flex items-center gap-2">
                  {faseInfo?.icon && (
                    <faseInfo.icon className="h-4 w-4 text-slate-900" />
                  )}
                  <span className="bg-slate-100 px-2 py-1 border-2 border-slate-200">{faseInfo?.label || 'Kickoff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-900" />
                  <span className="bg-slate-100 px-2 py-1 border-2 border-slate-200">{edicao?.data_entrega_prevista || 'N/A'}</span>
                </div>
              </div>

              {edicao && (
                <div className="mt-4 bg-slate-50 border-2 border-slate-200 p-2">
                  <Progress value={percentual} className="h-2 rounded-none border-2 border-slate-900 bg-white" />
                  <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Progresso</span>
                    <span className="text-slate-900">{percentual}%</span>
                  </div>
                </div>
              )}

              {insumosStats && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {insumosStats.aprovados > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-green-700 border-2 border-green-700 bg-green-50 rounded-none shadow-[2px_2px_0_0_rgba(21,128,61,1)] text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {insumosStats.aprovados} Aprovados
                    </Badge>
                  )}
                  {insumosStats.pendentes > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-yellow-700 border-2 border-yellow-700 bg-yellow-50 rounded-none shadow-[2px_2px_0_0_rgba(161,98,7,1)] text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                      <Clock className="h-3 w-3" />
                      {insumosStats.pendentes} Pendentes
                    </Badge>
                  )}
                  {insumosStats.atrasados > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-2 border-red-600 bg-red-50 rounded-none shadow-[2px_2px_0_0_rgba(220,38,38,1)] text-[10px] font-bold uppercase tracking-wider px-2 py-1">
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
