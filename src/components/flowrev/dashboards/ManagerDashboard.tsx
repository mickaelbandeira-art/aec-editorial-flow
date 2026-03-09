import { useManagerStats } from "@/hooks/useFlowrev";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, Cell, PieChart, Pie
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ProductionTimeline } from "@/components/flowrev/ProductionTimeline";
import { ProductStrategyCard, type ProductStats } from "./ProductStrategyCard";

export function ManagerDashboard() {
    const { data: stats, isLoading } = useManagerStats();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const kpis = stats?.kpis || { total: 0, concluidos: 0, pendentes: 0, atrasadosCount: 0, progressoGeral: 0 };
    const productsData = stats?.progressoPorProduto || [];
    const monthlyData = stats?.comparativoMensal || [];
    const delayedList = stats?.atrasadosList || [];

    return (
        <div className="p-6 space-y-10 animate-fade-in relative min-h-screen bg-[#fafafa]">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-none">Visão Geral <span className="text-primary italic">Estratégica</span></h2>
                <div className="h-1 w-20 bg-slate-900 mt-2"></div>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Relatório Executivo Mensal • v2.1</p>
            </div>

            {/* Global Timeline */}
            <ProductionTimeline />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-none border-t-8 border-t-emerald-500 border-x-0 border-b-0 shadow-xl bg-white group hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progresso Geral</CardTitle>
                        <div className="p-2 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-5xl font-black tracking-tighter text-slate-900">{kpis.progressoGeral}<span className="text-lg ml-1 text-slate-400">%</span></div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Meta mensal consolidada</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-t-8 border-t-blue-500 border-x-0 border-b-0 shadow-xl bg-white group hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Insumos em Fluxo</CardTitle>
                        <div className="p-2 bg-blue-50 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Package className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-5xl font-black tracking-tighter text-slate-900">{kpis.total}</div>
                        <div className="flex gap-4 text-[10px] font-bold mt-4 uppercase">
                            <span className="text-emerald-600 flex items-center bg-emerald-50 px-2 py-1"><CheckCircle2 className="h-3 w-3 mr-1.5" /> {kpis.concluidos} </span>
                            <span className="text-amber-600 flex items-center bg-amber-50 px-2 py-1"><Clock className="h-3 w-3 mr-1.5" /> {kpis.pendentes} </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-t-8 border-t-red-500 border-x-0 border-b-0 shadow-xl bg-white group hover:-translate-y-1 transition-all duration-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Crise / Atrasos</CardTitle>
                        <div className="p-2 bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <AlertTriangle className="h-4 w-4 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-5xl font-black tracking-tighter text-red-600">{kpis.atrasadosCount}</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Itens com prazo expirado</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold tracking-tight mb-4">Performance por Produto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {productsData.length === 0 ? (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-600">Nenhuma edição ativa em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">
                                    Não há dados de produção para exibir neste período.
                                </p>
                            </div>
                        ) : (
                            productsData.map((prod) => (
                                <ProductStrategyCard key={prod.id} product={prod as unknown as ProductStats} />
                            ))
                        )}
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Status Distribution - Donut Chart */}
                    <Card className="rounded-none border-2 border-slate-100 shadow-lg bg-white">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Pipeline de Produção</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px] flex items-center justify-center p-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.dadosFaseChart || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        animationBegin={200}
                                        animationDuration={1200}
                                    >
                                        {(stats?.dadosFaseChart || []).map((entry: { name: string, value: number }, index: number) => {
                                            let color = '#94a3b8';
                                            if (entry.name === 'Finalizado') color = '#059669';
                                            if (entry.name === 'Produção') color = '#2563eb';
                                            if (entry.name === 'Revisão') color = '#d97706';
                                            if (entry.name === 'Ajustes') color = '#dc2626';
                                            if (entry.name === 'Kickoff') color = '#475569';

                                            return <Cell key={`cell-${index}`} fill={color} strokeWidth={0} />;
                                        })}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px', padding: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                        formatter={(value: number, name: string) => [`${value} ITENS`, name]}
                                    />
                                    <Legend verticalAlign="bottom" align="center" iconType="rect" formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Comparativo Mensal - Line Chart */}
                    <Card className="rounded-none border-2 border-slate-100 shadow-lg bg-white">
                        <CardHeader className="border-b border-slate-50">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Evolução de Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px] p-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={15}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={15}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        unit="%"
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#0f172a', strokeWidth: 1 }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px', padding: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Line
                                        type="stepAfter"
                                        dataKey="progresso"
                                        name="Taxa de Conclusão"
                                        stroke="#0f172a"
                                        strokeWidth={4}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Insumos Atrasados/Pendentes */}
            <Card className="rounded-none border-t-8 border-t-slate-900 shadow-2xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Lista Prioritária de Atrasos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {delayedList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Painel livre de pendências críticas</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="hover:bg-slate-50">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Insumo</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Produto</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Data Limite</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {delayedList.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-red-50/30 transition-colors border-b border-slate-50">
                                            <TableCell className="font-black text-xs uppercase text-slate-900 py-4">{item.nome}</TableCell>
                                            <TableCell className="text-[10px] font-bold text-slate-500 uppercase">{item.produto}</TableCell>
                                            <TableCell className="text-red-600 font-mono font-black text-xs">
                                                {item.data_limite ? format(new Date(item.data_limite), 'dd/MM/yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="rounded-none bg-red-100 text-red-700 hover:bg-red-200 border-none font-black text-[9px] uppercase px-2 py-0.5 tracking-tighter">
                                                    {item.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
