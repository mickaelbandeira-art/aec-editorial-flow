import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);

        try {
            // 2. ATUALIZAÇÃO: Usamos o gemini-1.5-flash (Versão estável)
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"
            });

            // 3. Execução da chamada conforme a documentação que enviaste
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error: any) {
            console.error("Erro na Chamada da IA:", error);
            // Include specific error details if available
            const errorDetail = error?.message || JSON.stringify(error);
            throw new Error(`Falha na comunicação com o Gemini: ${errorDetail}`);
        }
    },
};