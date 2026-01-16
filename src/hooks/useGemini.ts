import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to interact with Google Gemini API for grammar correction.
 * Uses strict isolation via native fetch to avoid SDK bundle issues.
 */
export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);

    const fixGrammar = async (text: string): Promise<string | null> => {
        setIsLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                toast.error("Erro de Configuração: API Key do Google não encontrada.");
                console.error("VITE_GEMINI_API_KEY missing");
                return null;
            }

            // Clean text checks
            if (!text || text.trim() === '' || text === '<p></p>') {
                toast.warning("Por favor, escreva algo para a IA revisar.");
                return null;
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `
                                    Atue como um editor de texto profissional em Português do Brasil.
                                    Sua tarefa é corrigir a gramática, concordância e pontuação do texto abaixo.
                                    Mantenha o tom original e a formatação HTML se houver (o texto pode ser um fragmento HTML).
                                    Se o texto for HTML, retorne APENAS o HTML corrigido. Não adicione markdown (backticks) ao redor.
                                    Se o texto for simples, retorne apenas o texto corrigido.
                                    
                                    Texto original:
                                    ${text}
                                `
                            }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `Erro ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            let correctedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!correctedText) {
                throw new Error("A IA não retornou nenhuma sugestão.");
            }

            // Sanitize Markdown blocks if present
            correctedText = correctedText
                .replace(/^```html\s*/, '')
                .replace(/^```\s*/, '')
                .replace(/```$/, '')
                .trim();

            toast.success("Texto revisado com sucesso!");
            return correctedText;

        } catch (error: any) {
            console.error("Gemini Error:", error);
            // Show the actual error message to the user for better debugging
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Falha na IA: ${msg}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { fixGrammar, isLoading };
}
