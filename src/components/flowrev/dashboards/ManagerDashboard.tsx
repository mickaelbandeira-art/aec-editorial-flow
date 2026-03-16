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
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ManagerDashboard() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

    const { data: stats, isLoading } = useManagerStats(selectedMonth, selectedYear);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 leading-none">Visão Geral <span className="text-primary italic">Estratégica</span></h2>
                    <div className="h-1 w-20 bg-slate-900 mt-2"></div>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Relatório Executivo Mensal • v2.1</p>
                </div>
                
                <div className="flex gap-2">
                     <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                        <SelectTrigger className="w-[120px] rounded-none border-2 border-slate-300 font-bold uppercase text-[10px] tracking-wider bg-white">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-2 border-slate-900">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <SelectItem key={m} value={m.toString()} className="uppercase text-[10px] font-bold">
                                    {format(new Date(2024, m - 1, 1), 'MMMM')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px] rounded-none border-2 border-slate-300 font-bold uppercase text-[10px] tracking-wider bg-white">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-2 border-slate-900">
                            {[2024, 2025, 2026].map((y) => (
                                <SelectItem key={y} value={y.toString()} className="uppercase text-[10px] font-bold">
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Global Timeline */}
            <ProductionTimeline />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] bg-white group hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-2 border-slate-900 bg-emerald-50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Progresso Geral</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-5xl font-black tracking-tighter text-slate-900 italic">{kpis.progressoGeral}<span className="text-lg ml-1 text-slate-400 not-italic">%</span></div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Meta mensal consolidada</p>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] bg-white group hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-2 border-slate-900 bg-blue-50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Insumos em Fluxo</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-5xl font-black tracking-tighter text-slate-900 italic">{kpis.total}</div>
                        <div className="flex gap-2 text-[9px] font-black mt-4 uppercase">
                            <span className="text-emerald-700 flex items-center bg-emerald-100 px-2 py-1 border border-emerald-200"> {kpis.concluidos} OK </span>
                            <span className="text-amber-700 flex items-center bg-amber-100 px-2 py-1 border border-amber-200"> {kpis.pendentes} PEND </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] bg-white group hover:translate-y-[-2px] transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-2 border-slate-900 bg-red-50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">Crise / Atrasos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-5xl font-black tracking-tighter text-red-600 italic">{kpis.atrasadosCount}</div>
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
                    <Card className="rounded-none border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900 py-3">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white leading-none">Pipeline de Produção</CardTitle>
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
                    <Card className="rounded-none border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(15,23,42,1)] bg-white overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900 py-3">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white leading-none">Evolução de Performance</CardTitle>
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
            <Card className="rounded-none border-4 border-slate-900 shadow-[12px_12px_0_0_rgba(15,23,42,1)] bg-white overflow-hidden">
                <CardHeader className="bg-red-50 border-b-4 border-slate-900 py-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.2em] text-red-900">
                        <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
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
                                <TableHeader className="bg-slate-900">
                                    <TableRow className="hover:bg-slate-900 border-b-2 border-slate-900">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-white">Insumo</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-white">Produto</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-white">Data Limite</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-white">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {delayedList.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-red-50 transition-colors border-b-2 border-slate-100 last:border-0">
                                            <TableCell className="font-black text-xs uppercase text-slate-900 py-5">{item.nome}</TableCell>
                                            <TableCell className="text-[10px] font-black text-slate-500 uppercase italic tracking-tighter">{item.produto}</TableCell>
                                            <TableCell className="text-red-600 font-mono font-black text-xs">
                                                {item.data_limite ? format(new Date(item.data_limite), 'dd/MM/yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="rounded-none border-2 border-red-900 bg-red-100 text-red-900 hover:bg-red-200 font-black text-[9px] uppercase px-3 py-1 tracking-widest">
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
