
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
        <div className="w-full bg-white rounded-none border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] p-6 mb-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5" /> CRONOGRAMA DE PRODUÇÃO
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
                                    "w-12 h-12 flex items-center justify-center border-2 border-slate-900 transition-all duration-300 rounded-none shadow-[2px_2px_0_0_rgba(15,23,42,1)]",
                                    isActive ? "bg-slate-900 text-white scale-110 translate-y-[-4px] shadow-[4px_4px_0_0_rgba(15,23,42,1)]" :
                                        isCompleted ? "bg-green-400 text-slate-900" :
                                            "bg-white text-slate-400"
                                )}
                            >
                                <span className="text-lg">{fase.icon}</span>
                            </div>

                            <div className="mt-4 text-center">
                                <span
                                    className={cn(
                                        "block text-[10px] font-black uppercase tracking-wider transition-colors",
                                        isActive ? "text-slate-900" :
                                            isCompleted ? "text-green-700" :
                                                "text-slate-400"
                                    )}
                                >
                                    {fase.label}
                                </span>
                                <span className="text-[9px] text-slate-900 font-bold bg-yellow-300 px-2 py-0.5 rounded-none mt-2 inline-block border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] uppercase tracking-wider">
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
