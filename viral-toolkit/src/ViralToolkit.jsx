import { useState, useEffect, useRef, useCallback } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap";

const CATEGORIES = [
  { id: "tech", label: "Tecnologia", icon: "⚡" },
  { id: "entertainment", label: "Entretenimento", icon: "🎬" },
  { id: "business", label: "Negócios", icon: "📈" },
  { id: "health", label: "Saúde", icon: "💪" },
  { id: "lifestyle", label: "Lifestyle", icon: "✨" },
  { id: "education", label: "Educação", icon: "📚" },
  { id: "gaming", label: "Games", icon: "🎮" },
  { id: "food", label: "Gastronomia", icon: "🍕" },
];

const PLATFORMS = [
  { id: "tiktok", label: "TikTok", color: "#fe2c55" },
  { id: "instagram", label: "Instagram", color: "#E1306C" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "twitter", label: "X / Twitter", color: "#1DA1F2" },
];

const TREND_DATABASE = {
  tech: [
    { topic: "IA generativa no dia a dia", heat: 97, growth: "+340%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
    { topic: "Apps que substituem profissões", heat: 91, growth: "+210%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
    { topic: "Automação com n8n e Make", heat: 85, growth: "+180%", timing: "SUBINDO", platforms: ["youtube", "instagram"] },
    { topic: "Celular dobrável vale a pena?", heat: 78, growth: "+95%", timing: "ESTÁVEL", platforms: ["youtube", "tiktok"] },
    { topic: "Robôs humanoides no trabalho", heat: 88, growth: "+250%", timing: "AGORA", platforms: ["tiktok", "youtube", "twitter"] },
    { topic: "Programar com IA sem saber código", heat: 94, growth: "+300%", timing: "AGORA", platforms: ["youtube", "tiktok", "instagram"] },
  ],
  entertainment: [
    { topic: "Séries que viciam em 1 episódio", heat: 93, growth: "+200%", timing: "AGORA", platforms: ["tiktok", "instagram", "youtube"] },
    { topic: "Músicas que estão viralizando", heat: 95, growth: "+280%", timing: "AGORA", platforms: ["tiktok", "instagram"] },
    { topic: "Rankings e tier lists", heat: 89, growth: "+170%", timing: "AGORA", platforms: ["tiktok", "youtube", "twitter"] },
    { topic: "React de gringo a cultura BR", heat: 92, growth: "+220%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
  ],
  business: [
    { topic: "Renda extra com IA", heat: 96, growth: "+350%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
    { topic: "Negócios para começar com R$0", heat: 90, growth: "+190%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
    { topic: "Copywriting que converte", heat: 83, growth: "+140%", timing: "ESTÁVEL", platforms: ["instagram", "youtube"] },
    { topic: "Infoproduto com IA em 24h", heat: 91, growth: "+240%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
  ],
  health: [
    { topic: "Protocolo de sono perfeito", heat: 88, growth: "+175%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
    { topic: "Saúde mental e redes sociais", heat: 90, growth: "+200%", timing: "AGORA", platforms: ["tiktok", "youtube", "twitter"] },
    { topic: "Biohacking acessível", heat: 82, growth: "+145%", timing: "SUBINDO", platforms: ["youtube", "tiktok"] },
  ],
  lifestyle: [
    { topic: "Rotina produtiva 5AM", heat: 87, growth: "+160%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
    { topic: "Hábitos de milionários", heat: 91, growth: "+210%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
    { topic: "Viagens baratas pelo Brasil", heat: 85, growth: "+150%", timing: "ESTÁVEL", platforms: ["tiktok", "youtube", "instagram"] },
  ],
  education: [
    { topic: "Aprender inglês com IA", heat: 93, growth: "+270%", timing: "AGORA", platforms: ["tiktok", "youtube", "instagram"] },
    { topic: "Cursos gratuitos com certificado", heat: 88, growth: "+170%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
    { topic: "Faculdade vale a pena em 2026?", heat: 84, growth: "+135%", timing: "ESTÁVEL", platforms: ["youtube", "tiktok", "twitter"] },
  ],
  gaming: [
    { topic: "Jogos grátis que são bons", heat: 90, growth: "+195%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
    { topic: "Lançamentos mais esperados", heat: 88, growth: "+175%", timing: "AGORA", platforms: ["youtube", "tiktok", "twitter"] },
    { topic: "Clips e momentos épicos", heat: 92, growth: "+230%", timing: "AGORA", platforms: ["tiktok", "youtube"] },
  ],
  food: [
    { topic: "Receitas com 3 ingredientes", heat: 91, growth: "+215%", timing: "AGORA", platforms: ["tiktok", "instagram", "youtube"] },
    { topic: "Marmita fitness da semana", heat: 87, growth: "+160%", timing: "AGORA", platforms: ["tiktok", "instagram", "youtube"] },
    { topic: "Street food pelo mundo", heat: 84, growth: "+130%", timing: "ESTÁVEL", platforms: ["tiktok", "youtube"] },
  ],
};

const VIRAL_CRITERIA = [
  { id: "hook", label: "Gancho nos primeiros 3s", description: "Prende atenção imediatamente?", weight: 20 },
  { id: "trend", label: "Tema em tendência", description: "Assunto em alta nas redes?", weight: 15 },
  { id: "emotion", label: "Gatilho emocional", description: "Causa riso, choque, inspiração, curiosidade?", weight: 18 },
  { id: "shareable", label: "Compartilhável", description: "Dá vontade de marcar alguém?", weight: 15 },
  { id: "duration", label: "Duração otimizada", description: "Tempo ideal para a plataforma?", weight: 8 },
  { id: "audio", label: "Áudio/Música trending", description: "Usa áudio popular do momento?", weight: 10 },
  { id: "retention", label: "Retenção até o final", description: "Motivo para assistir até o fim?", weight: 14 },
];

/* ─── Utility Components ─── */
function HeatBar({ value, size = "md" }) {
  const color = value >= 90 ? "#fe2c55" : value >= 75 ? "#ff7b00" : value >= 60 ? "#ffc107" : "#4ecdc4";
  const h = size === "sm" ? 6 : 8;
  return (
    <div style={{ width: "100%", height: h, borderRadius: h, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: h, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function TimingBadge({ timing }) {
  const map = { "AGORA": { bg: "#fe2c5522", color: "#fe2c55", border: "#fe2c5544", pulse: true }, "SUBINDO": { bg: "#ff7b0022", color: "#ff7b00", border: "#ff7b0044" }, "ESTÁVEL": { bg: "#4ecdc422", color: "#4ecdc4", border: "#4ecdc444" } };
  const s = map[timing] || map["ESTÁVEL"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace", background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: 1 }}>
      {s.pulse && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, animation: "pulse 1.5s infinite" }} />}
      {timing}
    </span>
  );
}

function CircularScore({ score, size = 160 }) {
  const stroke = 10, radius = (size - stroke) / 2, circ = 2 * Math.PI * radius, offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#fe2c55" : score >= 60 ? "#ff7b00" : score >= 40 ? "#ffc107" : "#4ecdc4";
  const label = score >= 80 ? "ALTO POTENCIAL" : score >= 60 ? "BOM POTENCIAL" : score >= 40 ? "POTENCIAL MÉDIO" : "BAIXO POTENCIAL";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color}66)` }} />
        <text x={size/2} y={size/2 - 6} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size*0.28} fontWeight={800} fontFamily="'Sora', sans-serif" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
        <text x={size/2} y={size/2 + 20} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="'Space Mono', monospace" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>/100</text>
      </svg>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, color, letterSpacing: 2, padding: "4px 12px", borderRadius: 20, background: `${color}15`, border: `1px solid ${color}33` }}>{label}</span>
    </div>
  );
}

/* ─── Radar Chart Component ─── */
function RadarChart({ scores }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(cx, cy) - 50;
    const labels = ["Gancho", "Tendência", "Emoção", "Compartilhável", "Duração", "Áudio", "Retenção"];
    const ids = ["hook", "trend", "emotion", "shareable", "duration", "audio", "retention"];
    const values = ids.map(id => scores[id]?.score || 0);
    const n = labels.length;
    const step = (2 * Math.PI) / n;
    const start = -Math.PI / 2;
    ctx.clearRect(0, 0, W, H);
    // Grid rings
    for (let ring = 2; ring <= 10; ring += 2) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = start + i * step; const r = (ring / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.closePath(); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
    }
    // Spokes
    for (let i = 0; i < n; i++) { const a = start + i * step; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke(); }
    // Ring labels
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px 'Space Mono', monospace"; ctx.textAlign = "center";
    for (let ring = 2; ring <= 10; ring += 2) { ctx.fillText(ring.toString(), cx + 2, cy - (ring / 10) * radius - 4); }
    // Data polygon
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = start + i * step; const r = (values[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.closePath(); ctx.fillStyle = "rgba(255,165,0,0.15)"; ctx.fill(); ctx.strokeStyle = "#ff9500"; ctx.lineWidth = 2.5; ctx.stroke();
    // Data points
    for (let i = 0; i < n; i++) { const a = start + i * step; const r = (values[i] / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fillStyle = "#ff9500"; ctx.fill(); ctx.strokeStyle = "#0a0a0f"; ctx.lineWidth = 1.5; ctx.stroke(); }
    // Labels
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "12px 'Sora', sans-serif";
    for (let i = 0; i < n; i++) { const a = start + i * step; const lr = radius + 28; const x = cx + lr * Math.cos(a); const y = cy + lr * Math.sin(a); ctx.textAlign = Math.abs(Math.cos(a)) < 0.15 ? "center" : Math.cos(a) > 0 ? "left" : "right"; ctx.textBaseline = Math.abs(Math.sin(a)) < 0.15 ? "middle" : Math.sin(a) > 0 ? "top" : "bottom"; ctx.fillText(labels[i], x, y); }
  }, [scores]);
  return (<div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><canvas ref={canvasRef} width={380} height={340} style={{ maxWidth: "100%" }} /></div>);
}

/* ─── Image processing ─── */
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 512;
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => reject(new Error("Erro ao processar imagem."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

/* ─── Video frame extraction ─── */
function extractVideoFrames(file, count = 4) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("crossorigin", "");

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(url);
        reject(new Error("VIDEO_TIMEOUT"));
      }
    }, 20000);

    video.onerror = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("VIDEO_UNSUPPORTED"));
    };

    video.onloadedmetadata = () => {
      if (resolved) return;
      const duration = video.duration;
      if (!duration || !isFinite(duration) || duration <= 0) {
        resolved = true; clearTimeout(timeout); URL.revokeObjectURL(url);
        reject(new Error("VIDEO_NO_DURATION")); return;
      }

      // Need to play briefly to make seeking work in sandboxed iframes
      video.play().then(() => {
        video.pause();
        startExtraction(video, url, duration, count, timeout, resolve, reject, () => resolved, (v) => { resolved = v; });
      }).catch(() => {
        // Try seeking without play
        startExtraction(video, url, duration, count, timeout, resolve, reject, () => resolved, (v) => { resolved = v; });
      });
    };

    video.src = url;
  });
}

function startExtraction(video, url, duration, count, timeout, resolve, reject, getResolved, setResolved) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const times = [];
  for (let i = 0; i < count; i++) times.push(Math.max(0.1, (duration / (count + 1)) * (i + 1)));

  const frames = [];
  let idx = 0;
  let seekRetries = 0;

  const onSeeked = () => {
    if (getResolved()) return;
    try {
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 360;
      canvas.width = Math.min(w, 512);
      canvas.height = Math.round(canvas.width * (h / w));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Check if frame is not blank
      const sample = ctx.getImageData(0, 0, 1, 1).data;
      const isBlank = sample[0] === 0 && sample[1] === 0 && sample[2] === 0;

      if (!isBlank) {
        frames.push({ time: times[idx], dataUrl: canvas.toDataURL("image/jpeg", 0.65) });
      }
    } catch (e) { /* skip frame */ }
    idx++;
    captureNext();
  };

  video.addEventListener("seeked", onSeeked);

  function captureNext() {
    if (getResolved()) return;
    if (idx >= times.length) {
      video.removeEventListener("seeked", onSeeked);
      setResolved(true);
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      if (frames.length === 0) {
        reject(new Error("VIDEO_NO_FRAMES"));
      } else {
        resolve({ frames, duration });
      }
      return;
    }

    // Set a per-seek timeout
    const seekTimeout = setTimeout(() => {
      seekRetries++;
      if (seekRetries > 3) {
        // Skip remaining, return what we have
        video.removeEventListener("seeked", onSeeked);
        setResolved(true); clearTimeout(timeout); URL.revokeObjectURL(url);
        if (frames.length >= 1) resolve({ frames, duration });
        else reject(new Error("VIDEO_NO_FRAMES"));
        return;
      }
      idx++; captureNext();
    }, 5000);

    const origOnSeeked = () => {
      clearTimeout(seekTimeout);
      onSeeked();
    };
    video.removeEventListener("seeked", onSeeked);
    video.addEventListener("seeked", origOnSeeked, { once: true });

    try {
      video.currentTime = times[idx];
    } catch (e) {
      clearTimeout(seekTimeout);
      idx++; captureNext();
    }
  }

  captureNext();
}

/* ─── AI Analysis ─── */
async function analyzeWithAI(imageDataUrls, contextInfo) {
  // Groq/Llama 4 Scout suporta máximo 5 imagens — usamos até 4 + o prompt
  const limitedImages = imageDataUrls.slice(0, 4);
  const imageContent = limitedImages.map((dataUrl) => (
    { type: "image_url", image_url: { url: dataUrl } }
  ));

  const prompt = `Você é um especialista em viralização de vídeos nas redes sociais brasileiras (TikTok, Instagram Reels, YouTube Shorts).

Analise estes ${limitedImages.length} frames de um vídeo e avalie cada critério de 0 a 10, com justificativa curta em português brasileiro.
${contextInfo ? `\nContexto adicional: ${contextInfo}` : ""}

Critérios:
1. hook — Gancho nos primeiros 3 segundos (peso 20%)
2. trend — Tema em tendência (peso 15%)
3. emotion — Gatilho emocional forte (peso 18%)
4. shareable — Fator de compartilhamento (peso 15%)
5. duration — Duração otimizada para plataforma (peso 8%)
6. audio — Potencial de áudio trending (peso 10%)
7. retention — Retenção até o final (peso 14%)

Responda SOMENTE com JSON válido, sem markdown, sem backticks:
{"scores":{"hook":{"score":8,"reason":"..."},"trend":{"score":6,"reason":"..."},"emotion":{"score":7,"reason":"..."},"shareable":{"score":5,"reason":"..."},"duration":{"score":9,"reason":"..."},"audio":{"score":4,"reason":"..."},"retention":{"score":7,"reason":"..."}},"summary":"Resumo geral em 2 frases","top_tip":"Dica mais importante para melhorar"}`;

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: [...imageContent, { type: "text", text: prompt }] }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error || "Erro na API.");
  const text = data.content.map(b => b.text || "").join("");
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

/* ─── Main App ─── */
export default function ViralToolkit() {
  const [activeTab, setActiveTab] = useState("radar");
  const [selectedCategory, setSelectedCategory] = useState("tech");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [manualScores, setManualScores] = useState({});
  const [showManualResult, setShowManualResult] = useState(false);
  // AI mode
  const [uploadedImages, setUploadedImages] = useState([]);
  const [contextInfo, setContextInfo] = useState("");
  const [analysisState, setAnalysisState] = useState("idle");
  const [aiResult, setAiResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [predictorMode, setPredictorMode] = useState("ai");
  const [uploadMode, setUploadMode] = useState("video"); // video | images
  const [dragOver, setDragOver] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const fileInputRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [loadingStep, setLoadingStep] = useState("");

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

  const LOADING_MSGS = ["Processando conteúdo...", "Analisando composição visual...", "Avaliando potencial de gancho...", "Calculando fator viral..."];
  useEffect(() => {
    if (analysisState === "extracting" || analysisState === "analyzing") {
      const iv = setInterval(() => setLoadingIdx(p => (p + 1) % LOADING_MSGS.length), 2200);
      return () => clearInterval(iv);
    }
  }, [analysisState]);

  const trends = TREND_DATABASE[selectedCategory] || [];
  const filteredTrends = selectedPlatform ? trends.filter(t => t.platforms.includes(selectedPlatform)) : trends;
  const manualFinalScore = Math.round(VIRAL_CRITERIA.reduce((acc, c) => acc + ((manualScores[c.id] || 0) / 10) * c.weight, 0));
  const allManualAnswered = VIRAL_CRITERIA.every(c => manualScores[c.id] !== undefined);
  const aiFinalScore = aiResult ? Math.round(VIRAL_CRITERIA.reduce((acc, c) => acc + ((aiResult.scores[c.id]?.score || 0) / 10) * c.weight, 0)) : 0;

  const getVerdict = (score) => {
    if (score >= 80) return { text: "Esse vídeo tem tudo para viralizar. Posta AGORA.", tips: ["Poste no horário de pico (11h-13h ou 19h-21h)", "Use 3-5 hashtags estratégicas", "Responda os primeiros comentários em até 30 min"] };
    if (score >= 60) return { text: "Bom potencial! Com ajustes pode ir longe.", tips: ["Melhore o gancho dos primeiros 3 segundos", "Adicione um CTA forte no final", "Teste 2-3 thumbnails diferentes"] };
    if (score >= 40) return { text: "Potencial médio. Precisa de melhorias.", tips: ["Reestruture com mais tensão narrativa", "Use um áudio trending", "Encurte para melhorar retenção"] };
    return { text: "Precisa repensar antes de postar.", tips: ["Estude os 3 vídeos mais virais do seu nicho", "Foque em 1 emoção dominante", "Teste o conceito em stories antes"] };
  };

  /* Handle video file */
  const handleVideoFile = useCallback(async (file) => {
    setVideoFileName(file.name);
    setVideoPreview(URL.createObjectURL(file));
    setAiResult(null);
    setAnalysisState("idle");
    setUploadedImages([]);
    setErrorMsg("");

    // Try extracting frames
    setAnalysisState("extracting");
    setLoadingStep("Extraindo frames do vídeo...");
    try {
      const { frames, duration } = await extractVideoFrames(file, 4);
      setVideoDuration(duration);
      setUploadedImages(frames.map(f => f.dataUrl));
      setAnalysisState("idle"); // Ready to analyze
    } catch (err) {
      console.warn("Video extraction failed:", err.message);
      // Fallback: show video and let user switch to screenshots
      setAnalysisState("video_fallback");
      setErrorMsg(
        err.message === "VIDEO_TIMEOUT" ? "O vídeo demorou demais para processar." :
        err.message === "VIDEO_UNSUPPORTED" ? "Formato de vídeo não suportado neste navegador." :
        err.message === "VIDEO_NO_FRAMES" ? "Não consegui extrair frames do vídeo." :
        "Erro ao processar o vídeo."
      );
    }
  }, []);

  /* Handle image files */
  const handleImageFiles = useCallback(async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 4);
    if (imageFiles.length === 0) return;
    try {
      const newImages = await Promise.all(imageFiles.map(f => imageToBase64(f)));
      setUploadedImages(prev => [...prev, ...newImages].slice(0, 4));
      setAiResult(null); setAnalysisState("idle"); setErrorMsg("");
    } catch (err) { setErrorMsg(err.message); }
  }, []);

  /* Handle drop/select */
  const handleFiles = useCallback(async (e) => {
    e.preventDefault(); setDragOver(false);
    const files = e.dataTransfer?.files || e.target?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith("video/")) {
      setUploadMode("video");
      handleVideoFile(file);
    } else if (file.type.startsWith("image/")) {
      setUploadMode("images");
      handleImageFiles(files);
    }
  }, [handleVideoFile, handleImageFiles]);

  const removeImage = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
    setAiResult(null); setAnalysisState("idle");
  };

  const runAnalysis = async () => {
    if (uploadedImages.length === 0) return;
    try {
      setAnalysisState("analyzing");
      setErrorMsg("");
      const result = await analyzeWithAI(uploadedImages, contextInfo);
      setAiResult(result);
      setAnalysisState("done");
    } catch (err) {
      setErrorMsg(err.message || "Erro ao analisar.");
      setAnalysisState("error");
    }
  };

  const resetAll = () => {
    setUploadedImages([]); setContextInfo(""); setAiResult(null);
    setAnalysisState("idle"); setErrorMsg(""); setVideoPreview(null);
    setVideoFileName(""); setVideoDuration(0);
  };

  const canAnalyze = uploadedImages.length >= 2;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8e8", fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('${FONTS_URL}');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(254,44,85,.15)}50%{box-shadow:0 0 40px rgba(254,44,85,.3)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, rgba(254,44,85,0.06) 0%, transparent 100%)", opacity: animateIn?1:0, transform: animateIn?"translateY(0)":"translateY(-20px)", transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <h1 style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #fe2c55, #ff7b00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VIRAL TOOLKIT</h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>Inteligência de conteúdo para criadores</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        {[{id:"radar",label:"📡 Radar"},{id:"predictor",label:"🎯 Previsor Viral"}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ flex:1, padding:"14px 12px", border:"none", borderBottom: activeTab===tab.id?"2px solid #fe2c55":"2px solid transparent", background: activeTab===tab.id?"rgba(254,44,85,0.06)":"transparent", color: activeTab===tab.id?"#fff":"rgba(255,255,255,0.4)", fontFamily:"'Sora', sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.3s ease" }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding: "16px", maxWidth: 800, margin: "0 auto" }}>

        {/* ═══ RADAR ═══ */}
        {activeTab === "radar" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>NICHO</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: "7px 14px", borderRadius: 20, border: selectedCategory===cat.id?"1px solid #fe2c55":"1px solid rgba(255,255,255,0.1)", background: selectedCategory===cat.id?"rgba(254,44,85,0.15)":"rgba(255,255,255,0.04)", color: selectedCategory===cat.id?"#fe2c55":"rgba(255,255,255,0.6)", fontFamily:"'Sora', sans-serif", fontSize:12, fontWeight:500, cursor:"pointer" }}>{cat.icon} {cat.label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>PLATAFORMA</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedPlatform(null)} style={{ padding:"6px 14px", borderRadius:16, border: !selectedPlatform?"1px solid rgba(255,255,255,0.4)":"1px solid rgba(255,255,255,0.08)", background: !selectedPlatform?"rgba(255,255,255,0.1)":"transparent", color: !selectedPlatform?"#fff":"rgba(255,255,255,0.4)", fontSize:11, fontFamily:"'Space Mono', monospace", cursor:"pointer" }}>Todas</button>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setSelectedPlatform(p.id)} style={{ padding:"6px 14px", borderRadius:16, border: selectedPlatform===p.id?`1px solid ${p.color}`:"1px solid rgba(255,255,255,0.08)", background: selectedPlatform===p.id?`${p.color}22`:"transparent", color: selectedPlatform===p.id?p.color:"rgba(255,255,255,0.4)", fontSize:11, fontFamily:"'Space Mono', monospace", cursor:"pointer" }}>{p.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredTrends.sort((a,b)=>b.heat-a.heat).map((trend,i) => (
                <div key={i} style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", animation: `slideUp 0.4s ease ${i*0.06}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#fff" }}>{trend.topic}</h3>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <TimingBadge timing={trend.timing} />
                        <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#4ecdc4", fontWeight: 700 }}>{trend.growth}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 50 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: trend.heat>=90?"#fe2c55":trend.heat>=75?"#ff7b00":"#ffc107" }}>{trend.heat}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>HEAT</div>
                    </div>
                  </div>
                  <HeatBar value={trend.heat} />
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {trend.platforms.map(pId => { const pl = PLATFORMS.find(p=>p.id===pId); return <span key={pId} style={{ padding:"2px 8px", borderRadius:10, fontSize:10, fontFamily:"'Space Mono', monospace", background:`${pl.color}15`, color:pl.color, border:`1px solid ${pl.color}33` }}>{pl.label}</span>; })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PREDICTOR ═══ */}
        {activeTab === "predictor" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Mode Switch: AI vs Manual */}
            <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              {[{id:"ai",label:"🤖 Análise por IA",desc:"Envie vídeo ou prints"},{id:"manual",label:"✍️ Manual",desc:"Avalie você mesmo"}].map(m => (
                <button key={m.id} onClick={() => setPredictorMode(m.id)} style={{ flex:1, padding:"12px 10px", border:"none", background: predictorMode===m.id?"rgba(254,44,85,0.1)":"rgba(255,255,255,0.02)", cursor:"pointer", transition:"all 0.3s ease" }}>
                  <div style={{ fontSize:13, fontWeight:600, color: predictorMode===m.id?"#fff":"rgba(255,255,255,0.4)", fontFamily:"'Sora', sans-serif" }}>{m.label}</div>
                  <div style={{ fontSize:10, color: predictorMode===m.id?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)", fontFamily:"'Space Mono', monospace", marginTop:2 }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* ─── AI MODE ─── */}
            {predictorMode === "ai" && (
              <div>
                {analysisState !== "done" && (
                  <>
                    {/* Upload mode toggle */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                      {[{id:"video",label:"🎬 Enviar vídeo"},{id:"images",label:"📸 Enviar prints"}].map(m => (
                        <button key={m.id} onClick={() => { setUploadMode(m.id); resetAll(); }} style={{
                          flex: 1, padding: "10px 12px", borderRadius: 10,
                          border: uploadMode===m.id ? "1px solid #fe2c55" : "1px solid rgba(255,255,255,0.1)",
                          background: uploadMode===m.id ? "rgba(254,44,85,0.1)" : "rgba(255,255,255,0.03)",
                          color: uploadMode===m.id ? "#fe2c55" : "rgba(255,255,255,0.5)",
                          fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>{m.label}</button>
                      ))}
                    </div>

                    {/* Drop Zone */}
                    {uploadedImages.length === 0 && analysisState !== "extracting" && analysisState !== "video_fallback" && (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleFiles}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: "40px 24px", borderRadius: 18, border: dragOver ? "2px dashed #fe2c55" : "2px dashed rgba(255,255,255,0.12)", background: dragOver ? "rgba(254,44,85,0.08)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "center", transition: "all 0.3s ease", marginBottom: 16 }}
                      >
                        <input ref={fileInputRef} type="file" accept={uploadMode === "video" ? "video/*" : "image/*"} multiple={uploadMode === "images"} onChange={handleFiles} style={{ display: "none" }} />
                        <div style={{ fontSize: 44, marginBottom: 12 }}>{uploadMode === "video" ? "🎬" : "📸"}</div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
                          {uploadMode === "video" ? "Arraste seu vídeo aqui" : "Arraste screenshots aqui"}
                        </p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>ou clique para selecionar</p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace", marginTop: 10 }}>
                          {uploadMode === "video" ? "MP4, MOV, WEBM — extração automática de frames" : "JPG, PNG, WEBP — até 4 imagens"}
                        </p>
                      </div>
                    )}

                    {/* Extracting loading */}
                    {analysisState === "extracting" && (
                      <div style={{ textAlign: "center", padding: "40px 20px", animation: "fadeIn 0.4s ease", marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, border: "3px solid rgba(254,44,85,0.2)", borderTopColor: "#fe2c55", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Extraindo frames do vídeo...</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Isso pode levar alguns segundos</p>
                      </div>
                    )}

                    {/* Video fallback */}
                    {analysisState === "video_fallback" && (
                      <div style={{ padding: "20px", borderRadius: 14, background: "rgba(255,123,0,0.08)", border: "1px solid rgba(255,123,0,0.2)", marginBottom: 16, animation: "fadeIn 0.4s ease" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#ff7b00", marginBottom: 8 }}>⚠️ {errorMsg}</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 12 }}>
                          Não foi possível extrair frames automaticamente neste navegador. Você pode:
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={() => { setUploadMode("images"); setAnalysisState("idle"); setErrorMsg(""); setUploadedImages([]); }} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #fe2c55", background: "rgba(254,44,85,0.1)", color: "#fe2c55", fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📸 Enviar screenshots manualmente</button>
                          <button onClick={resetAll} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontFamily: "'Sora', sans-serif", fontSize: 12, cursor: "pointer" }}>Tentar outro arquivo</button>
                        </div>
                      </div>
                    )}

                    {/* Frames preview (from video or images) */}
                    {uploadedImages.length > 0 && analysisState !== "analyzing" && (
                      <div style={{ animation: "fadeIn 0.4s ease" }}>
                        {videoPreview && uploadMode === "video" && (
                          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12, background: "#000", position: "relative" }}>
                            <video src={videoPreview} controls style={{ width: "100%", maxHeight: 240, display: "block" }} />
                          </div>
                        )}

                        <div style={{ marginBottom: 12 }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
                            {uploadMode === "video" ? `FRAMES EXTRAÍDOS (${uploadedImages.length})` : `SCREENSHOTS (${uploadedImages.length}/4)`}
                          </p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {uploadedImages.map((img, i) => (
                              <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                                <img src={img} style={{ width: 80, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.15)" }} alt="" />
                                {uploadMode === "images" && (
                                  <button onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", border: "none", background: "#fe2c55", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
                                )}
                                <span style={{ position: "absolute", bottom: 2, left: 4, fontSize: 8, fontFamily: "'Space Mono', monospace", color: "#fff", background: "rgba(0,0,0,0.7)", padding: "1px 4px", borderRadius: 3 }}>{i+1}</span>
                              </div>
                            ))}
                            {uploadMode === "images" && uploadedImages.length < 4 && (
                              <div onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 56, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 18, cursor: "pointer" }}>+</div>
                            )}
                          </div>
                        </div>

                        {/* Context */}
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>CONTEXTO (OPCIONAL)</p>
                          <textarea value={contextInfo} onChange={e => setContextInfo(e.target.value)} placeholder="Ex: Vídeo de 30s sobre dicas de investimento, público jovem, para o TikTok..." style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8e8e8", fontFamily: "'Sora', sans-serif", fontSize: 13, resize: "vertical", minHeight: 60, outline: "none", lineHeight: 1.5 }} />
                        </div>

                        {/* Analyze button */}
                        <button onClick={runAnalysis} disabled={!canAnalyze} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: canAnalyze ? "linear-gradient(135deg, #fe2c55, #ff7b00)" : "rgba(255,255,255,0.08)", color: canAnalyze ? "#fff" : "rgba(255,255,255,0.35)", fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, cursor: canAnalyze ? "pointer" : "default", animation: canAnalyze ? "glow 2s infinite" : "none", marginBottom: 8 }}>
                          {canAnalyze ? "🤖 ANALISAR COM IA" : `Mínimo 2 frames (${uploadedImages.length}/2)`}
                        </button>

                        <button onClick={resetAll} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: "pointer" }}>Limpar e recomeçar</button>
                      </div>
                    )}

                    {/* Analyzing */}
                    {analysisState === "analyzing" && (
                      <div style={{ textAlign: "center", padding: "48px 20px", animation: "fadeIn 0.4s ease" }}>
                        <div style={{ width: 48, height: 48, border: "3px solid rgba(254,44,85,0.2)", borderTopColor: "#fe2c55", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8, animation: "breathe 2.2s ease infinite" }}>{LOADING_MSGS[loadingIdx]}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>Analisando {uploadedImages.length} frames com IA...</p>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                          {uploadedImages.slice(0, 4).map((img, i) => <img key={i} src={img} style={{ width: 56, height: 42, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", opacity: 0.6 }} alt="" />)}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {analysisState === "error" && (
                      <div style={{ textAlign: "center", padding: "20px", animation: "fadeIn 0.4s ease" }}>
                        <p style={{ fontSize: 14, color: "#fe2c55", marginBottom: 8 }}>⚠️ {errorMsg}</p>
                        <button onClick={() => setAnalysisState("idle")} style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#fff", fontFamily: "'Sora', sans-serif", fontSize: 13, cursor: "pointer" }}>Tentar novamente</button>
                      </div>
                    )}
                  </>
                )}

                {/* ─── AI RESULT ─── */}
                {analysisState === "done" && aiResult && (
                  <div style={{ animation: "slideUp 0.6s ease" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
                      {uploadedImages.map((img, i) => (
                        <div key={i} style={{ flexShrink: 0, position: "relative" }}>
                          <img src={img} style={{ width: 96, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} alt="" />
                          <span style={{ position: "absolute", bottom: 4, right: 4, fontSize: 9, fontFamily: "'Space Mono', monospace", color: "#fff", background: "rgba(0,0,0,0.7)", padding: "1px 5px", borderRadius: 4 }}>#{i+1}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: "28px 20px", borderRadius: 18, background: "linear-gradient(135deg, rgba(254,44,85,0.08), rgba(255,123,0,0.04))", border: "1px solid rgba(254,44,85,0.15)", marginBottom: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}><CircularScore score={aiFinalScore} /></div>
                      <p style={{ fontSize: 16, fontWeight: 600, textAlign: "center", color: "#fff", marginBottom: 6, lineHeight: 1.5 }}>{getVerdict(aiFinalScore).text}</p>
                      {aiResult.summary && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 1.6, marginBottom: 16 }}>{aiResult.summary}</p>}
                      {aiResult.top_tip && (
                        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(254,44,85,0.1)", border: "1px solid rgba(254,44,85,0.2)" }}>
                          <p style={{ fontSize: 12, color: "#fe2c55", fontWeight: 700, marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>💡 DICA PRINCIPAL</p>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{aiResult.top_tip}</p>
                        </div>
                      )}
                    </div>

                    {/* Radar Chart */}
                    <RadarChart scores={aiResult.scores} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {VIRAL_CRITERIA.map(c => {
                        const ai = aiResult.scores[c.id]; const val = ai?.score || 0; const contrib = Math.round((val / 10) * c.weight);
                        return (
                          <div key={c.id} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{c.label}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: val >= 7 ? "#4ecdc4" : val >= 4 ? "#ffc107" : "#fe2c55" }}>{val}</span>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>→ {contrib}pts</span>
                              </div>
                            </div>
                            <HeatBar value={val * 10} size="sm" />
                            {ai?.reason && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5, fontStyle: "italic" }}>{ai.reason}</p>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ padding: "16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.4)", marginBottom: 12, letterSpacing: 1 }}>PRÓXIMOS PASSOS</p>
                      {getVerdict(aiFinalScore).tips.map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 10 : 0 }}>
                          <span style={{ color: "#fe2c55", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>→</span>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={resetAll} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🔄 Analisar outro vídeo</button>
                  </div>
                )}
              </div>
            )}

            {/* ─── MANUAL MODE ─── */}
            {predictorMode === "manual" && (
              <div>
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "linear-gradient(135deg, rgba(254,44,85,0.08), rgba(255,123,0,0.05))", border: "1px solid rgba(254,44,85,0.12)", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>Avalie seu vídeo de <strong style={{ color: "#fff" }}>0 a 10</strong> em cada critério.</p>
                </div>
                {VIRAL_CRITERIA.map((c, i) => (
                  <div key={c.id} style={{ padding: "16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 10, animation: `slideUp 0.4s ease ${i * 0.05}s both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.label}</h3>
                      <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 8 }}>Peso: {c.weight}%</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 12 }}>{c.description}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[0,1,2,3,4,5,6,7,8,9,10].map(val => {
                        const sel = manualScores[c.id] === val;
                        const vc = val >= 8 ? "#fe2c55" : val >= 5 ? "#ff7b00" : val >= 3 ? "#ffc107" : "rgba(255,255,255,0.3)";
                        return <button key={val} onClick={() => { setManualScores(p => ({ ...p, [c.id]: val })); setShowManualResult(false); }} style={{ width: 34, height: 34, borderRadius: 10, border: sel ? `2px solid ${vc}` : "1px solid rgba(255,255,255,0.08)", background: sel ? `${vc}22` : "rgba(255,255,255,0.02)", color: sel ? vc : "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, cursor: "pointer", transform: sel ? "scale(1.1)" : "scale(1)", transition: "all 0.2s ease" }}>{val}</button>;
                      })}
                    </div>
                  </div>
                ))}
                <button onClick={() => setShowManualResult(true)} disabled={!allManualAnswered} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: allManualAnswered ? "linear-gradient(135deg, #fe2c55, #ff7b00)" : "rgba(255,255,255,0.06)", color: allManualAnswered ? "#fff" : "rgba(255,255,255,0.25)", fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, cursor: allManualAnswered ? "pointer" : "default", marginTop: 8, marginBottom: 16, animation: allManualAnswered ? "glow 2s infinite" : "none" }}>
                  {allManualAnswered ? "🚀 CALCULAR POTENCIAL" : `Preencha todos (${Object.keys(manualScores).length}/${VIRAL_CRITERIA.length})`}
                </button>
                {showManualResult && (
                  <div style={{ padding: "28px 20px", borderRadius: 18, background: "linear-gradient(135deg, rgba(254,44,85,0.08), rgba(255,123,0,0.04))", border: "1px solid rgba(254,44,85,0.15)", animation: "slideUp 0.6s ease", marginBottom: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}><CircularScore score={manualFinalScore} /></div>
                    <p style={{ fontSize: 16, fontWeight: 600, textAlign: "center", color: "#fff", marginBottom: 8, lineHeight: 1.5 }}>{getVerdict(manualFinalScore).text}</p>
                    <div style={{ marginTop: 20, padding: "16px", borderRadius: 12, background: "rgba(0,0,0,0.3)" }}>
                      <p style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.4)", marginBottom: 12, letterSpacing: 1 }}>PRÓXIMOS PASSOS</p>
                      {getVerdict(manualFinalScore).tips.map((tip, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 10 : 0 }}>
                          <span style={{ color: "#fe2c55", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>→</span>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
