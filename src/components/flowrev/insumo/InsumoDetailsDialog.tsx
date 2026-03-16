import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
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
    Trash2,
    X,
    Loader2,
    Wand2,
} from "lucide-react";
import { format } from "date-fns";
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
    useRemoveMember,
    useUpdateInsumoStatus,
    useDeleteInsumo,
    useDuplicateInsumo,
    useCreateTag
} from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermission";
import { useGemini } from "@/hooks/useGemini";

interface InsumoDetailsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    insumo: Insumo | null;
    onSave: (insumo: Partial<Insumo>) => Promise<void> | void;
}

// --- EDITOR PROFISSIONAL CORRIGIDO ---
const TiptapEditor = ({ content, onChange, editable = true }: { content: string, onChange?: (html: string) => void, editable?: boolean }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension
        ],
        content: content || '<p>Comece a escrever...</p>',
        editable: editable,
        onUpdate: ({ editor }) => {
            // Só notifica o pai se houver mudança real feita pelo usuário
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl p-4 focus:outline-none min-h-[350px] max-w-none',
            },
        },
    });

    // CORREÇÃO: Sincronização de Estado Robusta
    // Isso garante que se o texto chegar atrasado do backend, o editor atualiza.
    useEffect(() => {
        if (editor && content !== undefined) {
            const currentContent = editor.getHTML();
            // Evita loops e atualizações desnecessárias
            // Verifica se o conteúdo é diferente antes de forçar a atualização
            if (content !== currentContent) {
                // Se o conteúdo for drasticamente diferente (ex: carregou do banco), atualiza.
                // Nota: Em colaboração real-time avançada (Socket.io), precisaria de lógica de cursor, 
                // mas para este caso, isso resolve o "abrir duas vezes".
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const { fixGrammar, isLoading: isAiLoading } = useGemini();

    const handleAiFix = async () => {
        if (!editor) return;
        const text = editor.getHTML();

        // Basic validation
        if (!text || text === '<p></p>' || text.trim() === '') {
            toast.error("Escreva algo para a IA revisar.");
            return;
        }

        const corrected = await fixGrammar(text);
        if (corrected) {
            editor.commands.setContent(corrected);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border-2 border-slate-300 rounded-none overflow-hidden bg-white flex flex-col h-[400px] focus-within:border-slate-900 transition-colors">
            {editable && (
                <div className="bg-slate-50 p-2 border-b-2 border-slate-200 flex gap-2 overflow-x-auto items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        title="Negrito"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        title="Itálico"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run()}
                        title="Sublinhado"
                    >
                        <Underline className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAiFix}
                        disabled={isAiLoading}
                        className="text-slate-900 gap-2 font-bold bg-yellow-400 hover:bg-yellow-500 rounded-none border-2 border-transparent"
                        title="Revisar com IA"
                    >
                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span className="text-[10px] uppercase tracking-wider">Revisar IA</span>
                    </Button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Lista"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-900 transition-colors"
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
    const [descricaoTexto, setDescricaoTexto] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [obs, setObs] = useState('');
    const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);
    const [showChecklist, setShowChecklist] = useState(false);

    // --- CORREÇÃO DE SYNC DE ESTADO ---
    // Este useEffect agora "observa" o conteúdo do texto.
    // Se o insumo for atualizado em background (ex: supervisor enviou), 
    // o React Query atualiza o prop 'insumo', e este efeito atualiza o estado local.
    React.useEffect(() => {
        if (insumo) {
            setStatus(insumo.status || 'nao_iniciado');
            setDescricaoTexto(insumo.conteudo_texto || ''); // Atualiza o texto se mudar externamente
            setObs(insumo.observacoes || '');
            setDataLimite(insumo.data_limite ? new Date(insumo.data_limite) : undefined);
        }
    }, [
        insumo?.id,
        isOpen,
        insumo?.conteudo_texto, // FUNDAMENTAL: Observa mudanças no texto
        insumo?.observacoes,
        insumo?.status,
        insumo?.data_limite
    ]);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate: updateStatus } = useUpdateInsumoStatus();
    const { mutate: deleteInsumo, isPending: deleting } = useDeleteInsumo();
    const { mutate: duplicateInsumo, isPending: duplicating } = useDuplicateInsumo();
    const { mutate: createTag, isPending: creatingTag } = useCreateTag();

    const { user, canPerformAction } = usePermissions();
    const { generateDraft } = useGemini();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imageCaption, setImageCaption] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [optimisticAnexos, setOptimisticAnexos] = useState<{ id: string, nome_arquivo: string, loading: boolean, tipo: 'imagem' | 'pdf' }[]>([]);

    // Tag Creation State
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6');

    if (!insumo) return null;

    const handleSalvarDescricao = async () => {
        try {
            setSalvando(true);
            await onSave({
                id: insumo.id,
                status,
                conteudo_texto: descricaoTexto,
                observacoes: obs,
                data_limite: dataLimite ? dataLimite.toISOString() : null,
            });
            toast.success("Informações salvas com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar. Verifique sua conexão.");
        } finally {
            setSalvando(false);
        }
    };

    const canEdit = canPerformAction('edit');
    const canUpload = canPerformAction('upload');

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

    const handleMove = (newStatus: InsumoStatus) => {
        // Envia TUDO (Status novo + Texto atual + Observacoes)
        onSave({
            id: insumo.id,
            status: newStatus,
            conteudo_texto: descricaoTexto,
            observacoes: obs,
            data_limite: dataLimite ? dataLimite.toISOString() : null,
        });

        setStatus(newStatus);
        toast.info(`Movendo para ${STATUS_LABELS[newStatus]}...`);
    };

    const handleArchive = () => {
        if (confirm("Tem certeza que deseja apagar (excluir) este cartão?")) {
            deleteInsumo(insumo.id, {
                onSuccess: () => {
                    toast.success("Insumo apagado.");
                    onOpenChange(false);
                }
            });
        }
    };

    const handleDuplicate = () => {
        duplicateInsumo(insumo, {
            onSuccess: () => toast.success("Cartão copiado com sucesso!")
        });
    };

    const handleInstantUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            if (files.length > 10) {
                toast.error("Você só pode enviar até 10 arquivos por vez.");
                return;
            }

            files.forEach(file => {
                const tempId = 'temp-' + Date.now() + Math.random();
                const isImage = file.type.startsWith('image/');
                const tipo = isImage ? 'imagem' : 'pdf';

                setOptimisticAnexos(prev => [...prev, { id: tempId, nome_arquivo: file.name, loading: true, tipo }]);

                uploadFile({
                    insumoId: insumo.id,
                    file,
                    tipo,
                    legenda: file.name
                }, {
                    onSuccess: () => {
                        toast.success(`Arquivo ${file.name} enviado!`);
                        setOptimisticAnexos(prev => prev.filter(a => a.id !== tempId));
                    },
                    onError: (error) => {
                        console.error("Upload error:", error);
                        toast.error(`Erro ao enviar ${file.name}.`);
                        setOptimisticAnexos(prev => prev.filter(a => a.id !== tempId));
                    }
                });
            });
            setUploading(false);
            e.target.value = '';
        }
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
            <DialogContent className="max-w-[1000px] w-full md:w-[90%] h-[100vh] md:h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#fafafa] sm:rounded-none shadow-[24px_24px_0_0_rgba(15,23,42,1)] border-4 border-slate-900 [&>button]:hidden">
                {/* 1. Header (Banner-like) */}
                <header className="px-6 md:px-8 py-8 bg-slate-900 border-b-4 border-slate-900 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-white" />
                                <DialogTitle className="text-4xl font-black tracking-tighter text-white leading-none uppercase italic">
                                    {insumo.titulo || insumo.tipo_insumo?.nome || "Cartão sem título"}
                                </DialogTitle>
                            </div>
                            <div className="h-2 w-32 bg-primary mt-2"></div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mt-4">
                                <span className="p-1 bg-slate-800 text-slate-400">STATUS:</span> 
                                <span className="text-white bg-slate-700 px-3 py-1 border border-slate-600">{STATUS_LABELS[status]}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white rounded-none w-12 h-12 border-2 border-slate-700 hover:border-white transition-all bg-slate-800 hover:bg-slate-700">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </header>

                {/* 2. Body (Trello Layout) */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-[3] space-y-8">
                            {/* Meta Info Display (Members / Labels) */}
                             {((insumo.responsaveis?.length || 0) > 0 || (insumo.tags?.length || 0) > 0) && (
                                <div className="flex flex-wrap gap-8 py-6">
                                    {/* Members */}
                                    {insumo.responsaveis && insumo.responsaveis.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-4 border-slate-900 pl-2">Membros</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {insumo.responsaveis.map(m => (
                                                    <div key={m.id} className="h-10 w-10 rounded-none bg-slate-900 flex items-center justify-center text-white text-sm font-black border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]" title={m.nome}>
                                                        {m.nome.charAt(0)}
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-none border-2 border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:translate-y-[-1px] transition-all">
                                                    <span className="text-xl font-black leading-none pb-1">+</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Labels */}
                                    {insumo.tags && insumo.tags.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-4 border-slate-900 pl-2">Etiquetas</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {insumo.tags.map(tag => (
                                                    <Badge
                                                        key={tag.id}
                                                        className="h-10 px-4 rounded-none text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer border-2 border-slate-900 text-white shadow-[4px_4px_0_0_rgba(15,23,42,0.1)]"
                                                        style={{ backgroundColor: tag.cor }}
                                                    >
                                                        {tag.nome}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description Section */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                        <List className="h-4 w-4" /> Detalhes do Escopo
                                    </h3>
                                </div>
                                <div className="">
                                    <TiptapEditor
                                        content={descricaoTexto}
                                        onChange={setDescricaoTexto}
                                        editable={true}
                                    />
                                    <div className="flex gap-3 mt-4">
                                        {canEdit && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-none border-2 border-slate-900 font-black uppercase text-[10px] tracking-widest px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px] transition-all"
                                                    onClick={handleSalvarDescricao}
                                                    disabled={salvando}
                                                >
                                                    {salvando ? "Salvando..." : "Salvar Conteúdo"}
                                                </Button>
                                                
                                                {/* Botão de IA */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black uppercase text-[10px] tracking-widest rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] gap-2 transition-transform hover:translate-y-[-2px] active:translate-y-px"
                                                    onClick={async () => {
                                                        const result = await generateDraft(
                                                            insumo.titulo || insumo.tipo_insumo?.nome || "Sem título", 
                                                            insumo.tipo_insumo?.nome || "Texto",
                                                            obs
                                                        );
                                                        if (result) {
                                                            setDescricaoTexto(result);
                                                        }
                                                    }}
                                                >
                                                    <Wand2 className="h-4 w-4" />
                                                    Gerar Insumo com IA ✨
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Checklist Section */}
                            {(showChecklist || (insumo.checklist && insumo.checklist.length > 0)) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                            <span>☑️</span> Checklist de Tarefas
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Apagar checklist inteiro?')) {
                                                    onSave({ ...insumo, checklist: [] });
                                                    setShowChecklist(false);
                                                }
                                            }}
                                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-red-500 border-2 border-transparent hover:border-red-500 rounded-none h-6 px-2"
                                        >
                                            Excluir Todos
                                        </Button>
                                    </div>
                                    <div className="">
                                        <div className="space-y-2">
                                            {/* Progress Bar */}
                                            {insumo.checklist && insumo.checklist.length > 0 && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {Math.round((insumo.checklist.filter(i => i.checked).length / insumo.checklist.length) * 100)}%
                                                    </span>
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all duration-500"
                                                            style={{ width: `${(insumo.checklist.filter(i => i.checked).length / insumo.checklist.length) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Items */}
                                            {insumo.checklist?.map((item, index) => (
                                                <div key={item.id || index} className="flex items-center gap-2 group">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                                                        checked={item.checked}
                                                        onChange={() => {
                                                            const newChecklist = [...(insumo.checklist || [])];
                                                            newChecklist[index] = { ...item, checked: !item.checked };
                                                            onSave({ ...insumo, checklist: newChecklist });
                                                        }}
                                                    />
                                                    <Input
                                                        value={item.text}
                                                        onChange={(e) => {
                                                            const newChecklist = [...(insumo.checklist || [])];
                                                            newChecklist[index] = { ...item, text: e.target.value };
                                                            // For realtime feel we update local but usually sync on blur
                                                        }}
                                                        onBlur={(e) => {
                                                            const newChecklist = [...(insumo.checklist || [])];
                                                            newChecklist[index] = { ...item, text: e.target.value };
                                                            onSave({ ...insumo, checklist: newChecklist });
                                                        }}
                                                        className="h-8 border-transparent hover:border-slate-200 focus:border-blue-500 bg-transparent px-2 text-sm shadow-none"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                                                        onClick={() => {
                                                            const newChecklist = insumo.checklist?.filter((_, i) => i !== index);
                                                            onSave({ ...insumo, checklist: newChecklist });
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-slate-200 h-7 text-xs justify-start mt-2"
                                                onClick={() => {
                                                    const newChecklist = [...(insumo.checklist || []), { id: crypto.randomUUID(), text: "Novo item", checked: false }];
                                                    onSave({ ...insumo, checklist: newChecklist });
                                                }}
                                            >
                                                Adicionar um item
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Activity Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between w-full">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                        <Heading2 className="h-4 w-4" /> Observações da Gestão
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-none bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)] border-2 border-slate-900 shrink-0 italic">OBS</div>
                                        <div className="flex-1 space-y-2">
                                            <div className="bg-white border-2 border-slate-900 rounded-none p-0 focus-within:border-slate-900 focus-within:shadow-[4px_4px_0_0_rgba(15,23,42,0.1)] transition-all flex flex-col">
                                                <Textarea placeholder="ESCREVA UMA OBSERVAÇÃO (REVISORES/GESTORES)..." className="min-h-[100px] border-none shadow-none resize-none p-4 text-xs font-bold uppercase focus-visible:ring-0 bg-transparent" value={obs} onChange={(e) => setObs(e.target.value)} />
                                                <div className="p-3 border-t-2 border-slate-200 bg-slate-50 flex justify-end">
                                                    <Button size="sm" onClick={handleSalvarDescricao} className="h-10 text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 border-2 border-slate-900 hover:translate-y-[-1px] shadow-[2px_2px_0_0_rgba(15,23,42,1)] rounded-none transition-all">Salvar Observação</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Sidebar) */}
                        <aside className="w-full md:w-[25%] flex flex-col gap-6 pt-2">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Adicionar ao cartão</span>

                                {/* Members Popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 font-black uppercase text-[10px] tracking-widest transition-all rounded-none h-12 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                                            <span className="mr-3 text-sm">👤</span> Atribuir Membros
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
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 font-black uppercase text-[10px] tracking-widest transition-all rounded-none h-12 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
                                            <span className="mr-3 text-sm">🏷️</span> Etiquetas
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
                                                    </div>
                                                )
                                            })}
                                            {isCreatingTag ? (
                                                <div className="p-2 bg-slate-50 border border-slate-200 rounded space-y-2">
                                                    <Input
                                                        placeholder="Nome da etiqueta"
                                                        value={newTagName}
                                                        onChange={(e) => setNewTagName(e.target.value)}
                                                        className="h-7 text-xs"
                                                    />
                                                    <div className="flex gap-2 items-center flex-wrap mt-2">
                                                        <span className="text-xs text-slate-500 w-full">Cor</span>
                                                        {[
                                                            { color: '#ef4444', name: 'Vermelho' },
                                                            { color: '#f97316', name: 'Laranja' },
                                                            { color: '#eab308', name: 'Amarelo' },
                                                            { color: '#22c55e', name: 'Verde' },
                                                            { color: '#3b82f6', name: 'Azul' },
                                                            { color: '#8b5cf6', name: 'Roxo' },
                                                            { color: '#ec4899', name: 'Rosa' },
                                                            { color: '#64748b', name: 'Cinza' }
                                                        ].map(({ color, name }) => (
                                                            <button
                                                                type="button"
                                                                key={color}
                                                                title={name}
                                                                className={cn(
                                                                    "w-6 h-6 rounded-full border border-slate-200 transition-transform active:scale-95",
                                                                    newTagColor === color && "ring-2 ring-slate-800 ring-offset-2 scale-110"
                                                                )}
                                                                style={{ backgroundColor: color }}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setNewTagColor(color);
                                                                    if (!newTagName || newTagName === name || ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul', 'Roxo', 'Rosa', 'Cinza'].includes(newTagName)) {
                                                                        setNewTagName(name);
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                        <div className="flex items-center gap-1 w-full mt-1">
                                                            <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: newTagColor }} />
                                                            <Input
                                                                value={newTagColor}
                                                                onChange={(e) => setNewTagColor(e.target.value)}
                                                                placeholder="#000000"
                                                                className="h-7 text-xs flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 mt-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsCreatingTag(false)}>Cancelar</Button>
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            className={cn("h-7 text-xs text-white", !newTagName.trim() ? "bg-slate-400" : "bg-blue-600")}
                                                            disabled={creatingTag}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();

                                                                const finalName = newTagName.trim() || "Nova Etiqueta";

                                                                createTag({ nome: finalName, cor: newTagColor }, {
                                                                    onSuccess: (newTag) => {
                                                                        toast.success("Etiqueta criada!");
                                                                        setIsCreatingTag(false);
                                                                        setNewTagName("");
                                                                        setNewTagColor('#3b82f6');
                                                                        if (newTag?.id) {
                                                                            addTag({ insumoId: insumo.id, tagId: newTag.id });
                                                                        }
                                                                    },
                                                                    onError: (error) => {
                                                                        console.error(error);
                                                                        toast.error(`Erro: ${error.message || "Falha ao criar"}`);
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            {creatingTag ? "..." : "Criar"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="secondary"
                                                    className="w-full h-8 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 mt-2"
                                                    onClick={() => setIsCreatingTag(true)}
                                                >
                                                    Criar nova etiqueta
                                                </Button>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    variant="outline"
                                    className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 font-black uppercase text-[10px] tracking-widest transition-all rounded-none h-12 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)]"
                                    onClick={() => setShowChecklist(true)}
                                >
                                    <span className="mr-3 text-sm">☑️</span> Checklist
                                </Button>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 font-black uppercase text-[10px] tracking-widest transition-all rounded-none h-12 shadow-[4px_4px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(15,23,42,1)]"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span><span className="mr-3 text-sm">🕒</span> Datas</span>
                                                {dataLimite && <Badge variant="outline" className="bg-slate-900 text-white border-2 border-slate-900 text-[10px] font-black h-6 px-2 italic">{format(dataLimite, 'dd/MM')}</Badge>}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            mode="single"
                                            selected={dataLimite}
                                            onSelect={(date) => setDataLimite(date)}
                                        />
                                        <div className="p-2 border-t border-slate-100 bg-slate-50 flex justify-end">
                                            <Button size="sm" onClick={handleSalvarDescricao} className="h-7 text-xs">Confirmar</Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <div className="space-y-2 mt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Anexos</span>
                                    </div>

                                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                        {insumo.anexos?.map((anexo) => (
                                            <div key={anexo.id} className="group flex items-center gap-2 p-2 rounded-none hover:bg-slate-50 border-2 border-transparent hover:border-slate-200 text-sm transition-all mb-1">
                                                {anexo.tipo === 'imagem' ? <ImageIcon className="h-4 w-4 text-slate-500" /> : <FileText className="h-4 w-4 text-slate-500" />}
                                                <a href={anexo.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-slate-700 hover:underline">{anexo.nome_arquivo}</a>
                                                <button onClick={() => handleDeleteAnexo(anexo.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {optimisticAnexos.map((anexo) => (
                                            <div key={anexo.id} className="flex items-center gap-2 p-2 rounded-none bg-blue-50 text-sm border-2 border-blue-200 mb-1">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                                                <span className="flex-1 truncate text-slate-700 italic">{anexo.nome_arquivo}</span>
                                            </div>
                                        ))}

                                        {(!insumo.anexos?.length && !optimisticAnexos.length) && (
                                            <p className="text-[10px] uppercase font-bold text-slate-400 px-2 my-2 tracking-wider">Sem anexos</p>
                                        )}
                                    </div>

                                    {canUpload && (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-900 text-slate-800 font-bold uppercase text-[10px] tracking-wider transition-all rounded-none h-10 shadow-sm"
                                            onClick={() => imageInputRef.current?.click()}
                                        >
                                            <span className="mr-3 text-sm">📎</span> Adicionar Anexo
                                        </Button>
                                    )}
                                    <input
                                        type="file"
                                        multiple
                                        ref={imageInputRef}
                                        className="hidden"
                                        onChange={handleInstantUpload}
                                    />
                                </div>

                                <div className="space-y-2 mt-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Ações</span>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-900 text-slate-800 font-bold uppercase text-[10px] tracking-wider transition-all rounded-none h-10 shadow-sm"
                                            >
                                                <span className="mr-3 text-sm">➡️</span> Mover Cartão
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-0" align="start">
                                            <div className="p-3 border-b border-slate-100"><h4 className="text-sm font-semibold text-center text-slate-700">Mover para...</h4></div>
                                            <div className="p-1">
                                                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                    <Button
                                                        key={key}
                                                        variant="ghost"
                                                        className={cn("w-full justify-start text-xs h-7", insumo.status === key && "bg-slate-100 text-blue-600")}
                                                        onClick={() => handleMove(key as InsumoStatus)}
                                                    >
                                                        {label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Button
                                        variant="outline"
                                        className="w-full justify-start bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-900 text-slate-800 font-bold uppercase text-[10px] tracking-wider transition-all rounded-none h-10 shadow-sm"
                                        onClick={handleDuplicate}
                                        disabled={duplicating}
                                    >
                                        <span className="mr-3 text-sm">📋</span> {duplicating ? "Copiando..." : "Copiar Cartão"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-600 text-red-600 font-bold uppercase text-[10px] tracking-wider transition-all rounded-none h-10 shadow-sm"
                                        onClick={handleArchive}
                                        disabled={deleting}
                                    >
                                        <span className="mr-3 text-sm">🗑️</span> {deleting ? "Apagando..." : "Apagar Cartão"}
                                    </Button>
                                </div>

                                <div className="mt-8 text-xs text-slate-400">
                                    <p>ID: {insumo.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </DialogContent >
        </Dialog >
    );
}
