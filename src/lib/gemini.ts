import { GoogleGenAI } from "@google/genai";

let ai: any = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not found in environment.");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const extractTransactions = async (fileBase64: string, mimeType: string, fileName: string, bankName?: string) => {
  try {
    const aiInstance = getAI();
    const prompt = `Extraia transações deste arquivo (${fileName}). Banco: ${bankName || 'Não especificado'}. 
    Retorne APENAS um JSON array de objetos com campos: [date (ISO), amount (number), description (string), bank (string), type ("INCOME"|"EXPENSE"), category (string)].
    Sempre use valores positivos para INCOME (receitas) e negativos para EXPENSE (despesas).`;

    const base64Data = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;

    const response = await aiInstance.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nenhuma resposta da IA.");
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (error: any) {
    console.error("Extraction error:", error);
    throw new Error(error.message || "Erro na extração por IA");
  }
};
