import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);

        try {
            // 2. ATUALIZAÇÃO: Usamos o gemini-2.5-flash (O sucessor estável do 1.5)
            // Em 2026, o 1.5-flash já não é aceite.
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            });

            // 3. Execução da chamada conforme a documentação que enviaste
            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error: any) {
            // Diagnóstico amigável para 2026
            if (error.message && error.message.includes("404")) {
                console.error("ERRO: O modelo solicitado está obsoleto ou o ID mudou.");
            }
            console.error("Erro na Chamada da IA:", error);
            throw new Error("Falha na comunicação com o Gemini 2.5.");
        }
    },
};