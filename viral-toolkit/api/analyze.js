export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY não configurada" });
  }
  try {
    const { messages } = req.body;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + GROQ_API_KEY,
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
      return res.status(response.status).json({ error: data.error?.message || "Erro" });
    }
    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content: [{ type: "text", text }] });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno" });
  }
}