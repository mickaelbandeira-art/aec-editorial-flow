
import { useMemo } from "react";
import { FASES_PRODUCAO } from "@/types/flowrev";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function ProductionTimeline() {
    // Determine current phase based on today's date
    const currentPhaseIndex = useMemo(() => {
        const today = new Date().getDate();

        // Kickoff: Dia 15
        if (today === 15) return 0;

        // Insumos Textuais: 15-25 (exclusive of 25?) Let's assume inclusive ranges roughly
        if (today > 15 && today <= 25) return 1;

        // Big Numbers: 25-01 (End of month or start of next)
        // This is tricky because it crosses months. 
        // If today > 25, it's late month Big Numbers.
        // If today < 9 (start of next month), wait... Production starts at 01.
        // Let's refine:
        // 26-31: Big Numbers
        // 01-09: Produção (includes 01?)

        if (today > 25) return 2; // Late month part of Big Numbers

        if (today >= 1 && today <= 9) return 3; // Produção

        // if today is 10-14? Wait/Preparation or Overflow?
        // Let's default to Kickoff prep if < 15
        return 0;
    }, []);

    return (
        <div className="w-full bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Cronograma de Produção
            </h3>

            <div className="relative flex items-center justify-between w-full">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0"></div>

                {/* Active Line (Progress) - Simplified logic here for visual demo */}
                <div
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-500"
                    style={{ width: `${(currentPhaseIndex / (FASES_PRODUCAO.length - 1)) * 100}%` }}
                ></div>

                {FASES_PRODUCAO.filter(f => f.fase !== 'validacao' && f.fase !== 'concluido').map((fase, index) => {
                    const isActive = index === currentPhaseIndex;
                    const isCompleted = index < currentPhaseIndex;
                    const isPending = index > currentPhaseIndex;

                    return (
                        <div key={fase.fase} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm",
                                    isActive ? "bg-blue-600 border-blue-100 text-white scale-110 shadow-blue-200" :
                                        isCompleted ? "bg-green-500 border-green-100 text-white" :
                                            "bg-white border-slate-200 text-slate-300"
                                )}
                            >
                                <span className="text-lg">{fase.icon}</span>
                            </div>

                            <div className="mt-3 text-center">
                                <span
                                    className={cn(
                                        "block text-xs font-bold transition-colors",
                                        isActive ? "text-blue-700" :
                                            isCompleted ? "text-green-600" :
                                                "text-slate-400"
                                    )}
                                >
                                    {fase.label}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full mt-1 inline-block border border-slate-100">
                                    {fase.dataLimite}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
