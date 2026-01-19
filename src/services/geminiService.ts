import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error("Gemini Error:", error);
            throw new Error("Falha ao comunicar com o Gemini. Verifica a tua conexão ou API Key.");
        }
    },
};