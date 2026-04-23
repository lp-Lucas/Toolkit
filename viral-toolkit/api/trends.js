// api/trends.js — Vercel Serverless Function
// Usa Gemini 2.0 Flash com googleSearch grounding para buscar tendências REAIS

const NICHES = {
  tech: "tecnologia, inteligência artificial, programação, startups, gadgets",
  entertainment: "entretenimento, séries, música, cinema, memes, cultura pop",
  business: "negócios, empreendedorismo, marketing digital, vendas, renda extra",
  health: "saúde, fitness, musculação, bem-estar, saúde mental, nutrição",
  lifestyle: "lifestyle, produtividade, desenvolvimento pessoal, viagens, moda",
  education: "educação, cursos online, aprendizado, carreira, concursos",
  gaming: "games, jogos, esports, streaming, twitch, youtube gaming",
  food: "gastronomia, receitas, culinária, restaurantes, street food",
};

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "Twitter/X", "LinkedIn", "Multiplataforma"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { niche = "tech" } = req.query;
  const nicheKeywords = NICHES[niche] || NICHES.tech;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const prompt = `Você é um especialista em tendências virais para criadores de conteúdo brasileiros.

Data e hora atual: ${dateStr}

Use a busca na web para encontrar as TENDÊNCIAS REAIS E ATUAIS do nicho: ${nicheKeywords}

Busque especificamente:
1. Google Trends Brasil — o que está sendo mais pesquisado AGORA neste nicho
2. Notícias das últimas 24-72 horas que estão gerando buzz neste nicho
3. Vídeos e formatos viralizando no YouTube e TikTok neste nicho
4. Hashtags e tópicos em alta no Instagram e Twitter/X

IMPORTANTE: Use dados REAIS da busca. Não invente tendências. Se não encontrar algo, coloque o que encontrou de mais relevante.

Responda SOMENTE com JSON válido, sem markdown, sem blocos de código, sem explicações:
{
  "niche": "${niche}",
  "updatedAt": "${now.toISOString()}",
  "summary": "frase de 1 linha resumindo o momento atual do nicho (máx 120 chars)",
  "heatScore": <número 0-100 indicando aquecimento geral>,
  "trends": [
    {
      "id": "trend_${niche}_1",
      "topic": "Nome do trend (máx 55 chars)",
      "description": "Por que está bombando agora (máx 140 chars)",
      "platforms": ["lista de plataformas onde está viral: ${PLATFORMS.join(", ")}"],
      "category": "uma categoria: Google Trends | Notícia | Vídeo Viral | Hashtag | Formato",
      "heat": <número 0-100>,
      "growth": "+XXX%",
      "timing": "AGORA | SUBINDO | ESTÁVEL",
      "hook": "Hook/gancho pronto para usar neste trend (1-2 frases impactantes)",
      "contentIdea": "Ideia específica de post ou vídeo sobre esse trend",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

Gere EXATAMENTE 6 trends reais, variados entre plataformas e categorias. Ordene por heat decrescente.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return res.status(502).json({ error: "Erro ao chamar Gemini API", details: err.slice(0, 300) });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Sem JSON na resposta Gemini:", rawText.slice(0, 400));
      return res.status(502).json({ error: "Resposta inválida do Gemini", raw: rawText.slice(0, 200) });
    }

    const data = JSON.parse(jsonMatch[0]);

    // Garante que todo trend tem as plataformas no formato antigo (array de ids minúsculos)
    // para compatibilidade com o componente existente
    if (data.trends) {
      data.trends = data.trends.map((t, i) => ({
        ...t,
        id: t.id || `trend_${niche}_${i}`,
        platforms: (t.platforms || []).map((p) =>
          p.toLowerCase().replace("/", "").replace(" ", "").replace("twitter/x", "twitter")
        ),
      }));
    }

    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");
    res.setHeader("X-Generated-At", now.toISOString());
    return res.status(200).json(data);
  } catch (err) {
    console.error("trends.js error:", err);
    return res.status(500).json({ error: err.message });
  }
}
