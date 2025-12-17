import { KanbanBoard } from "@/components/Kanban/KanbanBoard";

export default function ProductionLine() {
    return (
        <div className="flex flex-col h-full bg-background">
            <div className="flex-1 w-full h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 overflow-hidden">
                <div className="mb-8 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Esteira de Produção</h2>
                        <p className="text-muted-foreground">
                            Acompanhe o fluxo de produção de conteúdo em tempo real.
                        </p>
                    </div>
                </div>
                <div className="h-[calc(100%-80px)] rounded-md border border-dashed border-border bg-card/50">
                    <KanbanBoard />
                </div>
            </div>
        </div>
    );
}
