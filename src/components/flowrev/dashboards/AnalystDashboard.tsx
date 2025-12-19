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
import { SeedInsumosBtn } from "../../SeedInsumosBtn";

export function AnalystDashboard() {
    const { data, isLoading } = useAllInsumos();
    const { canAccessProduct, user } = usePermissions();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateInsumoStatus();

    // Local State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [productFilter, setProductFilter] = useState<string>("all");

    const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Adjustment Dialog State
    const [adjustmentInsumo, setAdjustmentInsumo] = useState<Insumo | null>(null);
    const [adjustmentComment, setAdjustmentComment] = useState("");

    const insumos = data?.insumos?.filter(i => canAccessProduct(i.edicao?.produto?.slug || '')) || [];
    const activeProducts = Array.from(new Set(insumos.map(i => i.edicao?.produto?.nome))).filter(Boolean);

    // Filtering Logic
    const filteredInsumos = insumos.filter(item => {
        const matchesSearch =
            item.tipo_insumo?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.edicao?.produto?.nome.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesProduct = productFilter === "all" || item.edicao?.produto?.nome === productFilter;

        return matchesSearch && matchesStatus && matchesProduct;
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
        <div className="p-6 space-y-6 animate-fade-in relative min-h-screen">
            {/* Header & KPI Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Painel Operacional</h2>
                    <p className="text-muted-foreground">Gestão de filas e aprovação de conteúdo</p>
                </div>

                <div className="flex gap-3 items-center">
                    <SeedInsumosBtn />
                    <Badge variant="outline" className="px-3 py-1 h-8 flex gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Pendentes: <span className="font-bold">{stats.pending}</span>
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 h-8 flex gap-2 border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Ajustes: <span className="font-bold text-amber-700">{stats.adjustments}</span>
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 h-8 flex gap-2 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Atrasados: <span className="font-bold text-red-700">{stats.delayed}</span>
                    </Badge>
                </div>


                {/* Filters */}
                <Card>
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end md:items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por insumo ou produto..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={productFilter} onValueChange={setProductFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Produtos</SelectItem>
                                    {activeProducts.map((p: any) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                                    <SelectItem value="em_preenchimento">Em Produção</SelectItem>
                                    <SelectItem value="enviado">Enviado / Revisão</SelectItem>
                                    <SelectItem value="ajuste_solicitado">Ajuste Solicitado</SelectItem>
                                    <SelectItem value="aprovado">Aprovado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card className="overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Insumo / Detalhes</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead>Data Limite</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Anexos</TableHead>
                                <TableHead className="text-right">Ações Rápidas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInsumos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhum insumo encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : filteredInsumos.map((insumo) => (
                                <TableRow key={insumo.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground/90">{insumo.tipo_insumo?.nome}</span>
                                            {insumo.observacoes && (
                                                <span className="text-xs text-muted-foreground truncate max-w-[250px] flex items-center gap-1 mt-1">
                                                    <MessageSquare className="h-3 w-3" /> {insumo.observacoes}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {insumo.edicao?.produto?.nome}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{insumo.data_limite ? format(new Date(insumo.data_limite), 'dd/MM/yyyy') : '-'}</span>
                                            {insumo.data_limite && new Date(insumo.data_limite) < new Date() && insumo.status !== 'aprovado' && (
                                                <span className="text-[10px] text-red-500 font-bold uppercase">Atrasado</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={`
                                    capitalize 
                                    ${insumo.status === 'aprovado' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}
                                    ${insumo.status === 'ajuste_solicitado' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                                `}
                                        >
                                            {insumo.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {insumo.anexos?.map((anexo: any) => (
                                                <a
                                                    key={anexo.id}
                                                    href={anexo.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-8 w-8 rounded bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors border"
                                                    title={anexo.nome_arquivo}
                                                >
                                                    {anexo.tipo === 'pdf' ? <FileText className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </a>
                                            ))}
                                            {(!insumo.anexos || insumo.anexos.length === 0) && (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    setSelectedInsumo(insumo);
                                                    setIsDetailsOpen(true);
                                                }}
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>

                                            {insumo.status !== 'aprovado' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 hover:bg-amber-50 hover:text-amber-600"
                                                        onClick={() => setAdjustmentInsumo(insumo)}
                                                        title="Solicitar Ajuste"
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                                                        onClick={() => handleApprove(insumo)}
                                                        title="Aprovar"
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
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
                <InsumoDetailsDialog
                    isOpen={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    insumo={selectedInsumo}
                    onSave={() => { }} // Read-only mostly, or handle save if needed
                />

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
            </div>
            );
}
