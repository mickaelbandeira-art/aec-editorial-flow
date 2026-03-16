import { useState } from 'react';
import { toast } from 'sonner';
import { geminiService } from '../services/geminiService';

/**
 * Hook to interact with Google Gemini API for grammar correction.
 * Uses strict isolation via native fetch to avoid SDK bundle issues.
 */
export function useGemini() {
    const [isLoading, setIsLoading] = useState(false);

    const fixGrammar = async (text: string): Promise<string | null> => {
        setIsLoading(true);
        try {
            // Clean text checks
            if (!text || text.trim() === '' || text === '<p></p>') {
                toast.warning("Por favor, escreva algo para a IA revisar.");
                return null;
            }

            const prompt = `
                Atue como um editor de texto profissional em Português do Brasil.
                Sua tarefa é corrigir a gramática, concordância e pontuação do texto abaixo.
                Mantenha o tom original e a formatação HTML se houver (o texto pode ser um fragmento HTML).
                Se o texto for HTML, retorne APENAS o HTML corrigido. Não adicione markdown (backticks) ao redor.
                Se o texto for simples, retorne apenas o texto corrigido.
                
                Texto original:
                ${text}
            `;

            const correctedText = await geminiService.generateContent(prompt);

            if (!correctedText) {
                throw new Error("A IA não retornou nenhuma sugestão.");
            }

            // Sanitize Markdown blocks if present
            const sanitizedText = correctedText
                .replace(/^```html\s*/, '')
                .replace(/^```\s*/, '')
                .replace(/```$/, '')
                .trim();

            toast.success("Texto revisado com sucesso!");
            return sanitizedText;

        } catch (error) {
            console.error("Gemini Error:", error);
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            toast.error(`Falha na IA: ${msg}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const generateDraft = async (titulo: string, tipo: string, observacoes: string = ""): Promise<string | null> => {
        setIsLoading(true);
        const toastId = toast.loading("Gerando rascunho mágico com a IA... ✨");
        try {
            const draftHtml = await geminiService.generateDraft(titulo, tipo, observacoes);
            
            if (draftHtml) {
               toast.success("Rascunho gerado com sucesso!", { id: toastId });
               return draftHtml;
            }
            throw new Error("Falha na geração");
        } catch (error) {
            console.error("Generate Draft Error:", error);
            const msg = error instanceof Error ? error.message : "Erro na geração";
            toast.error(`Falha: ${msg}`, { id: toastId });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { fixGrammar, generateDraft, isLoading };
}
