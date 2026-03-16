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
            case 'aprovado': return 'bg-green-400 text-slate-900';
            case 'atrasado': return 'bg-red-500 text-white'; 
            case 'enviado': return 'bg-purple-400 text-slate-900';
            case 'em_analise': return 'bg-yellow-400 text-slate-900';
            case 'ajuste_solicitado': return 'bg-orange-400 text-slate-900';
            case 'em_preenchimento': return 'bg-blue-400 text-slate-900';
            default: return 'bg-slate-200 text-slate-900';
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

    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

    return (
        <div className="flex flex-col h-full bg-background p-6">
            <div className="flex items-center justify-between mb-8 border-b-4 border-slate-900 pb-6">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Calendário Editorial</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Visualize as entregas e prazos de todos os produtos.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-none border-2 border-slate-900 bg-white shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-none hover:bg-slate-900 hover:text-white transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-4 font-black uppercase tracking-widest min-w-[160px] text-center text-slate-900">
                            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-none hover:bg-slate-900 hover:text-white transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 rounded-none border-2 border-slate-900 bg-slate-200 shadow-[6px_6px_0_0_rgba(15,23,42,1)] overflow-hidden flex flex-col mb-4">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b-2 border-slate-900 bg-slate-900">
                    {weekDays.map(day => (
                        <div key={day} className="p-4 text-center text-xs font-black tracking-widest uppercase text-white">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[2px]">
                    {/* Placeholder for empty start days could be added here if needed for alignment */}
                    {/* For strict alignment, we'd need to calculate startDayOfWeek padding */}
                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-slate-100 min-h-[120px] opacity-70" />
                    ))}

                    {daysInMonth.map((date, i) => {
                        const dayInsumos = getInsumosForDay(date);
                        const isToday = isSameDay(date, new Date());

                        return (
                            <div key={i} className={cn(
                                "bg-white p-3 min-h-[120px] transition-colors relative group",
                                isToday && "bg-yellow-50"
                            )}>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={cn(
                                        "text-sm font-black w-8 h-8 flex items-center justify-center border-2 border-transparent transition-all",
                                        isToday ? "bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)]" : "text-slate-900"
                                    )}>
                                        {format(date, 'd')}
                                    </span>
                                    {dayInsumos.length > 0 && (
                                        <Badge className="text-[10px] h-6 px-2 rounded-none border-2 border-slate-900 bg-yellow-300 text-slate-900 font-black shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:bg-yellow-400">
                                            {dayInsumos.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-1 styled-scrollbar">
                                    {dayInsumos.map(insumo => (
                                        <HoverCard key={insumo.id}>
                                            <HoverCardTrigger asChild>
                                                <div className={cn(
                                                    "text-[10px] px-2 py-1.5 rounded-none cursor-pointer truncate font-bold border-2 border-slate-900 uppercase tracking-tighter shadow-[2px_2px_0_0_rgba(15,23,42,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_0_rgba(15,23,42,1)] transition-all mb-1",
                                                    getStatusColor(insumo.status)
                                                )}>
                                                    [{insumo.edicao?.produto?.slug}] {insumo.tipo_insumo?.nome}
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80 rounded-none border-4 border-slate-900 p-0 shadow-[8px_8px_0_0_rgba(15,23,42,1)] bg-white overflow-hidden">
                                                <div className="bg-slate-900 p-3 pb-4">
                                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">
                                                        {insumo.tipo_insumo?.nome}
                                                    </h4>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Produto</span>
                                                        <span className="text-xs font-black text-slate-900 uppercase">{insumo.edicao?.produto?.nome}</span>
                                                    </div>
                                                    <div className="flex justify-between border-t-2 border-slate-100 pt-4">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Prazo</span>
                                                            <span className="text-xs font-black text-slate-900">{format(date, 'dd/MM/yyyy')}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Status</span>
                                                            <span className="text-xs font-black text-slate-900 uppercase">
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
