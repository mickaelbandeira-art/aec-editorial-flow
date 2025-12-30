
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Insumo, InsumoStatus } from "@/types/flowrev";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import {
    Bold,
    Italic,
    Underline,
    List,
    Heading2,
    Image as ImageIcon,
    FileText,
    Download,
    Trash2,
    X,
    Clock,
    Loader2,
    UploadCloud,
    Calendar as CalendarIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUploadAnexo, useDeleteAnexo } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermission";

interface InsumoDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    insumo: Insumo | null;
    onSave: (insumo: Partial<Insumo>) => void;
}

const TiptapEditor = ({ content, onChange, editable = true }: { content: string, onChange?: (html: string) => void, editable?: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension
        ],
        content: content || '<p>Comece a escrever...</p>',
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-4 focus:outline-none min-h-[350px] max-w-none',
            },
        },
    });

    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col h-[400px]">
            {editable && (
                <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 overflow-x-auto items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-200"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        title="Negrito"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-200"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        title="Itálico"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-200"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run()}
                        title="Sublinhado"
                    >
                        <Underline className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-200"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Lista"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:bg-slate-200"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        title="H2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <ScrollArea className="flex-1 bg-white">
                <EditorContent editor={editor} />
            </ScrollArea>
        </div>
    )
}

export function InsumoDetailsDialog({
    isOpen,
    onOpenChange,
    insumo,
    onSave,
}: InsumoDetailsDialogProps) {
    const [status, setStatus] = useState<InsumoStatus>('nao_iniciado');
    const [texto, setTexto] = useState('');
    const [obs, setObs] = useState('');
    const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);

    // Sync state when insumo changes
    React.useEffect(() => {
        if (insumo) {
            setStatus(insumo.status || 'nao_iniciado');
            setTexto(insumo.conteudo_texto || '');
            setObs(insumo.observacoes || '');
            setDataLimite(insumo.data_limite ? new Date(insumo.data_limite) : undefined);
        }
    }, [insumo]);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [imageCaption, setImageCaption] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState("conteudo");

    const { mutate: uploadFile } = useUploadAnexo();
    const { mutate: deleteFile } = useDeleteAnexo();
    const { user } = usePermissions();
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Permission Logic
    const getAvailableStatuses = () => {
        const allStatuses: { value: InsumoStatus, label: string }[] = [
            { value: 'nao_iniciado', label: 'Não Iniciado' },
            { value: 'em_preenchimento', label: 'Em Preenchimento' },
            { value: 'enviado', label: 'Enviado' },
            { value: 'em_analise', label: 'Em Análise' },
            { value: 'ajuste_solicitado', label: 'Ajuste Solicitado' },
            { value: 'aprovado', label: 'Aprovado' },
        ];

        if (!user) return allStatuses;

        if (user.role === 'supervisor' || user.role === 'analista_pleno') {
            return allStatuses.filter(s => ['nao_iniciado', 'em_preenchimento', 'enviado'].includes(s.value));
        }

        if (user.role === 'analista') {
            return allStatuses.filter(s => ['enviado', 'em_analise', 'ajuste_solicitado', 'aprovado'].includes(s.value));
        }

        if (user.role === 'coordenador' || user.role === 'gerente') {
            return allStatuses;
        }

        return allStatuses;
    };

    const availableStatuses = getAvailableStatuses();

    if (!insumo) return null;

    const handleSave = () => {
        onSave({
            id: insumo.id,
            status,
            conteudo_texto: texto,
            observacoes: obs,
            data_limite: dataLimite ? dataLimite.toISOString() : null,
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'imagem' | 'pdf') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'imagem') {
                setImageFile(file);
                // Prompt for caption next
            } else {
                // PDF upload directly
                startUpload(file, 'pdf');
            }
        }
    };

    const startUpload = (file: File, tipo: 'imagem' | 'pdf', caption?: string) => {
        setUploading(true);
        uploadFile({
            insumoId: insumo.id,
            file,
            tipo,
            legenda: caption
        }, {
            onSuccess: () => {
                toast.success("Arquivo enviado com sucesso!");
                setImageFile(null);
                setImageCaption("");
                setUploading(false);
            },
            onError: (error) => {
                console.error("Upload error:", error);
                toast.error(`Erro no upload: ${error instanceof Error ? error.message : "Desconhecido"}`);
                setUploading(false);
            }
        });
    };

    const handleDeleteAnexo = (anexoId: string) => {
        if (confirm("Tem certeza que deseja excluir este anexo?")) {
            deleteFile(anexoId, {
                onSuccess: () => toast.success("Anexo excluído"),
                onError: () => toast.error("Erro ao excluir anexo")
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1000px] w-[90%] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white sm:rounded-lg shadow-2xl border-0">
                {/* 1. Header */}
                <header className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-2xl font-semibold text-slate-800 m-0">
                            {insumo.tipo_insumo?.nome || "Jogo"}
                        </DialogTitle>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs border border-slate-200 font-medium">
                            Gamificação
                        </span>
                        <DialogDescription className="sr-only">
                            Detalhes do insumo
                        </DialogDescription>
                    </div>
                    <div className="flex gap-3">
                        <Select value={status} onValueChange={(v) => setStatus(v as InsumoStatus)} disabled={availableStatuses.length === 0}>
                            <SelectTrigger className="w-[180px] border-slate-200 text-slate-700">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                            onClick={handleSave}
                        >
                            Salvar Alterações
                        </Button>
                    </div>
                </header>

                {/* 2. Body (Grid Layout) */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Main Content (Left) */}
                    <div className="flex-[2] border-r border-slate-200 overflow-hidden flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <div className="px-6 pt-0 border-b border-slate-200">
                                <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-6">
                                    <TabsTrigger
                                        value="conteudo"
                                        className="rounded-none border-b-2 border-transparent px-2 py-4 text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none"
                                    >
                                        Conteúdo Textual
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="anexos"
                                        className="rounded-none border-b-2 border-transparent px-2 py-4 text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent shadow-none"
                                    >
                                        Anexos ({insumo.anexos?.length || 0})
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1 bg-white">
                                <div className="p-6">
                                    <TabsContent value="conteudo" className="m-0 focus-visible:ring-0">
                                        <div className="space-y-4">
                                            <Label className="block mb-2 font-semibold text-slate-700">Texto Rico</Label>
                                            <Textarea
                                                placeholder="Digite o conteúdo aqui..."
                                                className="min-h-[350px] bg-white border-slate-200 focus:border-blue-600 focus:ring-blue-600 resize-y text-base"
                                                value={texto}
                                                onChange={(e) => setTexto(e.target.value)}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="anexos" className="m-0 focus-visible:ring-0">
                                        <div className="space-y-6">
                                            {/* Image Upload Area */}
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => imageInputRef.current?.click()}>
                                                    <input
                                                        type="file"
                                                        ref={imageInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileSelect(e, 'imagem')}
                                                    />
                                                    <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                                                        <ImageIcon className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Upload de Imagem</h3>
                                                    <p className="text-xs text-slate-500 text-center">
                                                        Arraste ou clique para selecionar (PNG, JPG o WEBP)
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Image Caption Prompt */}
                                            {imageFile && (
                                                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-in fade-in zoom-in-95">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="font-semibold text-sm text-slate-800">Adicionar Legenda Obrigatória</h4>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setImageFile(null)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex gap-4 items-center">
                                                        <div className="h-16 w-16 bg-slate-100 rounded object-cover overflow-hidden flex-shrink-0 border border-slate-200">
                                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <Input
                                                                placeholder="Descreva a imagem..."
                                                                value={imageCaption}
                                                                onChange={(e) => setImageCaption(e.target.value)}
                                                                autoFocus
                                                                className="border-slate-200"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                                disabled={!imageCaption.trim() || uploading}
                                                                onClick={() => startUpload(imageFile, 'imagem', imageCaption)}
                                                            >
                                                                {uploading ? "Enviando..." : "Confirmar Upload"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Attachment List */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Arquivos Anexados</h3>

                                                {insumo.anexos && insumo.anexos.length > 0 ? (
                                                    <div className="grid gap-3">
                                                        {insumo.anexos.map((anexo) => (
                                                            <div key={anexo.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-blue-300 transition-colors group">
                                                                <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-slate-100 rounded-md overflow-hidden text-slate-500">
                                                                    {anexo.tipo === 'imagem' ? (
                                                                        <img src={anexo.url} alt={anexo.nome_arquivo} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <FileText className="h-5 w-5" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm text-slate-900 truncate" title={anexo.nome_arquivo}>
                                                                        {anexo.nome_arquivo}
                                                                    </p>
                                                                    {anexo.legenda && (
                                                                        <p className="text-xs text-slate-500 italic">"{anexo.legenda}"</p>
                                                                    )}
                                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                                        {anexo.tipo.toUpperCase()} • {(anexo.tamanho_bytes ? (anexo.tamanho_bytes / 1024).toFixed(0) + 'KB' : '')}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" asChild>
                                                                        <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDeleteAnexo(anexo.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                        Nenhum arquivo anexado.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </Tabs>
                    </div>

                    {/* Sidebar (Right) */}
                    <aside className="w-[350px] bg-slate-50/50 flex flex-col overflow-hidden border-l border-slate-200">
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-slate-900">Data de Entrega</h3>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal border-slate-200",
                                                    !dataLimite && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dataLimite ? format(dataLimite, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dataLimite}
                                                onSelect={setDataLimite}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="h-px bg-slate-200 my-4" />

                                <div>
                                    <h3 className="font-semibold text-sm text-slate-900 mb-2">Observações</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Sem observações gerais.
                                    </p>
                                </div>

                                <div className="h-px bg-slate-200 my-4" />

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm text-slate-900">Observações do Coordenador</h3>
                                    <Textarea
                                        id="obs"
                                        placeholder="Feedback, ajustes necessários..."
                                        className="min-h-[120px] bg-white border-slate-200 focus:border-blue-600 focus:ring-blue-600 resize-y"
                                        value={obs}
                                        onChange={(e) => setObs(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-400">
                                        Use este campo para orientar ajustes ou aprovação.
                                    </p>
                                </div>

                                <div className="h-px bg-slate-200 my-4" />

                                <div>
                                    <h3 className="font-semibold text-sm text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Histórico Recente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Nenhuma alteração recente.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </aside>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Re-export specific icons if needed elsewhere in the file (not needed here but good practice)
export { Trash2, Download, UploadCloud };

