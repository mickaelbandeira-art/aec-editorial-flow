import { supabase } from "@/integrations/supabase/client";

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        try {
            console.log("Gemini Service: Calling Edge Function 'fix-grammar'...");

            const { data, error } = await supabase.functions.invoke('fix-grammar', {
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

        } catch (error: any) {
            console.error("Gemini Service Error:", error);
            // Propagate the error so useGemini.ts can handle it
            throw error;
        }
    },
};