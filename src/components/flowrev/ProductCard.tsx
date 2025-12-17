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
          </div>
        </div>
      </CardContent>
    </Card>
    </Link >
  );
}
