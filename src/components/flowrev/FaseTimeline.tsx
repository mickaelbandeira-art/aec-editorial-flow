import { cn } from '@/lib/utils';
import { FASES_PRODUCAO, type ProducaoFase } from '@/types/flowrev';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface FaseTimelineProps {
  faseAtual: ProducaoFase;
  percentualConclusao?: number;
}

export function FaseTimeline({ faseAtual, percentualConclusao = 0 }: FaseTimelineProps) {
  const faseAtualIndex = FASES_PRODUCAO.findIndex(f => f.fase === faseAtual);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Fases da Produção</h3>
        <span className="text-sm text-muted-foreground">
          {percentualConclusao}% concluído
        </span>
      </div>

      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-6 left-0 h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(faseAtualIndex / (FASES_PRODUCAO.length - 1)) * 100}%` }}
        />

        {/* Fases */}
        <div className="relative flex justify-between">
          {FASES_PRODUCAO.map((fase, index) => {
            const isCompleted = index < faseAtualIndex;
            const isCurrent = index === faseAtualIndex;
            const isPending = index > faseAtualIndex;

            return (
              <div 
                key={fase.fase}
                className={cn(
                  "flex flex-col items-center",
                  index === 0 && "items-start",
                  index === FASES_PRODUCAO.length - 1 && "items-end"
                )}
              >
                {/* Icon */}
                <div 
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                    isCompleted && "bg-success border-success text-success-foreground",
                    isCurrent && "bg-primary border-primary text-primary-foreground animate-pulse-soft",
                    isPending && "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : isCurrent ? (
                    <Clock className="h-6 w-6" />
                  ) : (
                    <span className="text-lg">{fase.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div className={cn(
                  "mt-3 text-center max-w-[100px]",
                  index === 0 && "text-left",
                  index === FASES_PRODUCAO.length - 1 && "text-right"
                )}>
                  <p className={cn(
                    "text-xs font-medium leading-tight",
                    isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {fase.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {fase.dataLimite}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
