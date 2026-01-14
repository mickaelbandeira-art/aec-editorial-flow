import { useManagerStats } from "@/hooks/useFlowrev";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, Cell
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ProductionTimeline } from "@/components/flowrev/ProductionTimeline";

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
        <div className="p-6 space-y-8 animate-fade-in relative">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Visão Geral Estratégica</h2>
                <p className="text-muted-foreground">Acompanhamento executivo das revistas do treinamento.</p>
            </div>

            {/* Global Timeline */}
            <ProductionTimeline />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.progressoGeral}%</div>
                        <p className="text-xs text-muted-foreground">Média de todas as revistas</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Insumos</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.total}</div>
                        <div className="flex gap-2 text-xs mt-1">
                            <span className="text-emerald-500 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> {kpis.concluidos} </span>
                            <span className="text-amber-500 flex items-center"><Clock className="h-3 w-3 mr-1" /> {kpis.pendentes} </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{kpis.atrasadosCount}</div>
                        <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progresso por Produto - Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Progresso por Produto</CardTitle>
                        <CardDescription>Percentual de conclusão por revista ativa</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="percentual" name="Conclusão (%)" radius={[0, 4, 4, 0]} barSize={32}>
                                    {productsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percentual === 100 ? '#10b981' : entry.percentual < 50 ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Comparativo Mensal - Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evolução Mensal</CardTitle>
                        <CardDescription>Histórico de entregas nos últimos meses</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="progresso" name="Média de Conclusão (%)" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Insumos Atrasados/Pendentes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Insumos Atrasados
                    </CardTitle>
                    <CardDescription>Lista prioritária de itens fora do prazo</CardDescription>
                </CardHeader>
                <CardContent>
                    {delayedList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                            <p>Nenhum insumo atrasado. Bom trabalho!</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Insumo</TableHead>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Data Limite</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {delayedList.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-red-50/10 transition-colors">
                                            <TableCell className="font-medium">{item.nome}</TableCell>
                                            <TableCell>{item.produto}</TableCell>
                                            <TableCell className="text-red-500 font-bold">
                                                {item.data_limite ? format(new Date(item.data_limite), 'dd/MM/yyyy') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive" className="uppercase text-[10px]">
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
