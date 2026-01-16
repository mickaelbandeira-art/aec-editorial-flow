
export const geminiService = {
    async generateContent(prompt: string): Promise<string | null> {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("API Key not found in import.meta.env.VITE_GEMINI_API_KEY");
            throw new Error("API Key not configuration. Check .env and vite.config.ts");
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || response.statusText);
            }

            const data = await response.json();

            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                // If no text, check if there was a finishReason like SAFETY
                const finishReason = data.candidates?.[0]?.finishReason;
                if (finishReason) {
                    throw new Error(`Blocked by safety filters: ${finishReason}`);
                }
                throw new Error("Empty response from AI");
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini Service Error:", error);
            throw error; // Propagate error to caller
        }
    },
};
