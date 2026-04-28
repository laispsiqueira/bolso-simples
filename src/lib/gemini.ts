import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const extractTransactions = async (fileBase64: string, mimeType: string) => {
  const prompt = `Extraia transações deste arquivo. Retorne APENAS um JSON array de objetos, onde cada objeto tem os campos exatos: 
  [date (ISO string), amount (number, positivo para recebimentos, negativo para gastos), description (string), bank (string), type (string, "INCOME" ou "EXPENSE"), category (string)].
  Seja preciso com valores e datas. Se não conseguir identificar a categoria, use "Outros".`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: prompt
      },
      {
        inlineData: {
          data: fileBase64.split(",")[1] || fileBase64,
          mimeType: mimeType,
        },
      }
    ],
  });

  const text = response.text || "";
  
  try {
    // Basic sanitization to handle potential markdown blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Erro ao processar resposta da IA.");
  }
};
