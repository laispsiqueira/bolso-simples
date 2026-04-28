import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Extraction Route (Secure Backend)
  app.post("/api/extract", async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName, bankName } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured on server." });
      }

      const genAI = new GoogleGenAI({ apiKey }) as any;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extraia transações deste arquivo (${fileName}). Banco: ${bankName || 'Não especificado'}. 
      Retorne APENAS um JSON array de objetos com campos: [date (ISO), amount (number), description (string), bank (string), type ("INCOME"|"EXPENSE"), category (string)].
      Sempre negativo para gastos e positivo para ganhos.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBase64.split(",")[1] || fileBase64,
            mimeType: mimeType,
          },
        },
      ]);

      const text = result.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Extraction error:", error);
      res.status(500).json({ error: "Falha na extração por IA." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
