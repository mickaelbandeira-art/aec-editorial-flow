
export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        // CORREÇÃO: Usamos import.meta.env e o prefixo VITE_
        // Certifica-te que na Vercel o nome é VITE_GEMINI_API_KEY
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key não encontrada. Verifique VITE_GEMINI_API_KEY na Vercel.");
            throw new Error("Configuração da API ausente.");
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || response.statusText);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (error) {
            console.error("Gemini Service Error:", error);
            throw error;
        }
    },
};
