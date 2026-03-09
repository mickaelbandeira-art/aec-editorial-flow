import { useState } from "react";
import { useAllInsumos, useUpdateInsumoStatus } from "@/hooks/useFlowrev";
import { usePermissions } from "@/hooks/usePermission";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    FileText,
    Download,
    Eye,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { InsumoDetailsDialog } from "../insumo/InsumoDetailsDialog";
import { Insumo } from "@/types/flowrev";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SeedInsumosBtn } from "../SeedInsumosBtn";
import { ProductionTimeline } from "@/components/flowrev/ProductionTimeline";

export function AnalystDashboard() {
    const { data, isLoading } = useAllInsumos();
    const { canAccessProduct, user } = usePermissions();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateInsumoStatus();

    // Local State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [productFilter, setProductFilter] = useState<string>("all");
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'adjustments' | 'delayed' | 'approved'>('all');

    const [selectedInsumoId, setSelectedInsumoId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Adjustment Dialog State
    const [adjustmentInsumo, setAdjustmentInsumo] = useState<Insumo | null>(null);
    const [adjustmentComment, setAdjustmentComment] = useState("");

    const insumos = data?.insumos?.filter(i => canAccessProduct(i.edicao?.produto?.slug || '')) || [];

    // Derive selected insumo from the fresh list
    const selectedInsumo = insumos.find(i => i.id === selectedInsumoId) || null;

    const activeProducts = Array.from(new Set(insumos.map(i => i.edicao?.produto?.nome))).filter(Boolean);

    // Filtering Logic
    const filteredInsumos = insumos.filter(item => {
        const matchesSearch =
            item.tipo_insumo?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.edicao?.produto?.nome.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesProduct = productFilter === "all" || item.edicao?.produto?.nome === productFilter;

        // Metric Badge Filtering
        let matchesMetric = true;
        const today = new Date().toISOString().split('T')[0];

        if (activeFilter === 'pending') {
            matchesMetric = item.status !== 'aprovado' && item.status !== 'nao_iniciado';
        } else if (activeFilter === 'adjustments') {
            matchesMetric = item.status === 'ajuste_solicitado';
        } else if (activeFilter === 'delayed') {
            matchesMetric = item.status !== 'aprovado' && !!item.data_limite && item.data_limite < today;
        } else if (activeFilter === 'approved') {
            matchesMetric = item.status === 'aprovado';
        }

        return matchesSearch && matchesStatus && matchesProduct && matchesMetric;
    });

    // Stats
    const stats = {
        pending: insumos.filter(i => i.status !== 'aprovado' && i.status !== 'nao_iniciado').length,
        adjustments: insumos.filter(i => i.status === 'ajuste_solicitado').length,
        approved: insumos.filter(i => i.status === 'aprovado').length,
        delayed: insumos.filter(i => {
            const today = new Date().toISOString().split('T')[0];
            return i.status !== 'aprovado' && i.data_limite && i.data_limite < today;
        }).length
    };

    // Handlers
    const handleApprove = (insumo: Insumo) => {
        toast.promise(
            new Promise((resolve, reject) => {
                updateStatus({ insumoId: insumo.id, status: 'aprovado' }, {
                    onSuccess: resolve,
                    onError: reject
                })
            }),
            {
                loading: 'Aprovando insumo...',
                success: 'Insumo aprovado com sucesso!',
                error: 'Erro ao aprovar insumo.'
            }
        );
    };

    const handleRequestAdjustment = () => {
        if (!adjustmentInsumo || !adjustmentComment.trim()) {
            toast.error("O comentário é obrigatório para solicitar ajustes.");
            return;
        }

        updateStatus({
            insumoId: adjustmentInsumo.id,
            status: 'ajuste_solicitado',
            motivo_ajuste: adjustmentComment
        }, {
            onSuccess: () => {
                toast.success("Ajuste solicitado com sucesso!");
                setAdjustmentInsumo(null);
                setAdjustmentComment("");
            },
            onError: () => toast.error("Erro ao solicitar ajuste.")
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-fade-in relative min-h-screen bg-slate-50/30">
            {/* Header & KPI Summary */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">Painel <span className="text-primary">Operacional</span></h2>
                    <p className="text-xs font-medium text-slate-500 mt-2 tracking-widest uppercase">Sistema de Gestão de Filas v2.0</p>
                </div>
                <SeedInsumosBtn className="rounded-none border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all font-bold uppercase tracking-wider" />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <Badge
                    variant={activeFilter === 'pending' ? 'default' : 'outline'}
                    className={`px-4 py-2 h-10 flex gap-2 cursor-pointer transition-all rounded-none border-2 font-black uppercase text-[10px] tracking-widest ${activeFilter === 'pending' ? 'bg-slate-900 border-slate-900' : 'hover:bg-slate-900/5 border-slate-200'}`}
                    onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
                >
                    <FileText className="h-4 w-4" />
                    Pendentes: {stats.pending}
                </Badge>

                <Badge
                    variant={activeFilter === 'adjustments' ? 'default' : 'outline'}
                    className={`px-4 py-2 h-10 flex gap-2 cursor-pointer transition-all rounded-none border-2 font-black uppercase text-[10px] tracking-widest ${activeFilter === 'adjustments'
                        ? 'bg-amber-500 border-amber-500 hover:bg-amber-600'
                        : 'bg-amber-50/50 text-amber-900 border-amber-200'
                        }`}
                    onClick={() => setActiveFilter(activeFilter === 'adjustments' ? 'all' : 'adjustments')}
                >
                    <AlertCircle className="h-4 w-4" />
                    Ajustes: {stats.adjustments}
                </Badge>

                <Badge
                    variant={activeFilter === 'delayed' ? 'default' : 'outline'}
                    className={`px-4 py-2 h-10 flex gap-2 cursor-pointer transition-all rounded-none border-2 font-black uppercase text-[10px] tracking-widest ${activeFilter === 'delayed'
                        ? 'bg-red-600 border-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-50/50 text-red-900 border-red-200'
                        }`}
                    onClick={() => setActiveFilter(activeFilter === 'delayed' ? 'all' : 'delayed')}
                >
                    <AlertCircle className="h-4 w-4" />
                    Atrasados: {stats.delayed}
                </Badge>

                <Badge
                    variant={activeFilter === 'approved' ? 'default' : 'outline'}
                    className={`px-4 py-2 h-10 flex gap-2 cursor-pointer transition-all rounded-none border-2 font-black uppercase text-[10px] tracking-widest ${activeFilter === 'approved'
                        ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-emerald-50/50 text-emerald-900 border-emerald-200'
                        }`}
                    onClick={() => setActiveFilter(activeFilter === 'approved' ? 'all' : 'approved')}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovados: {stats.approved}
                </Badge>
            </div>

            {/* Production Timeline (Conveyor Belt) */}
            <ProductionTimeline />

            {/* Filters */}
            <Card className="rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end md:items-center bg-white">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="FILTRAR POR INSUMO OU PRODUTO..."
                            className="pl-10 rounded-none border-slate-200 focus-visible:ring-slate-900 placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Select value={productFilter} onValueChange={setProductFilter}>
                            <SelectTrigger className="w-[180px] rounded-none border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                                <SelectValue placeholder="Produto" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-slate-900">
                                <SelectItem value="all" className="uppercase text-[10px] font-bold">Todos os Produtos</SelectItem>
                                {activeProducts.map((p) => (
                                    <SelectItem key={p} value={p} className="uppercase text-[10px] font-bold">{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] rounded-none border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-2 border-slate-900">
                                <SelectItem value="all" className="uppercase text-[10px] font-bold">Todos os Status</SelectItem>
                                <SelectItem value="nao_iniciado" className="uppercase text-[10px] font-bold">Não Iniciado</SelectItem>
                                <SelectItem value="em_preenchimento" className="uppercase text-[10px] font-bold">Em Produção</SelectItem>
                                <SelectItem value="enviado" className="uppercase text-[10px] font-bold">Enviado / Revisão</SelectItem>
                                <SelectItem value="ajuste_solicitado" className="uppercase text-[10px] font-bold">Ajuste Solicitado</SelectItem>
                                <SelectItem value="aprovado" className="uppercase text-[10px] font-bold">Aprovado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="rounded-none border-2 border-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] bg-white">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-slate-900 border-none">
                            <TableHead className="w-[300px] text-white uppercase text-[10px] font-black tracking-widest py-5">Insumo / Detalhes</TableHead>
                            <TableHead className="text-white uppercase text-[10px] font-black tracking-widest py-5">Produto</TableHead>
                            <TableHead className="text-white uppercase text-[10px] font-black tracking-widest py-5">Data Limite</TableHead>
                            <TableHead className="text-white uppercase text-[10px] font-black tracking-widest py-5">Status</TableHead>
                            <TableHead className="text-white uppercase text-[10px] font-black tracking-widest py-5">Anexos</TableHead>
                            <TableHead className="text-right text-white uppercase text-[10px] font-black tracking-widest py-5">Ações Rápidas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInsumos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                                    Nenhum dado encontrado no sistema.
                                </TableCell>
                            </TableRow>
                        ) : filteredInsumos.map((insumo) => (
                            <TableRow key={insumo.id} className="group hover:bg-slate-50 border-b border-slate-200 transition-all duration-300">
                                <TableCell className="py-5">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 uppercase text-xs tracking-tight leading-4">{insumo.titulo || insumo.tipo_insumo?.nome}</span>
                                        {insumo.observacoes && (
                                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[250px] flex items-center gap-1.5 mt-2 bg-slate-100/50 w-fit px-2 py-0.5 border border-slate-200">
                                                <MessageSquare className="h-3 w-3" /> {insumo.observacoes}
                                            </span>
                                        )}
                                        {insumo.status === 'ajuste_solicitado' && insumo.motivo_ajuste && (
                                            <span className="text-[10px] text-amber-700 font-bold truncate max-w-[250px] flex items-center gap-1.5 mt-2 bg-amber-100/50 px-2 py-0.5 border-l-4 border-l-amber-500 border-r border-t border-b border-amber-200">
                                                <AlertCircle className="h-3 w-3" /> {insumo.motivo_ajuste}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="rounded-none border-slate-200 font-bold uppercase text-[9px] tracking-widest bg-slate-50">
                                        {insumo.edicao?.produto?.nome}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs font-mono font-bold text-slate-600">
                                        <span>{insumo.data_limite ? format(new Date(insumo.data_limite), 'dd/MM/yyyy') : '-'}</span>
                                        {insumo.data_limite && new Date(insumo.data_limite) < new Date() && insumo.status !== 'aprovado' && (
                                            <span className="text-[9px] text-red-600 font-black uppercase tracking-tighter mt-1 animate-pulse">ALERTA: ATRASADO</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={`
                                    rounded-none uppercase text-[9px] font-black tracking-widest px-2 py-1
                                    ${insumo.status === 'aprovado' ? 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500' : ''}
                                    ${insumo.status === 'ajuste_solicitado' ? 'bg-amber-100 text-amber-800 border-l-4 border-amber-500' : ''}
                                    ${insumo.status === 'nao_iniciado' ? 'bg-slate-100 text-slate-500 border-l-4 border-slate-400' : ''}
                                `}
                                    >
                                        {insumo.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1.5">
                                        {insumo.anexos?.map((anexo) => (
                                            <a
                                                key={anexo.id}
                                                href={anexo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="h-9 w-9 rounded-none bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border-2 border-slate-200"
                                                title={anexo.nome_arquivo}
                                            >
                                                {anexo.tipo === 'pdf' ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </a>
                                        ))}
                                        {(!insumo.anexos || insumo.anexos.length === 0) && (
                                            <span className="text-slate-300 font-mono text-xs">---</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-slate-900 transition-all group/btn"
                                            onClick={() => {
                                                setSelectedInsumoId(insumo.id);
                                                setIsDetailsOpen(true);
                                            }}
                                            title="Ver Detalhes"
                                        >
                                            <Eye className="h-5 w-5 text-slate-400 group-hover/btn:text-slate-900 transition-colors" />
                                        </Button>

                                        {insumo.status !== 'aprovado' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-amber-500 hover:text-amber-600 transition-all group/adj"
                                                    onClick={() => setAdjustmentInsumo(insumo)}
                                                    title="Solicitar Ajuste"
                                                >
                                                    <ThumbsDown className="h-5 w-5 text-slate-300 group-hover/adj:text-amber-500 transition-colors" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-10 w-10 p-0 rounded-none border-2 border-transparent hover:border-emerald-500 hover:text-emerald-600 transition-all group/apr"
                                                    onClick={() => handleApprove(insumo)}
                                                    title="Aprovar"
                                                >
                                                    <ThumbsUp className="h-5 w-5 text-slate-300 group-hover/apr:text-emerald-500 transition-colors" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Details Dialog */}
            {selectedInsumo && (
                <InsumoDetailsDialog
                    isOpen={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    insumo={selectedInsumo}
                    onSave={() => { }} // Read-only mostly, or handle save if needed
                />
            )}

            {/* Adjustment Request Dialog */}
            <Dialog open={!!adjustmentInsumo} onOpenChange={(open) => !open && setAdjustmentInsumo(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Solicitar Ajuste</DialogTitle>
                        <DialogDescription>
                            Descreva o que precisa ser alterado para o insumo <b>{adjustmentInsumo?.tipo_insumo?.nome}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Ex: O texto está muito longo, favor reduzir..."
                            value={adjustmentComment}
                            onChange={(e) => setAdjustmentComment(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdjustmentInsumo(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleRequestAdjustment} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Solicitação
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
