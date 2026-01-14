import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { ProductInsumoCard } from "./ProductInsumoCard";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Insumo, InsumoStatus } from "@/types/flowrev";
import { Plus, X } from "lucide-react";
import { useCreateInsumo, useTiposInsumos } from "@/hooks/useFlowrev";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Column {
    id: InsumoStatus;
    title: string;
}

interface ProductKanbanColumnProps {
    column: Column;
    items: Insumo[];
    onItemClick?: (insumo: Insumo) => void;
    edicaoId?: string;
}

export function ProductKanbanColumn({ column, items, onItemClick, edicaoId }: ProductKanbanColumnProps) {
    const itemsIds = useMemo(() => items.map((item) => item.id), [items]);
    const { mutate: createInsumo, isPending: isCreating } = useCreateInsumo();
    const { data: tiposInsumo } = useTiposInsumos();

    // Quick Add State
    const [isAdding, setIsAdding] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [selectedTypeId, setSelectedTypeId] = useState<string>("");

    const { setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleAddCard = () => {
        // Use selected type or fallback to the first available if not selected
        const typeToUseId = selectedTypeId || tiposInsumo?.[0]?.id;
        const typeToUseObj = tiposInsumo?.find(t => t.id === typeToUseId);

        // If user didn't type a title, use the Type Name as the title
        const finalTitle = newCardTitle.trim() || typeToUseObj?.nome;

        if (!finalTitle) {
            // Should theoretically not happen if types are loaded, but safety first
            return;
        }

        if (!edicaoId) {
            toast.error("Edição não identificada.");
            return;
        }

        createInsumo({
            titulo: finalTitle,
            edicaoId: edicaoId,
            status: column.id,
            tipoInsumoId: typeToUseId
        }, {
            onSuccess: () => {
                toast.success("Cartão criado!");
                setNewCardTitle("");
                // setSelectedTypeId(""); // Optional reset
            },
            onError: () => {
                toast.error("Erro ao criar cartão.");
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddCard();
        }
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] h-full rounded-xl flex flex-col bg-background/50 opacity-50 border-2 border-primary/20"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            id={column.id}
            className={`column min-w-[280px] w-[300px] h-full rounded-xl flex flex-col border border-slate-200 bg-slate-50 p-2`}
        >
            <CardHeader className="p-3 pb-2 bg-transparent border-none">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center justify-between w-full">
                        {column.title}
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold border border-transparent">
                            {items.length}
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 px-2">
                <div className="flex flex-col gap-2 pb-2">
                    <SortableContext items={itemsIds}>
                        {items.map((item) => (
                            <ProductInsumoCard
                                key={item.id}
                                insumo={item}
                                tipo={item.tipo_insumo}
                                onClick={() => onItemClick?.(item)}
                            />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>

            {edicaoId && (
                <div className="px-2 pb-2 pt-1">
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 w-full text-left text-slate-500 hover:bg-slate-200 p-2 rounded-lg text-sm transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Adicionar cartão</span>
                        </button>
                    ) : (
                        <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
                            <div className="mb-2">
                                <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                                    <SelectTrigger className="h-7 text-xs w-full mb-2">
                                        <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposInsumo?.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id}>
                                                {tipo.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <textarea
                                    autoFocus
                                    className="w-full text-sm resize-none border-none focus:ring-0 p-0 placeholder:text-slate-400 min-h-[60px]"
                                    placeholder="Insira um título para este cartão..."
                                    value={newCardTitle}
                                    onChange={e => setNewCardTitle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <Button
                                    size="sm"
                                    className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleAddCard}
                                    disabled={isCreating}
                                >
                                    {isCreating ? "Adicionando..." : "Adicionar cartão"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100"
                                    onClick={() => setIsAdding(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
