import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="rounded-full bg-destructive/10 p-4 mb-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado.</h1>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Ocorreu um erro inesperado ao renderizar esta página. Tente recarregar ou contate o suporte.
                    </p>

                    <div className="bg-muted p-4 rounded-md text-left text-xs font-mono max-w-2xl mb-6 overflow-auto border w-full">
                        <p className="font-bold text-destructive mb-2">{this.state.error?.toString()}</p>
                        <pre className="text-muted-foreground whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => window.location.reload()}>
                            Recarregar Página
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Ir para Início
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
