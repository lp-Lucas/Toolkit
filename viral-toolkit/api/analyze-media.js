// api/analyze-media.js — Proxy para análise de vídeo e thumbnail (base64)
// O frontend envia { prompt, mimeType, base64 } e recebe { text }
// Limite do Vercel: body até 4.5 MB por padrão. Para vídeos maiores,
// o usuário pode ajustar em vercel.json (bodyParser.sizeLimit).

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada no Vercel" });

  const { prompt, mimeType, base64, urlOnly } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Campo 'prompt' obrigatório" });

  // Monta as parts: se tiver base64, manda inline. Se for URL-only, manda só texto.
  const parts = base64
    ? [{ inlineData: { mimeType: mimeType || "video/mp4", data: base64 } }, { text: prompt }]
    : [{ text: prompt }];

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: "Gemini API error", details: err.slice(0, 200) });
    }

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
