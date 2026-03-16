import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import type { Insumo, TipoInsumo } from '@/types/flowrev';
import { 
  FileText, 
  Image, 
  FileUp, 
  MessageSquare, 
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InsumoCardProps {
  insumo: Insumo;
  tipoInsumo: TipoInsumo;
  onEdit?: () => void;
  onView?: () => void;
}

export function InsumoCard({ insumo, tipoInsumo, onEdit, onView }: InsumoCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const isAtrasado = insumo.data_limite && 
    isPast(parseISO(insumo.data_limite)) && 
    insumo.status !== 'aprovado';

  const hasContent = insumo.conteudo_texto || (insumo.anexos && insumo.anexos.length > 0);
  const anexosCount = insumo.anexos?.length || 0;
  const imagensCount = insumo.anexos?.filter(a => a.tipo === 'imagem').length || 0;
  const pdfsCount = insumo.anexos?.filter(a => a.tipo === 'pdf').length || 0;

  return (
    <Card className={cn(
      "group transition-all bg-white rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)]",
      isAtrasado && "border-red-600 bg-red-50"
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-black text-xs uppercase tracking-widest truncate">{tipoInsumo.nome}</h4>
              {isAtrasado && (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
            </div>
            {/* StatusBadge likely needs its own update if it has rounded corners, but we apply brutalism around it */}
            <StatusBadge status={insumo.status} size="sm" />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-none border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Quick Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
          {insumo.data_limite && (
            <div className={cn(
              "flex items-center gap-1",
              isAtrasado && "text-destructive"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                {format(parseISO(insumo.data_limite), "dd/MM", { locale: ptBR })}
              </span>
            </div>
          )}
          
          {anexosCount > 0 && (
            <>
              {imagensCount > 0 && (
                <div className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  <span>{imagensCount}</span>
                </div>
              )}
              {pdfsCount > 0 && (
                <div className="flex items-center gap-1">
                  <FileUp className="h-3 w-3" />
                  <span>{pdfsCount}</span>
                </div>
              )}
            </>
          )}

          {insumo.observacoes && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>Com obs.</span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-3 pt-2 border-t animate-fade-in">
            {/* Conteúdo preview */}
            {insumo.conteudo_texto && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Conteúdo</p>
                <p className="text-sm line-clamp-3">{insumo.conteudo_texto}</p>
              </div>
            )}

            {/* Observações */}
            {insumo.observacoes && (
              <div className="p-2 rounded-none border-2 border-slate-900 bg-yellow-300 shadow-[2px_2px_0_0_rgba(15,23,42,1)]">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-900 mb-1">Observações</p>
                <p className="text-xs font-bold">{insumo.observacoes}</p>
              </div>
            )}

            {/* Motivo ajuste */}
            {insumo.status === 'ajuste_solicitado' && insumo.motivo_ajuste && (
              <div className="p-2 rounded-none border-2 border-red-600 bg-red-100 shadow-[2px_2px_0_0_rgba(220,38,38,1)]">
                <p className="text-[10px] uppercase font-black tracking-widest text-red-900 mb-1">Motivo do Ajuste</p>
                <p className="text-xs font-bold text-red-800">{insumo.motivo_ajuste}</p>
              </div>
            )}

            {/* Enviado por */}
            {insumo.enviado_em && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>
                  Enviado em {format(parseISO(insumo.enviado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-[10px] uppercase font-black tracking-widest rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 hover:translate-y-px hover:shadow-none transition-all"
            onClick={onView}
          >
            Visualizar
          </Button>
          {insumo.status !== 'aprovado' && (
            <Button 
              size="sm" 
              className="flex-1 h-8 text-[10px] uppercase font-black tracking-widest rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] bg-slate-900 text-white hover:bg-slate-800 hover:translate-y-px hover:shadow-none transition-all"
              onClick={onEdit}
            >
              {insumo.status === 'nao_iniciado' ? 'Preencher' : 'Editar'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
