
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Insumo, InsumoStatus, STATUS_LABELS } from "@/types/flowrev";
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
import {
    useUploadAnexo,
    useDeleteAnexo,
    useTags,
    useUsers,
    useAddTag,
    useRemoveTag,
    useAddMember,
    useRemoveMember
} from "@/hooks/useFlowrev";
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

    // Data Fetching for Trello Features
    const { data: allTags } = useTags();
    const { data: allUsers } = useUsers();

    // Mutations
    const { mutate: uploadFile } = useUploadAnexo();
    const { mutate: deleteFile } = useDeleteAnexo();
    const { mutate: addTag } = useAddTag();
    const { mutate: removeTag } = useRemoveTag();
    const { mutate: addMember } = useAddMember();
    const { mutate: removeMember } = useRemoveMember();

    const { user } = usePermissions();
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [imageCaption, setImageCaption] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

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

    const handleTagToggle = (tagId: string) => {
        const hasTag = insumo.tags?.some(t => t.id === tagId);
        if (hasTag) {
            removeTag({ insumoId: insumo.id, tagId });
        } else {
            addTag({ insumoId: insumo.id, tagId });
        }
    };

    const handleMemberToggle = (userId: string) => {
        const hasMember = insumo.responsaveis?.some(r => r.id === userId);
        if (hasMember) {
            removeMember({ insumoId: insumo.id, userId });
        } else {
            addMember({ insumoId: insumo.id, userId });
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'imagem' | 'pdf') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'imagem') {
                setImageFile(file);
            } else {
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
            <DialogContent className="max-w-[1000px] w-[90%] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#f4f5f7] sm:rounded-lg shadow-2xl border-0">
                {/* 1. Header (Banner-like) */}
                <header className="px-6 py-4 bg-[#f4f5f7] shrink-0">
                    <div className="flex items-start gap-4">
                        <FileText className="mt-1 h-6 w-6 text-slate-700" />
                        <div className="flex-1">
                            <DialogTitle className="text-xl font-semibold text-slate-800 m-0">
                                {insumo.titulo || insumo.tipo_insumo?.nome || "Cartão sem título"}
                            </DialogTitle>
                            <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                na lista <span className="underline decoration-slate-400 decoration-1 underline-offset-2">{STATUS_LABELS[status]}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-slate-500 hover:bg-slate-200">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                {/* 2. Body (Trello Layout) */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* LEFT COLUMN (Main Content) */}
                        <div className="flex-[3] space-y-8">

                            {/* Meta Info Display (Members / Labels) */}
                            {((insumo.responsaveis?.length || 0) > 0 || (insumo.tags?.length || 0) > 0) && (
                                <div className="pl-9 flex flex-wrap gap-6">
                                    {/* Members */}
                                    {insumo.responsaveis && insumo.responsaveis.length > 0 && (
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Membros</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {insumo.responsaveis.map(m => (
                                                    <div key={m.id} className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold border border-white shadow-sm" title={m.nome}>
                                                        {m.nome.charAt(0)}
                                                    </div>
                                                ))}
                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300">
                                                    <span className="text-lg leading-none pb-1">+</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Labels */}
                                    {insumo.tags && insumo.tags.length > 0 && (
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Etiquetas</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {insumo.tags.map(tag => (
                                                    <Badge
                                                        key={tag.id}
                                                        className="h-8 px-3 rounded text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-0 text-white"
                                                        style={{ backgroundColor: tag.cor }}
                                                    >
                                                        {tag.nome}
                                                    </Badge>
                                                ))}
                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded bg-slate-200 hover:bg-slate-300">
                                                    <span className="text-lg leading-none pb-1">+</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <List className="h-6 w-6 text-slate-700" />
                                    <h3 className="text-lg font-semibold text-slate-800">Descrição</h3>
                                </div>
                                <div className="pl-9">
                                    <TiptapEditor
                                        content={texto}
                                        onChange={setTexto}
                                        editable={true}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={handleSave}
                                        >
                                            Salvar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* ... Attachments & Activity (Same as before) ... */}
                            {/* Attachments Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <ImageIcon className="h-6 w-6 text-slate-700" />
                                        <h3 className="text-lg font-semibold text-slate-800">Anexos</h3>
                                    </div>
                                </div>
                                <div className="pl-9 space-y-4">
                                    {insumo.anexos && insumo.anexos.length > 0 ? (
                                        <div className="grid gap-3">
                                            {insumo.anexos.map((anexo) => (
                                                <div key={anexo.id} className="flex items-start gap-3 p-2 hover:bg-slate-200 rounded transition-colors group">
                                                    <div className="h-20 w-28 shrink-0 flex items-center justify-center bg-slate-200 rounded overflow-hidden text-slate-500">
                                                        {anexo.tipo === 'imagem' ? (
                                                            <img src={anexo.url} alt={anexo.nome_arquivo} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <FileText className="h-8 w-8 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-1">
                                                        <p className="font-semibold text-sm text-slate-800 truncate" title={anexo.nome_arquivo}>
                                                            {anexo.nome_arquivo}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Adicionado em {format(new Date(anexo.created_at), "dd 'de' MMM", { locale: ptBR })}
                                                        </p>
                                                        <div className="flex gap-1 mt-2">
                                                            <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-slate-500 hover:text-slate-800">
                                                                Baixar
                                                            </a>
                                                            <span className="text-slate-300">•</span>
                                                            <button className="text-xs underline text-slate-500 hover:text-red-600" onClick={() => handleDeleteAnexo(anexo.id)}>
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Nenhum anexo.</p>
                                    )}
                                    <Button variant="secondary" size="sm" className="bg-slate-200 hover:bg-slate-300 text-slate-700" onClick={() => imageInputRef.current?.click()}>
                                        Adicionar anexo
                                    </Button>
                                    <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'imagem')} />
                                    {imageFile && (
                                        <div className="bg-white border border-slate-200 rounded p-3 mt-2 shadow-sm">
                                            <p className="text-sm font-semibold mb-2">Legenda para a imagem:</p>
                                            <Input value={imageCaption} onChange={e => setImageCaption(e.target.value)} className="mb-2" placeholder="Descreva a imagem..." />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => startUpload(imageFile, 'imagem', imageCaption)} disabled={uploading}>{uploading ? "Enviando..." : "Enviar"}</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setImageFile(null)}>Cancelar</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Activity Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Heading2 className="h-6 w-6 text-slate-700" />
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="text-lg font-semibold text-slate-800">Atividade</h3>
                                        <Button variant="secondary" size="sm" className="h-8 bg-slate-200 hover:bg-slate-300 text-slate-700">Mostrar detalhes</Button>
                                    </div>
                                </div>
                                <div className="pl-9 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">OBS</div>
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs font-semibold text-slate-500">OBSERVAÇÕES (Coordenador/Supervisor)</Label>
                                            <div className="bg-white border border-slate-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent">
                                                <Textarea placeholder="Escreva um comentário..." className="min-h-[60px] border-none shadow-none resize-none p-0 text-sm focus-visible:ring-0" value={obs} onChange={(e) => setObs(e.target.value)} />
                                                <div className="flex justify-end mt-2">
                                                    <Button size="sm" variant="outline" onClick={handleSave} className="h-7 text-xs">Salvar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Sidebar) */}
                        <aside className="w-full md:w-[25%] flex flex-col gap-6 pt-2">

                            {/* Suggestion: Add to card */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Adicionar ao cartão</span>

                                {/* Members Popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="secondary" className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8 relative">
                                            <span className="mr-2">👤</span> Membros
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0" align="start">
                                        <div className="p-3 border-b border-slate-100"><h4 className="text-sm font-semibold text-center text-slate-700">Membros</h4></div>
                                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                                            <Input placeholder="Buscar membros..." className="h-8 text-xs mb-2" />
                                            {allUsers?.map(u => {
                                                const isSelected = insumo.responsaveis?.some(r => r.id === u.id);
                                                return (
                                                    <div
                                                        key={u.id}
                                                        className={cn("flex items-center gap-2 p-2 rounded hover:bg-slate-100 cursor-pointer", isSelected && "bg-blue-50")}
                                                        onClick={() => handleMemberToggle(u.id)}
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {u.nome.charAt(0)}
                                                        </div>
                                                        <span className="text-sm text-slate-700 flex-1 truncate">{u.nome}</span>
                                                        {isSelected && <div className="text-blue-600">✔</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {/* Labels Popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="secondary" className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8">
                                            <span className="mr-2">🏷️</span> Etiquetas
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-0" align="start">
                                        <div className="p-3 border-b border-slate-100"><h4 className="text-sm font-semibold text-center text-slate-700">Etiquetas</h4></div>
                                        <div className="p-2 space-y-1">
                                            <Input placeholder="Buscar etiquetas..." className="h-8 text-xs mb-2" />
                                            {allTags?.map(tag => {
                                                const isSelected = insumo.tags?.some(t => t.id === tag.id);
                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className="flex items-center gap-2 p-1 rounded hover:bg-slate-100 cursor-pointer group"
                                                        onClick={() => handleTagToggle(tag.id)}
                                                    >
                                                        <div className="h-8 flex-1 rounded text-white text-xs font-bold px-3 flex items-center transition-all" style={{ backgroundColor: tag.cor }}>
                                                            {tag.nome}
                                                            {isSelected && <span className="ml-auto">✔</span>}
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600">
                                                            {/* Edit icon could go here */}
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                            <Button variant="secondary" className="w-full h-8 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 mt-2">Criar nova etiqueta</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="secondary"
                                    className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                >
                                    <span className="mr-2">☑️</span> Checklist
                                </Button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span><span className="mr-2">🕒</span> Datas</span>
                                                {dataLimite && <Badge variant="outline" className="bg-transparent border-slate-400 text-[10px] h-4 px-1">{format(dataLimite, 'dd/MM')}</Badge>}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={dataLimite}
                                            onSelect={setDataLimite}
                                        />
                                        <div className="p-2 border-t border-slate-100 bg-slate-50 flex justify-end">
                                            <Button size="sm" onClick={handleSave} className="h-7 text-xs">Confirmar</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="secondary"
                                    className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                    onClick={() => imageInputRef.current?.click()}
                                >
                                    <span className="mr-2">📎</span> Anexos
                                </Button>
                            </div>

                            {/* Suggestion: Actions */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</span>

                                <Button
                                    variant="secondary"
                                    className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                >
                                    <span className="mr-2">➡️</span> Mover
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                >
                                    <span className="mr-2">📋</span> Copiar
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="w-full justify-start bg-[#eaecf0] hover:bg-[#dfe1e6] text-[#172b4d] font-medium transition-colors h-8"
                                >
                                    <span className="mr-2">🗑️</span> Arquivar
                                </Button>
                            </div>

                            {/* Meta Info */}
                            <div className="mt-8 text-xs text-slate-400">
                                <p>Criado em {format(new Date(insumo.created_at), "dd 'de' MMMM", { locale: ptBR })}</p>
                                <p>ID: {insumo.id.slice(0, 8)}</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </DialogContent>
            {/* Hidden inputs for external script compatibility if needed */}
            <input type="hidden" id="modal-card-id-hidden" value={insumo?.id || ''} />
            <input type="hidden" id="modal-data-entrega-hidden" value={dataLimite ? format(dataLimite, 'yyyy-MM-dd') : ''} />
        </Dialog>
    );
}

// Re-export specific icons if needed elsewhere in the file (not needed here but good practice)

