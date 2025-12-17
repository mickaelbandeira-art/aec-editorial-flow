import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Paperclip, Image as ImageIcon, FileText, Send, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

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

    if (!insumo) return null;

    const handleSave = () => {
        onSave({
            id: insumo.id,
            status,
            conteudo_texto: texto,
            observacoes: obs,
        });
        onOpenChange(false);
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
                        <Select value={status} onValueChange={(v) => setStatus(v as InsumoStatus)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                                <SelectItem value="em_preenchimento">Em Preenchimento</SelectItem>
                                <SelectItem value="enviado">Enviado</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="ajuste_solicitado">Ajuste Solicitado</SelectItem>
                                <SelectItem value="aprovado">Aprovado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col border-r h-full overflow-hidden">
                        <Tabs defaultValue="conteudo" className="flex-1 flex flex-col">
                            <div className="px-6 pt-4">
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="conteudo">Conteúdo Textual</TabsTrigger>
                                    <TabsTrigger value="anexos">Anexos & Mídia</TabsTrigger>
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
                                        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/30">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">Upload de Imagens</h3>
                                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                                Arraste ou clique para selecionar. Legenda obrigatória.
                                            </p>
                                            <Button variant="outline">Selecionar Arquivos</Button>
                                        </div>

                                        <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/30">
                                            <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">Upload de PDF</h3>
                                            <Button variant="outline">Selecionar PDF</Button>
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
                                </div>

                                {/* Placeholder for history log */}
                                <div className="pt-4 border-t">
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-3">HISTÓRICO RECENTE</h4>
                                    <div className="space-y-3">
                                        <div className="flex gap-2 text-xs">
                                            <div className="mt-0.5"><Clock className="w-3 h-3 text-muted-foreground" /></div>
                                            <div>
                                                <span className="font-medium">João Silva</span> mudou status para <span className="text-blue-500">Em Preenchimento</span>
                                                <div className="text-[10px] text-muted-foreground">Há 2 horas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-card z-10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
