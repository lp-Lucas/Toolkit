// api/analyze.js
// Vercel Serverless Function — proxy para Google Gemini (grátis)
// Suporta 2 modelos: gemini-2.5-flash (preciso) e gemini-2.0-flash (rápido)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY nao configurada" });
  }

  try {
    const { images, prompt, model } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem recebida" });
    }

    const parts = [];
    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      const base64Data = dataUrl.split(",")[1];
      if (!base64Data) continue;
      const mimeMatch = dataUrl.match(/data:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }
    parts.push({ text: prompt || "Descreva as imagens" });

    const modelId = model === "fast" ? "gemini-2.0-flash" : "gemini-2.5-flash";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + GEMINI_API_KEY;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
      })
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: "Gemini erro: " + (data.error?.message || JSON.stringify(data).slice(0, 200))
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini retornou vazio. Tente novamente."
      });
    }

    return res.status(200).json({ content: [{ type: "text", text: text }] });

  } catch (error) {
    return res.status(500).json({ error: "Erro servidor: " + error.message });
  }
}
