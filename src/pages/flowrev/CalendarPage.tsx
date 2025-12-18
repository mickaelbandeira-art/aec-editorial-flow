import { useAllInsumos } from "@/hooks/useFlowrev";
import { Insumo } from "@/types/flowrev";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { data: allData, isLoading } = useAllInsumos();

    const insumos = allData?.insumos || [];

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const getInsumosForDay = (date: Date) => {
        return insumos.filter(insumo => {
            if (!insumo.data_limite) return false;
            // Adjust for timezone if necessary, but assuming ISO string comparison works for now
            // Simulating deadline check correctly requires parsing
            return isSameDay(new Date(insumo.data_limite), date);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aprovado': return 'bg-green-500 hover:bg-green-600';
            case 'atrasado': return 'bg-red-500 hover:bg-red-600'; // Custom logic needed for this
            case 'enviado': return 'bg-purple-500 hover:bg-purple-600';
            case 'em_analise': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'ajuste_solicitado': return 'bg-orange-500 hover:bg-orange-600';
            default: return 'bg-slate-500 hover:bg-slate-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'aprovado': return 'Aprovado';
            case 'enviado': return 'Enviado';
            case 'em_analise': return 'Em Análise';
            case 'ajuste_solicitado': return 'Ajuste';
            case 'nao_iniciado': return 'Não Iniciado';
            case 'em_preenchimento': return 'Em Andamento';
            default: return status;
        }
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendário Editorial</h2>
                    <p className="text-muted-foreground">
                        Visualize as entregas e prazos de todos os produtos.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-md border bg-card">
                        <Button variant="ghost" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 font-semibold min-w-[140px] text-center capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b bg-muted/50">
                    {weekDays.map(day => (
                        <div key={day} className="p-4 text-center text-sm font-semibold text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-muted/20 gap-[1px]">
                    {/* Placeholder for empty start days could be added here if needed for alignment */}
                    {/* For strict alignment, we'd need to calculate startDayOfWeek padding */}
                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-background min-h-[120px] opacity-50" />
                    ))}

                    {daysInMonth.map((date, i) => {
                        const dayInsumos = getInsumosForDay(date);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div key={i} className={cn(
                                "bg-background p-3 min-h-[120px] border-t border-l transition-colors hover:bg-accent/5",
                                isToday && "bg-accent/10"
                            )}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {format(date, 'd')}
                                    </span>
                                    {dayInsumos.length > 0 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                            {dayInsumos.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                                    {dayInsumos.map(insumo => (
                                        <HoverCard key={insumo.id}>
                                            <HoverCardTrigger asChild>
                                                <div className={cn(
                                                    "text-[10px] px-2 py-1 rounded cursor-pointer truncate text-white font-medium shadow-sm transition-all hover:scale-105",
                                                    getStatusColor(insumo.status)
                                                )}>
                                                    [{insumo.edicao?.produto?.slug}] {insumo.tipo_insumo?.nome}
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80">
                                                <div className="flex justify-between space-x-4">
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-semibold">
                                                            {insumo.tipo_insumo?.nome}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {insumo.edicao?.produto?.nome} - {format(date, 'dd/MM/yyyy')}
                                                        </p>
                                                        <div className="flex items-center pt-2">
                                                            <CalendarIcon className="mr-2 h-3 w-3 opacity-70" />
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                {getStatusLabel(insumo.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
