import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null, errorInfo: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "40px", fontFamily: "system-ui, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "24px", marginBottom: "20px", color: "#e11d48" }}>Something went wrong</h1>
                    <div style={{ padding: "20px", background: "#f1f5f9", borderRadius: "8px", overflow: "auto" }}>
                        <p style={{ fontWeight: "bold", marginBottom: "10px", color: "#0f172a" }}>{this.state.error?.toString()}</p>
                        <pre style={{ fontSize: "12px", color: "#475569" }}>
                            {this.state.error?.stack}
                        </pre>
                        {this.state.errorInfo && (
                            <pre style={{ marginTop: "20px", fontSize: "12px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
                                Component Stack:
                                {this.state.errorInfo.componentStack}
                            </pre>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: "20px", padding: "10px 20px", background: "#0f172a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
