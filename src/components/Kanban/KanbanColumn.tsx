import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { KanbanCard, KanbanItem } from "./KanbanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Column {
    id: string;
    title: string;
}

interface KanbanColumnProps {
    column: Column;
    items: KanbanItem[];
}

export function KanbanColumn({ column, items }: KanbanColumnProps) {
    const itemsIds = useMemo(() => items.map((item) => item.id), [items]);

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

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[350px] h-[600px] max-h-[600px] rounded-xl flex flex-col bg-background/50 opacity-50 border-2 border-primary/20"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-[350px] h-[600px] max-h-[600px] rounded-xl flex flex-col bg-muted/30 border border-border"
        >
            <CardHeader className="p-4 border-b border-border bg-card/50 rounded-t-xl sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        {column.title}
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-normal">
                            {items.length}
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-2">
                <div className="flex flex-col gap-3 p-2">
                    <SortableContext items={itemsIds}>
                        {items.map((item) => (
                            <KanbanCard key={item.id} item={item} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
}
