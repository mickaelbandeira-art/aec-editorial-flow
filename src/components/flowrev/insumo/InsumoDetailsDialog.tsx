import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Insumo, InsumoStatus, Anexo } from "@/types/flowrev";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Paperclip, Image as ImageIcon, FileText, Send, CheckCircle2, Clock, Trash2, Download, UploadCloud, X } from "lucide-react";
import { useUploadAnexo, useDeleteAnexo } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-card">
            {editable && (
                <div className="bg-muted p-2 border-b flex gap-2 overflow-x-auto">
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}>Bold</Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}>Italic</Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()}>Strike</Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet</Button>
                </div>
            )}
            <EditorContent editor={editor} className="p-2" />
        </div>
    )
}

export function InsumoDetailsDialog({
    isOpen,
    onOpenChange,
    insumo,
    onSave,
}: InsumoDetailsDialogProps) {
    const [status, setStatus] = useState<InsumoStatus>(insumo?.status || 'nao_iniciado');
    const [texto, setTexto] = useState(insumo?.conteudo_texto || '');
    const [obs, setObs] = useState(insumo?.observacoes || '');

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [imageCaption, setImageCaption] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState("conteudo");

    const { mutate: uploadFile } = useUploadAnexo();
    const { mutate: deleteFile } = useDeleteAnexo();
    const { user } = usePermissions();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

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
        });
    };

    /* const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'imagem' | 'pdf') => {
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
    }; */

    setUploading(false);
},
onError: (error) => {
    console.error(error);
    toast.error("Erro no upload. Tente novamente.");
    setUploading(false);
}
        });
    }; */

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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-2 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            {insumo.tipo_insumo?.nome}
                            <Badge variant="outline" className="ml-2 font-normal">
                                {insumo.status.replace('_', ' ')}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            {insumo.tipo_insumo?.descricao || "Preencha os dados do insumo."}
                            {insumo.data_limite && (
                                <span className="block mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Prazo: {new Date(insumo.data_limite).toLocaleDateString()}
                                </span>
                            )}
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={status} onValueChange={(v) => setStatus(v as InsumoStatus)} disabled={availableStatuses.length === 0}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    </div>
                </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col border-r h-full overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 pt-4">
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="conteudo">Conteúdo Textual</TabsTrigger>
                                <TabsTrigger value="anexos">Anexos ({insumo.anexos?.length || 0})</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="conteudo" className="p-6 mt-0">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="mb-2 block">Texto Rico</Label>
                                        <TiptapEditor content={texto} onChange={setTexto} />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="anexos" className="p-6 mt-0">
                                <div className="space-y-6">


                                    {/* Attachment List */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-muted-foreground">Arquivos Anexados</h3>

                                        {insumo.anexos && insumo.anexos.length > 0 ? (
                                            <div className="grid gap-3">
                                                {insumo.anexos.map((anexo) => (
                                                    <div key={anexo.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/10 transition-colors">
                                                        <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-muted rounded-md overflow-hidden">
                                                            {anexo.tipo === 'imagem' ? (
                                                                <img src={anexo.url} alt={anexo.nome_arquivo} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate" title={anexo.nome_arquivo}>
                                                                {anexo.nome_arquivo}
                                                            </p>
                                                            {anexo.legenda && (
                                                                <p className="text-xs text-muted-foreground italic">"{anexo.legenda}"</p>
                                                            )}
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                {anexo.tipo.toUpperCase()} • {(anexo.tamanho_bytes ? (anexo.tamanho_bytes / 1024).toFixed(0) + 'KB' : '')}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteAnexo(anexo.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                                Nenhum arquivo anexado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>

                {/* Sidebar: Meta, History, Obs */}
                <div className="w-[300px] bg-muted/10 h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-muted/20">
                        <h3 className="font-semibold text-sm">Observações</h3>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="obs">Observações do Coordenador</Label>
                                <Textarea
                                    id="obs"
                                    placeholder="Feedback, ajustes necessários..."
                                    className="min-h-[100px]"
                                    value={obs}
                                    onChange={(e) => setObs(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Use este campo para orientar ajustes ou aprovação.
                                </p>
                            </div>

                            {/* Placeholder for history log */}
                            <div className="pt-4 border-t">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-3">HISTÓRICO RECENTE</h4>
                                <div className="space-y-3">
                                    {/* Mock history for now */}
                                    <div className="flex gap-2 text-xs opacity-70">
                                        <Clock className="w-3 h-3 mt-0.5" />
                                        <span>Nenhuma alteração recente.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);
}
