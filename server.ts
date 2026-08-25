import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/reactions/simulate", async (req, res) => {
    const { formula1, formula2 } = req.body;
    
    if (!formula1 || !formula2) {
      return res.status(400).json({ error: "Two formulas are required." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Act as a professional chemist. Analyze the potential chemical reaction between ${formula1} and ${formula2}. 
        Provide a step-by-step summary of the reaction mechanism, potential products, and energy changes (exothermic/endothermic).
        Format the response in JSON with the following structure:
        {
          "possible": boolean,
          "equation": "balanced chemical equation string",
          "summary": "overall summary of what happens",
          "steps": ["step 1 description", "step 2 description", ...],
          "conditions": "required temperature, catalyst, or environment",
          "danger": "safety warnings if any"
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to simulate reaction. " + (error.message || "") });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
