// api/analyze.js
// Vercel Serverless Function — proxy para Google Gemini (grátis)
// Usa Gemini 2.5 Flash com visão (analisa múltiplas imagens)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY não configurada. Vá em Settings > Environment Variables no Vercel.",
    });
  }

  try {
    const { images, prompt } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "Campo 'images' é obrigatório." });
    }

    // Montar as parts no formato Gemini
    const parts = [];

    images.forEach((dataUrl, i) => {
      // dataUrl = "data:image/jpeg;base64,/9j/4AAQ..."
      const base64Data = dataUrl.split(",")[1];
      const mimeType = dataUrl.match(/data:(.*?);/)?.[1] || "image/jpeg";

      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
      parts.push({
        text: `[Frame ${i + 1} de ${images.length}]`,
      });
    });

    // Adicionar o prompt no final
    parts.push({ text: prompt });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || "Erro na API Gemini",
      });
    }

    // Extrair texto da resposta
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "";

    console.log("Gemini raw response:", JSON.stringify(data).slice(0, 500));
return res.status(200).json({
  content: [{ type: "text", text }],
  debug: JSON.stringify(data).slice(0, 300),
});
  } catch (error) {
    console.error("Erro no proxy:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
