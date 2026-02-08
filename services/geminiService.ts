import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractDataFromPDF = async (base64Pdf: string): Promise<Transaction[]> => {
  try {
    const prompt = `
      You are an expert financial data analyst. 
      Analyze the attached bank statement or credit card invoice PDF.
      
      Extract all transactions into a structured JSON list.
      
      Rules:
      1. Normalize the date to YYYY-MM-DD format.
      2. Clean the description (remove extra codes, weird spacing).
      3. Ensure 'amount' is a number. If it is an expense, ensure it is positive number, but mark type as 'debit'. If it is a payment/income, mark type as 'credit'.
      4. Auto-classify the category based on the description (e.g., 'Uber' -> 'Transport', 'Starbucks' -> 'Food').
      5. Ignore page headers, footers, and balance summaries. Only extract individual line items.
      6. Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['debit', 'credit'] }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No data returned from AI");
    }

    const rawData = JSON.parse(response.text);
    
    // Add IDs and ensure consistency
    return rawData.map((item: any, index: number) => ({
      id: `txn-${Date.now()}-${index}`,
      date: item.date,
      description: item.description,
      amount: Math.abs(item.amount), // Normalize to absolute value
      category: item.category || 'Uncategorized',
      type: item.type || 'debit'
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Falha ao processar o PDF. Certifique-se de que é um extrato válido.");
  }
};