import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, CheckCircle2, AlertCircle, PlayCircle, FolderClock } from "lucide-react";
import { Link } from "react-router-dom";

export interface ProductStats {
    id: string;
    nome: string;
    slug: string;
    total: number;
    concluidos: number;
    percentual: number;
    status: string;
    atrasados: number;
    fases: {
        producao: number;
        revisao: number;
        ajustes: number;
        aprovado: number;
    };
}

interface ProductStrategyCardProps {
    product: ProductStats;
}

export function ProductStrategyCard({ product }: ProductStrategyCardProps) {
    const isInactive = product.status === 'sem_edicao';

    // Color theme based on product name/slug (simple version)
    // Could come from DB, but hardcoding for consistency in UI demo
    const getProductColor = (slug: string) => {
        const colors: Record<string, string> = {
            'claro': 'bg-red-600',
            'ifood': 'bg-red-700',
            'ifood-pago': 'bg-red-800',
            'ton': 'bg-emerald-600',
            'inter': 'bg-orange-600',
            'fabrica': 'bg-slate-900'
        };
        return colors[slug] || 'bg-slate-800';
    };

    const headerColor = isInactive ? 'bg-slate-100' : getProductColor(product.slug);

    return (
        <Card className={`rounded-none border-2 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] duration-300 ${isInactive ? 'border-slate-200 opacity-60 grayscale' : `border-slate-900`}`}>
            <div className={`h-4 w-full ${headerColor} border-b-2 border-slate-900`} />

            <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
                <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter leading-none text-slate-900">{product.nome}</h3>
                    {isInactive ? (
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Inativo</p>
                    ) : (
                        <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">{product.total} Insumos ativos</p>
                    )}
                </div>
                {!isInactive && (
                    <div className="flex flex-col items-end">
                        <span className="text-3xl font-black tracking-tighter text-slate-900">{product.percentual}%</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-6 py-4">
                {isInactive ? (
                    <div className="h-32 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-2 border-dashed border-slate-200 bg-slate-50">
                        Ciclo finalizado
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-slate-100 border-2 border-slate-900 overflow-hidden p-0.5">
                            <div
                                className={`h-full transition-all duration-1000 ${headerColor}`}
                                style={{ width: `${product.percentual}%` }}
                            />
                        </div>

                        {/* Vital Signs Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle className={`w-3 h-3 ${product.atrasados > 0 ? 'text-red-600 animate-pulse' : 'text-slate-300'}`} />
                                    Atraso
                                </span>
                                <span className={`font-black text-2xl tracking-tighter ${product.atrasados > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                    {product.atrasados}
                                </span>
                            </div>
                            <div className="bg-white p-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between">
                                <span className="text-[9px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2">
                                    <FolderClock className="w-3 h-3 text-blue-600" />
                                    Fluxo
                                </span>
                                <span className="font-black text-2xl tracking-tighter text-slate-900">
                                    {product.total - product.concluidos}
                                </span>
                            </div>
                        </div>

                        {/* Workflow Breakdown */}
                        <div className="space-y-2 border-t-2 border-slate-100 pt-4">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                <span>Status Atual</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight py-1 border-b border-slate-50">
                                <span className="flex items-center gap-2 text-slate-400"><PlayCircle className="w-3.5 h-3.5" /> Produção</span>
                                <span className="text-slate-900">{product.fases.producao}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight py-1 border-b border-slate-50 text-amber-600">
                                <span className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> Ajustes</span>
                                <span>{product.fases.revisao + product.fases.ajustes}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight py-1 text-emerald-600">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Aprovado</span>
                                <span>{product.fases.aprovado}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-6 py-4 bg-slate-900 border-t-2 border-slate-900">
                <Button asChild variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-white h-10 hover:bg-white hover:text-slate-900 transition-all rounded-none">
                    <Link to={`/flowrev/produto/${product.slug}`}>
                        Expandir Quadro
                        <ArrowRight className="w-4 h-4 ml-3" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
