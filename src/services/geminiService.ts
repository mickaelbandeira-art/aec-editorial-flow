import { supabase } from "@/integrations/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa a SDK do Gemini no Cliente usando a chave da variável de ambiente (precisa ser injetada)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBlkJpU8Z3nyUWHfP5DwcdC5vyIe4-8A4M";
const genAI = new GoogleGenerativeAI(apiKey);interface GeminiResponse {
    success?: boolean;
    text?: string;
    error?: string;
}

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        try {
            console.log("Gemini Service: Calling Edge Function 'fix-grammar'...");

            const { data, error } = await supabase.functions.invoke<GeminiResponse>('fix-grammar', {
                body: { prompt },
            });

            if (error) {
                console.error("Supabase Edge Function Error:", error);
                throw new Error(`Erro na função Edge: ${error.message || error}`);
            }

            // Handle successful HTTP response but failed logic (tunneled error)
            if (data && data.success === false) {
                console.error("Edge Function Logic Error:", data.error);
                throw new Error(`Erro na IA: ${data.error || "Erro desconhecido"}`);
            }

            if (!data || !data.text) {
                console.error("Invalid response from Edge Function:", data);
                throw new Error("Resposta inválida da IA.");
            }

            return data.text;

        } catch (error) {
            console.error("Gemini Service Error:", error);
            // Propagate the error so useGemini.ts can handle it
            throw error instanceof Error ? error : new Error(String(error));
        }
    },

    async generateDraft(titulo: string, tipo: string, observacoes: string = ""): Promise<string | null> {
        try {
            console.log("Gemini Service: Generating draft using Client SDK...");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Atue como um analista de dados e redator sênior de um fluxo editorial corporativo (flowrev).
                Sua tarefa é criar um primeiro rascunho completo para um insumo de edição que será revisado por um humano.
                
                O título do insumo é: "${titulo}".
                O tipo do insumo é (o formato principal exigido): "${tipo}".
                As observações ou diretrizes passadas pelos gestores são: "${observacoes || "Nenhuma observação específica foi passada."}".

                Você deve retornar a resposta formatada em HTML válido, pronto para ser jogado num editor WYSIWYG (como Tiptap/ProseMirror). 
                Use boas estruturas: <p>, <ul>, <li>, <strong>, <h2>.
                NÃO retorne a marcação markdown de código (\`\`\`html), retorne APENAS o HTML cru e estruturado.
                Invente ou coloque placeholders "[PREENCHA AQUI]" onde houverem dados numéricos não fornecidos, mas crie um parágrafo inicial descritivo, criativo e profissional baseado no Título.
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText) {
                 throw new Error("A IA não retornou nenhuma sugestão.");
            }

            // Clean up backticks if Gemini accidentally includes them
            const sanitizedText = responseText
                .replace(/^```html\s*/i, '')
                .replace(/^```\s*/, '')
                .replace(/```$/, '')
                .trim();

            return sanitizedText;

        } catch (error) {
           console.error("Gemini Service Error (generateDraft):", error);
           throw error instanceof Error ? error : new Error(String(error));
        }
    }
};
