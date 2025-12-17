import { useMemo, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { KanbanColumn, Column } from "./KanbanColumn";
import { KanbanCard, KanbanItem } from "./KanbanCard";

// Mock Data
const defaultColumns: Column[] = [
    { id: "todo", title: "Pauta (Backlog)" },
    { id: "in-progress", title: "Em Produção" },
    { id: "review", title: "Revisão" },
    { id: "done", title: "Publicado" },
];

const defaultItems: KanbanItem[] = [
    { id: "1", title: "Artigo sobre IA Generativa no Varejo", type: "Article", priority: "High" },
    { id: "2", title: "Vídeo Tutorial: Novo Portal do Colaborador", type: "Video", priority: "Medium" },
    { id: "3", title: "Post Instagram: Dicas de Segurança", type: "Social", priority: "Low" },
    { id: "4", title: "Campanha de Endomarketing - Q1", type: "Article", priority: "High" },
    { id: "5", title: "Podcast: Entrevista com CEO", type: "Article", priority: "Medium" },
];

// Initial State helper to assign items to columns (just for demo purposes)
const initialItemsMap: Record<string, string> = {
    "1": "todo",
    "2": "todo",
    "3": "in-progress",
    "4": "review",
    "5": "done",
};

export function KanbanBoard() {
    const [columns, setColumns] = useState<Column[]>(defaultColumns);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [items, setItems] = useState<KanbanItem[]>(defaultItems);
    const [itemColumns, setItemColumns] = useState<Record<string, string>>(initialItemsMap);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement before drag starts
            },
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Item") {
            setActiveItem(event.active.data.current.item);
            return;
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveItem = active.data.current?.type === "Item";
        const isOverItem = over.data.current?.type === "Item";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveItem) return;

        // Dragging an item over another item
        if (isActiveItem && isOverItem) {
            const activeContainer = itemColumns[activeId];
            const overContainer = itemColumns[overId];

            // If needed, we could reorder here for visual feedback, 
            // but simpler for now to only change on DragEnd for re-ordering within same column
            // or change column here if crossing boundaries.

            if (activeContainer !== overContainer) {
                setItemColumns((prev) => ({
                    ...prev,
                    [activeId]: overContainer
                }));
            }
        }

        // Dragging an item over a column
        if (isActiveItem && isOverColumn) {
            const activeContainer = itemColumns[activeId];
            const overContainer = overId as string;

            if (activeContainer !== overContainer) {
                setItemColumns((prev) => ({
                    ...prev,
                    [activeId]: overContainer
                }));
            }
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveItem(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        // Handling Column Sort
        if (active.data.current?.type === "Column") {
            setColumns((columns) => {
                const activeIndex = columns.findIndex((col) => col.id === activeId);
                const overIndex = columns.findIndex((col) => col.id === overId);
                return arrayMove(columns, activeIndex, overIndex);
            });
            return;
        }

        // Handling Item Sort within same column is handled visually by onDragOver mostly, 
        // but correct implementation for persistence requires arrayMove on the items array relative to their position in the column.

        // For this simple mock, we are just managing the `itemColumns` map. 
        // Real re-ordering logic would need a more complex state structure (e.g. Columns having an array of item IDs).
    }

    return (
        <div className="flex h-full w-full gap-4 overflow-x-auto p-4 custom-scrollbar">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex gap-6 m-auto">
                    <SortableContext items={columnsId}>
                        {columns.map((col) => {
                            const columnItems = items.filter(item => itemColumns[item.id] === col.id);
                            return (
                                <KanbanColumn
                                    key={col.id}
                                    column={col}
                                    items={columnItems}
                                />
                            );
                        })}
                    </SortableContext>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <KanbanColumn
                                column={activeColumn}
                                items={items.filter(item => itemColumns[item.id] === activeColumn.id)}
                            />
                        )}
                        {activeItem && <KanbanCard item={activeItem} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
