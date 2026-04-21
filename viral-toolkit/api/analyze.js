// api/analyze.js
// Vercel Serverless Function — proxy para Groq API (grátis)
// Usa Llama 4 Scout com visão (analisa imagens)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "GROQ_API_KEY não configurada. Vá em Settings > Environment Variables no Vercel.",
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Campo 'messages' é obrigatório." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 1024,
        temperature: 0.3,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || "Erro na API Groq",
      });
    }

    // Converte formato OpenAI → formato que o frontend espera
    const text = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      content: [{ type: "text", text }],
    });
  } catch (error) {
    console.error("Erro no proxy:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
