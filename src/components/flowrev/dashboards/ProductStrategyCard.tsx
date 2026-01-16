import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, CheckCircle2, AlertCircle, PlayCircle, FolderClock } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductStats {
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
            'claro': 'bg-red-500',
            'ifood': 'bg-red-600',
            'ifood-pago': 'bg-red-700',
            'ton': 'bg-green-500',
            'inter': 'bg-orange-500',
            'fabrica': 'bg-zinc-800'
        };
        return colors[slug] || 'bg-blue-500';
    };

    const headerColor = isInactive ? 'bg-slate-100' : getProductColor(product.slug);

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md border-t-4 ${isInactive ? 'border-t-slate-300 opacity-75' : `border-t-transparent`}`}>
            <div className={`h-2 w-full ${headerColor}`} />

            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg leading-none">{product.nome}</h3>
                    {isInactive ? (
                        <p className="text-xs text-muted-foreground mt-1">Nenhuma edição ativa</p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">{product.total} insumos neste ciclo</p>
                    )}
                </div>
                {!isInactive && (
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold">{product.percentual}%</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="px-4 py-2">
                {isInactive ? (
                    <div className="h-24 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-md bg-slate-50">
                        Aguardando início do ciclo
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${headerColor}`}
                                style={{ width: `${product.percentual}%` }}
                            />
                        </div>

                        {/* Vital Signs Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 p-2 rounded border flex flex-col justify-between">
                                <span className="text-muted-foreground mb-1 flex items-center gap-1">
                                    <AlertTriangle className={`w-3 h-3 ${product.atrasados > 0 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`} />
                                    Atrasados
                                </span>
                                <span className={`font-bold text-lg ${product.atrasados > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                                    {product.atrasados}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border flex flex-col justify-between">
                                <span className="text-muted-foreground mb-1 flex items-center gap-1">
                                    <FolderClock className="w-3 h-3 text-blue-500" />
                                    Em Andamento
                                </span>
                                <span className="font-bold text-lg text-slate-700">
                                    {product.total - product.concluidos}
                                </span>
                            </div>
                        </div>

                        {/* Workflow Breakdown */}
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Status do Fluxo</p>
                            <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-200 pb-1">
                                <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-slate-400" /> Produção</span>
                                <span className="font-medium bg-slate-100 px-1.5 rounded">{product.fases.producao}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-200 pb-1">
                                <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-amber-400" /> Ajustes/Rev.</span>
                                <span className="font-medium bg-amber-50 text-amber-700 px-1.5 rounded">
                                    {product.fases.revisao + product.fases.ajustes} ({product.fases.ajustes} retornos)
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Aprovado</span>
                                <span className="font-medium bg-emerald-50 text-emerald-700 px-1.5 rounded">{product.fases.aprovado}</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-4 py-3 bg-slate-50/50 mt-2">
                <Button asChild variant="ghost" size="sm" className="w-full text-xs h-8 group hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200">
                    <Link to={`/flowrev/produto/${product.slug}`}>
                        Acessar Quadro
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
