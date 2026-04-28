import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // --- API Routes ---

  /**
   * POST /api/audit-proxy
   * Proxies requests to external LLM providers (Anthropic, OpenAI)
   */
  app.post("/api/audit-proxy", async (req, res) => {
    const { apiKey, provider, prompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required" });
    }

    try {
      let answer = "ERROR";

      if (provider === "anthropic") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 10,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) throw new Error(`Anthropic Error: ${response.status}`);
        const data: any = await response.json();
        answer = data.content[0].text.trim().toUpperCase();
      } else if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 10,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) throw new Error(`OpenAI Error: ${response.status}`);
        const data: any = await response.json();
        answer = data.choices[0].message.content.trim().toUpperCase();
      }

      res.json({ answer });

    } catch (error: any) {
      console.error(`Proxy Error calling ${provider}:`, error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---
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
