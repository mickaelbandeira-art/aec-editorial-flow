import { useMemo } from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDroppable,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { Insumo } from "@/types/flowrev";
import { ProductInsumoCard } from "./ProductInsumoCard";
import { createPortal } from "react-dom";
import { useState } from "react";

interface ProductInsumosCalendarProps {
    insumos: Insumo[];
    onUpdateDate: (insumoId: string, newDate: Date) => void;
    onInsumoClick: (insumo: Insumo) => void;
}

// Droppable Day Cell
function CalendarDay({ day, insumos, isCurrentMonth, onClick }: { day: Date, insumos: Insumo[], isCurrentMonth: boolean, onClick: (i: Insumo) => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(), // The ID of the drop zone is the date string
    });

    const isCurrentDay = isToday(day);

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[120px] p-2 border-r-2 border-b-2 border-slate-900 transition-colors 
                ${!isCurrentMonth ? 'bg-slate-100/50' : 'bg-white'} 
                ${isOver ? 'bg-primary/20' : ''}
                ${isCurrentDay ? 'bg-primary/10' : ''}
            `}
        >
            <div className={`text-right text-xs mb-2 font-black italic uppercase tracking-tighter ${!isCurrentMonth ? 'text-slate-400' : isCurrentDay ? 'text-primary' : 'text-slate-900'}`}>
                {format(day, 'd')}
                {isCurrentDay && <span className="ml-1 text-[8px]">(Hoje)</span>}
            </div>

            <div className="space-y-2">
                {insumos.map(insumo => (
                    <ProductInsumoCard
                        key={insumo.id}
                        insumo={insumo}
                        tipo={insumo.tipo_insumo}
                        onClick={() => onClick(insumo)}
                    />
                ))}
            </div>
        </div>
    );
}

export function ProductInsumosCalendar({ insumos, onUpdateDate, onInsumoClick }: ProductInsumosCalendarProps) {
    const [activeItem, setActiveItem] = useState<Insumo | null>(null);

    const currentDate = new Date(); // You might want to make this stateful to navigate months

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(new Date()); // Fix: Use static date or state
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: ptBR });
        const endDate = endOfWeek(monthEnd, { locale: ptBR });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, []); // Empty dependency since currentDate is static for now

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 3 }
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Item") {
            setActiveItem(event.active.data.current.item as Insumo);
        }
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        // over.id is the date ISO string
        const newDate = new Date(over.id as string);
        const activeInsumoId = active.id as string;

        // Check if date actually changed
        const activeInsumo = insumos.find(i => i.id === activeInsumoId);
        if (activeInsumo?.data_limite && isSameDay(new Date(activeInsumo.data_limite), newDate)) {
            return;
        }

        onUpdateDate(activeInsumoId, newDate);
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex flex-col h-full bg-white rounded-none border-4 border-slate-900 shadow-[16px_16px_0_0_rgba(15,23,42,1)] overflow-hidden">
                {/* Calendar Header Row */}
                <div className="grid grid-cols-7 border-b-4 border-slate-900 bg-slate-900">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                    {calendarDays.map(day => {
                        // Filter insumos for this day
                        const dayInsumos = insumos.filter(i =>
                            i.data_limite && isSameDay(new Date(i.data_limite), day)
                        );

                        return (
                            <CalendarDay
                                key={day.toISOString()}
                                day={day}
                                insumos={dayInsumos}
                                isCurrentMonth={isSameMonth(day, currentDate)}
                                onClick={onInsumoClick}
                            />
                        );
                    })}
                </div>
            </div>

            {createPortal(
                <DragOverlay>
                    {activeItem && (
                        <div className="w-[200px]">
                            <ProductInsumoCard insumo={activeItem} tipo={activeItem.tipo_insumo} />
                        </div>
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
