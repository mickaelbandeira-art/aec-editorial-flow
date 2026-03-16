import { Produto, Edicao, Insumo, FASES_PRODUCAO } from "@/types/flowrev";
import { Loader2, Plus, ArrowRight, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface ProductionEvolutionCardProps {
    produto: Produto;
    edicao?: Edicao | null;
    insumos: Insumo[];
    onStartEdicao?: (produtoId: string) => void;
    isCreatingEdicao?: boolean;
    onViewKanban: () => void;
}

export function ProductionEvolutionCard({
    produto,
    edicao,
    insumos,
    onStartEdicao,
    isCreatingEdicao,
    onViewKanban
}: ProductionEvolutionCardProps) {
    
    const hasEdicao = !!edicao;
    const faseAtual = edicao?.fase_atual || 'kickoff';
    const faseInfo = FASES_PRODUCAO.find(f => f.fase === faseAtual);
    const percentual = edicao?.percentual_conclusao || 0;

    const aprovados = insumos.filter(i => i.status === 'aprovado').length;
    const pendentes = insumos.filter(i => i.status !== 'aprovado').length;
    const atrasados = insumos.filter(i => {
        const today = new Date().toISOString().split('T')[0];
        return i.status !== 'aprovado' && i.data_limite && i.data_limite < today;
    }).length;

    return (
        <div className="group relative bg-white border-2 border-slate-900 rounded-none shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-6 transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                {/* Logo & Identity */}
                <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-16 h-16 bg-white border-2 border-slate-900 flex items-center justify-center p-2 shrink-0 shadow-[2px_2px_0_0_rgba(15,23,42,1)] relative">
                        {logoMap[produto.slug] ? (
                            <img src={logoMap[produto.slug]} alt={produto.nome} className="w-full h-full object-contain" />
                        ) : (
                            <span className="font-black text-xl text-slate-300">{produto.nome.substring(0,2).toUpperCase()}</span>
                        )}
                        {atrasados > 0 && (
                            <div className="absolute -top-3 -right-3 h-6 w-6 rounded-none border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] bg-red-500 flex items-center justify-center animate-bounce">
                                <span className="text-[10px] font-black text-white">{atrasados}</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter leading-none mb-1">{produto.nome}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{produto.descricao || 'Squad Operacional'}</p>
                    </div>
                </div>

                {/* Status / Fase */}
                <div className="flex-1 w-full bg-slate-50 p-4 border-2 border-slate-200">
                    {!hasEdicao ? (
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhuma edição ativa para este mês</span>
                            {onStartEdicao && (
                                <Button 
                                    onClick={() => onStartEdicao(produto.id)} 
                                    disabled={isCreatingEdicao}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-2 border-slate-900 rounded-none font-black uppercase tracking-widest shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all h-8 px-4 text-[10px]"
                                >
                                    {isCreatingEdicao ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Plus className="mr-2 h-3 w-3" />}
                                    INICIAR
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {faseInfo?.icon && <faseInfo.icon className="w-4 h-4 text-slate-900" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-yellow-300 px-2 py-0.5 border-2 border-slate-900">
                                        FASE: {faseInfo?.label || 'KICKOFF'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    PROGRESSO: {percentual}%
                                </span>
                            </div>
                            <Progress value={percentual} className="h-2 rounded-none border-2 border-slate-900 bg-white" />
                        </div>
                    )}
                </div>

                {/* Metrics */}
                {hasEdicao && (
                    <div className="flex gap-2 min-w-[150px] shrink-0 flex-wrap md:flex-nowrap">
                        <div className="flex-1 bg-green-50 border-2 border-green-800 p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_0_rgba(21,128,61,1)]">
                            <span className="text-[10px] font-black text-green-800 uppercase tracking-wider mb-1">OK</span>
                            <span className="text-xl font-black text-green-900 leading-none">{aprovados}</span>
                        </div>
                        <div className="flex-1 bg-yellow-50 border-2 border-yellow-700 p-2 flex flex-col items-center justify-center text-center shadow-[2px_2px_0_0_rgba(161,98,7,1)]">
                            <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider mb-1">PEND</span>
                            <span className="text-xl font-black text-yellow-900 leading-none">{pendentes}</span>
                        </div>
                    </div>
                )}

                {/* Action */}
                <div className="shrink-0 flex items-center justify-end w-full md:w-auto mt-4 md:mt-0">
                    <Button 
                        onClick={onViewKanban}
                        className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white border-2 border-transparent rounded-none font-black uppercase tracking-widest shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] transition-all h-12 md:h-16 px-6 flex items-center justify-center gap-2 group-hover:bg-yellow-400 group-hover:text-slate-900 group-hover:border-slate-900"
                    >
                        ABRIR KANBAN <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

            </div>
        </div>
    );
}
