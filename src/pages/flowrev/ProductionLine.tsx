import { useState, useMemo } from "react";
import { ProductInsumosBoard } from "@/components/flowrev/kanban/ProductInsumosBoard";
import { ProductionEvolutionCard } from "@/components/flowrev/ProductionEvolutionCard";
import { ProductionTimeline } from "@/components/flowrev/ProductionTimeline";
import { useDashboardStats, useProdutos, useCreateEdicao, useAllInsumos } from "@/hooks/useFlowrev";
import { usePermissions } from "@/hooks/usePermission";
import { Loader2, Plus, RefreshCw, Lock } from "lucide-react";
import { Insumo } from "@/types/flowrev";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { LayoutDashboard } from "lucide-react";

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

export default function ProductionLine() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
    const [activeTab, setActiveTab] = useState<string>("todos");

    const { data: allData, isLoading: loadingInsumos, refetch } = useAllInsumos(selectedMonth, selectedYear);
    const { data: produtos, isLoading: loadingProdutos, error: produtosError } = useProdutos();
    const { user, canAccessProduct } = usePermissions();

    // Actions
    const { mutate: createEdicao, isPending: creatingEdicao } = useCreateEdicao();


    const handleCreateEdicao = (produtoId: string) => {
        const now = new Date();
        createEdicao({
            produtoId,
            mes: now.getMonth() + 1,
            ano: now.getFullYear()
        }, {
            onSuccess: () => {
                toast.success("Edição criada com sucesso!");
                refetch();
            },
            onError: () => toast.error("Erro ao criar edição.")
        });
    };



    // Filter products based on permissions
    const filteredProdutos = useMemo(() => {
        if (!produtos || !user) return [];

        // Managers and Coordinators see all
        if (user.role === 'gerente' || user.role === 'coordenador') {
            return produtos;
        }

        // Others see only what they have access to
        return produtos.filter(p => canAccessProduct(p.slug));
    }, [produtos, user, canAccessProduct]);

    if (loadingInsumos || loadingProdutos) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const insumos = allData?.insumos || [];
    const edicoes = allData?.edicoes || [];

    // If user has no access to any product
    if (filteredProdutos.length === 0) {
        return (
            <div className="flex flex-col h-full bg-background p-8 items-center justify-center">
                <div className="max-w-md w-full">
                    <Alert variant="destructive" className="mb-4">
                        <Lock className="h-4 w-4" />
                        <AlertTitle>Acesso Restrito</AlertTitle>
                        <AlertDescription>
                            Você não possui permissão para visualizar nenhum produto nesta esteira.
                            Entre em contato com seu coordenador.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 w-full h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 overflow-hidden flex flex-col">
                <div className="mb-8 border-b-4 border-slate-900 pb-6">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Esteira de Produção</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Gerencie insumos e acompanhe o fluxo de produção.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-8 pb-4">
                        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 gap-4 h-auto">
                            {/* "Visão Geral" only for Managers/Coordinators */}
                            {(user?.role === 'gerente' || user?.role === 'coordenador') && (
                                <TabsTrigger 
                                    value="todos"
                                    className="data-[state=active]:bg-yellow-300 data-[state=active]:text-slate-900 data-[state=active]:shadow-[4px_4px_0_0_rgba(15,23,42,1)] data-[state=active]:translate-y-[-2px] bg-white border-2 border-slate-900 rounded-none text-xs font-black uppercase tracking-widest px-6 py-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex items-center gap-3 min-w-[180px]"
                                >
                                    <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center shrink-0 border-2 border-transparent">
                                        <LayoutDashboard className="w-4 h-4"/>
                                    </div>
                                    <span className="truncate">VISÃO GERAL</span>
                                </TabsTrigger>
                            )}

                            {filteredProdutos.map(produto => (
                                <TabsTrigger 
                                    key={produto.id} 
                                    value={produto.id}
                                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-[4px_4px_0_0_rgba(15,23,42,1)] data-[state=active]:translate-y-[-2px] bg-white border-2 border-slate-900 rounded-none text-xs font-black uppercase tracking-widest px-6 py-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex items-center gap-3 min-w-[200px]"
                                >
                                    <div className="w-8 h-8 bg-white border-2 border-slate-900 p-0.5 flex items-center justify-center shrink-0">
                                        {logoMap[produto.slug] ? (
                                            <img src={logoMap[produto.slug]} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="font-black text-[10px] text-slate-900">{produto.nome.substring(0,2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span className="truncate">{produto.nome}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {/* Edition Filter */}
                        <div className="flex gap-2 ml-4">
                            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                <SelectTrigger className="w-[120px] rounded-none border-2 border-slate-900 font-bold uppercase text-[10px] tracking-wider bg-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-transform hover:-translate-y-px hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <SelectItem key={m} value={m.toString()} className="uppercase text-[10px] font-bold">
                                            {format(new Date(2024, m - 1, 1), 'MMMM')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger className="w-[100px] rounded-none border-2 border-slate-900 font-bold uppercase text-[10px] tracking-wider bg-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] transition-transform hover:-translate-y-px hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)]">
                                    {[2024, 2025, 2026].map((y) => (
                                        <SelectItem key={y} value={y.toString()} className="uppercase text-[10px] font-bold">
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* "Visão Geral" Content - Only render if allowed */}
                    {(user?.role === 'gerente' || user?.role === 'coordenador') && (
                        <TabsContent value="todos" className="flex-1 h-full mt-0 overflow-y-auto outline-none">
                            <div className="pb-8">
                                <div className="max-w-5xl mx-auto flex flex-col gap-2">
                                    {filteredProdutos.map(produto => {
                                        const edicao = edicoes.find(e => e.produto_id === produto.id);
                                        const insumosProduto = insumos.filter(i => i.edicao?.produto_id === produto.id);
                                        return (
                                            <ProductionEvolutionCard 
                                                key={produto.id}
                                                produto={produto}
                                                edicao={edicao}
                                                insumos={insumosProduto}
                                                onStartEdicao={handleCreateEdicao}
                                                isCreatingEdicao={creatingEdicao}
                                                onViewKanban={() => setActiveTab(produto.id)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {filteredProdutos.map(produto => {
                        const edicao = edicoes.find(e => e.produto_id === produto.id);
                        const insumosProduto = insumos.filter(i => i.edicao?.produto_id === produto.id);
                        const hasEdicao = !!edicao;
                        const hasInsumos = insumosProduto.length > 0;

                        return (
                            <TabsContent key={produto.id} value={produto.id} className="flex-1 h-full mt-0 overflow-hidden outline-none">
                                <div className="flex flex-col h-full bg-slate-50 border-2 border-slate-200">
                                    
                                    {/* Product Top Data context */}
                                    <div className="p-4 md:p-6 pb-2 shrink-0">
                                        <div className="mb-6 flex gap-2">
                                            {!hasEdicao && (
                                                <Button 
                                                    onClick={() => handleCreateEdicao(produto.id)} 
                                                    disabled={creatingEdicao}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-2 border-slate-900 rounded-none font-black uppercase tracking-widest shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)] hover:-translate-y-1 transition-all h-12 px-6"
                                                >
                                                    {creatingEdicao ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                                                    INICIAR EDIÇÃO PARA {produto.nome}
                                                </Button>
                                            )}
                                        </div>

                                        {hasEdicao && <ProductionTimeline />}

                                        {/* Metrics Strip */}
                                        {hasEdicao && (
                                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-4 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">TOTAL INSUMOS</span>
                                                    <span className="text-3xl font-black text-slate-900 leading-none">{insumosProduto.length}</span>
                                                </div>
                                                <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(21,128,61,1)] p-4 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-1">APROVADOS</span>
                                                    <span className="text-3xl font-black text-green-700 leading-none">{insumosProduto.filter(i => i.status === 'aprovado').length}</span>
                                                </div>
                                                <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(161,98,7,1)] p-4 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 mb-1">PENDENTES</span>
                                                    <span className="text-3xl font-black text-yellow-700 leading-none">{insumosProduto.filter(i => i.status !== 'aprovado').length}</span>
                                                </div>
                                                <div className="bg-white border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(220,38,38,1)] p-4 flex flex-col items-center justify-center text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">ATRASADOS</span>
                                                    <span className="text-3xl font-black text-red-600 leading-none">
                                                        {insumosProduto.filter(i => {
                                                            const today = new Date().toISOString().split('T')[0];
                                                            return i.status !== 'aprovado' && i.data_limite && i.data_limite < today;
                                                        }).length}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Kanban Operation */}
                                    <div className="flex-1 bg-white border-t-2 border-slate-900 min-h-0 overflow-hidden">
                                        {hasInsumos || hasEdicao ? (
                                            <ProductInsumosBoard insumos={insumosProduto} edicaoId={edicao?.id} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-500 font-bold uppercase tracking-wider text-xs p-8 text-center bg-slate-50">
                                                <p>Nenhuma edição iniciada para este produto neste mês.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
}
