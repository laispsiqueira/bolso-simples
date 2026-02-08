import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractDataFromPDF = async (base64Pdf: string, fileId: string): Promise<Transaction[]> => {
  try {
    const prompt = `
      Você é um especialista em análise de dados financeiros.
      Analise o extrato bancário ou fatura de cartão de crédito em PDF anexado.
      
      Tarefas:
      1. Identifique o nome do BANCO ou Instituição Financeira (ex: Nubank, Itaú, Bradesco, Santander, Inter, etc) no cabeçalho.
      2. Extraia todas as transações para uma lista JSON estruturada.
      
      Regras de Extração:
      1. Normalize a data para o formato YYYY-MM-DD.
      2. Limpe a descrição (remova códigos extras, espaçamento estranho, "PARC 01/02").
      3. Certifique-se de que 'amount' é um número.
      4. Classifique automaticamente a categoria com base na descrição usando APENAS estas categorias: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Compras', 'Serviços', 'Investimento', 'Renda', 'Outros'].
      5. Se for uma despesa/saída, marque 'type' como 'debit'. Se for pagamento recebido/depósito, marque como 'credit'.
      6. Ignore saldos iniciais, finais e cabeçalhos de página. Extraia apenas os itens de linha.
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
          type: Type.OBJECT,
          properties: {
            bankName: { type: Type.STRING, description: "Nome do banco identificado" },
            transactions: {
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
        }
      }
    });

    if (!response.text) {
      throw new Error("No data returned from AI");
    }

    const rawData = JSON.parse(response.text);
    const bankName = rawData.bankName || "Banco Desconhecido";
    
    // Add IDs and ensure consistency
    return rawData.transactions.map((item: any, index: number) => ({
      id: `txn-${Date.now()}-${index}`,
      date: item.date,
      description: item.description,
      amount: Math.abs(item.amount), // Normalize to absolute value
      category: item.category || 'Outros',
      type: item.type || 'debit',
      bank: bankName,
      fileId: fileId
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Falha ao processar o PDF. Certifique-se de que é um extrato válido.");
  }
};