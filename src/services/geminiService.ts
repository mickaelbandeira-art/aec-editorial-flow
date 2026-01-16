// src/services/geminiService.ts

export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) throw new Error("API Key missing");

        try {
            const response = await fetch(
                // MUDANÇA AQUI: Alterado de 2.0-flash para 1.5-flash
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                // Se o erro for quota (429), damos uma mensagem melhor
                if (response.status === 429) {
                    throw new Error("Limite da API atingido. Tente novamente em instantes ou mude para o plano pago.");
                }
                throw new Error(errorData.error?.message || "Erro na IA");
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (error) {
            console.error("Gemini Error:", error);
            throw error;
        }
    },
};