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
  const map = {
    "AGORA": { bg: "#fe2c5522", color: "#fe2c55", border: "#fe2c5544", pulse: true },
    "SUBINDO": { bg: "#ff7b0022", color: "#ff7b00", border: "#ff7b0044" },
    "ESTÁVEL": { bg: "#4ecdc422", color: "#4ecdc4", border: "#4ecdc444" },
  };
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color}66)` }} />
        <text x={size / 2} y={size / 2 - 6} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size * 0.28} fontWeight={800} fontFamily="'Sora', sans-serif" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
        <text x={size / 2} y={size / 2 + 20} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="'Space Mono', monospace" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>/100</text>
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
    const values = ids.map((id) => scores[id]?.score || 0);
    const n = labels.length;
    const step = (2 * Math.PI) / n;
    const start = -Math.PI / 2;
    ctx.clearRect(0, 0, W, H);
    for (let ring = 2; ring <= 10; ring += 2) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = start + i * step; const r = (ring / 10) * radius; const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.closePath(); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
    }
    for (let i = 0; i < n; i++) { const a = start + i * step; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a)); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px 'Space Mono', monospace"; ctx.textAlign = "center";
    for (let ring = 2; ring <= 10; ring += 2) { ctx.fillText(ring.toString(), cx + 4, cy - (ring / 10) * radius + 4); }
    const dataPoints = values.map((v, i) => { const a = start + i * step; const r = (v / 100) * radius; return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; });
    ctx.beginPath();
    dataPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(254,44,85,0.4)"); grad.addColorStop(1, "rgba(254,44,85,0.05)");
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = "#fe2c55"; ctx.lineWidth = 2; ctx.stroke();
    dataPoints.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI); ctx.fillStyle = "#fe2c55"; ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); });
    ctx.font = "bold 12px 'Sora', sans-serif";
    labels.forEach((label, i) => {
      const a = start + i * step; const r = radius + 28;
      const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a);
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.textAlign = "center"; ctx.fillText(label, x, y);
    });
  }, [scores]);
  return <canvas ref={canvasRef} width={360} height={360} style={{ maxWidth: "100%" }} />;
}

/* ─── Viral Score Checker ─── */

function ViralScoreChecker() {
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const totalScore = Math.round(
    VIRAL_CRITERIA.reduce((acc, c) => acc + ((scores[c.id]?.score || 0) / 10) * c.weight, 0)
  );
  const handleScore = (id, value) => setScores((prev) => ({ ...prev, [id]: { score: value } }));
  return (
    <div>
      <div style={{ display: "grid", gap: 12 }}>
        {VIRAL_CRITERIA.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{c.description}</div>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>×{c.weight}</span>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                <button key={v} onClick={() => handleScore(c.id, v * 10)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", borderColor: scores[c.id]?.score === v * 10 ? "#fe2c55" : "rgba(255,255,255,0.12)", background: scores[c.id]?.score === v * 10 ? "#fe2c55" : "transparent", color: scores[c.id]?.score === v * 10 ? "#fff" : "rgba(255,255,255,0.5)" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {Object.keys(scores).length >= 4 && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <CircularScore score={totalScore} />
          <RadarChart scores={scores} />
          <button onClick={() => { setScores({}); setSubmitted(false); }}
            style={{ padding: "10px 24px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}>
            Resetar avaliação
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── TREND RADAR — DINÂMICO ─── */

function useTrendData(niche) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trends?niche=${niche}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [niche]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh a cada 30 minutos
  useEffect(() => {
    const t = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastFetch };
}

function TrendCardExpanded({ trend }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const platColors = {
    tiktok: "#fe2c55", instagram: "#E1306C", youtube: "#FF0000",
    twitter: "#1DA1F2", linkedin: "#0077B5", multiplataforma: "#888",
  };

  const catColor = {
    "Google Trends": "#4285F4",
    "Notícia": "#EA4335",
    "Vídeo Viral": "#FF0000",
    "Hashtag": "#1DA1F2",
    "Formato": "#7C3AED",
  };

  const color = trend.heat >= 90 ? "#fe2c55" : trend.heat >= 75 ? "#ff7b00" : trend.heat >= 60 ? "#ffc107" : "#4ecdc4";

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${open ? "rgba(254,44,85,0.3)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: open ? "0 4px 24px rgba(254,44,85,0.12)" : "none",
      }}
    >
      {/* ── Card header ── */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Meta row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              <TimingBadge timing={trend.timing} />
              {trend.category && (
                <span style={{ fontSize: 11, fontWeight: 600, color: catColor[trend.category] || "#aaa", background: `${catColor[trend.category] || "#aaa"}18`, border: `1px solid ${catColor[trend.category] || "#aaa"}33`, borderRadius: 20, padding: "3px 9px" }}>
                  {trend.category}
                </span>
              )}
              {(trend.platforms || []).map((pid) => {
                const c = platColors[pid] || "#666";
                const lbl = pid === "tiktok" ? "TikTok" : pid === "instagram" ? "Instagram" : pid === "youtube" ? "YouTube" : pid === "twitter" ? "X" : pid === "linkedin" ? "LinkedIn" : pid;
                return (
                  <span key={pid} style={{ fontSize: 11, fontWeight: 600, color: c, background: `${c}18`, border: `1px solid ${c}33`, borderRadius: 20, padding: "3px 9px" }}>
                    {lbl}
                  </span>
                );
              })}
            </div>

            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.35 }}>
              {trend.topic}
            </p>

            {trend.description && (
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                {trend.description}
              </p>
            )}
          </div>

          {/* Heat score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>
              {trend.heat}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>HEAT</span>
          </div>
        </div>

        {/* Heat bar + growth */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <HeatBar value={trend.heat} size="sm" />
          </div>
          {trend.growth && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4ecdc4", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
              {trend.growth}
            </span>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* ── Expansão: Hook + Ideia ── */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* Hook */}
          {trend.hook && (
            <div style={{ background: "rgba(255,180,0,0.07)", border: "1px solid rgba(255,180,0,0.2)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ff7b00", letterSpacing: "0.08em", marginBottom: 6 }}>🪝 HOOK PRONTO</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, flex: 1 }}>{trend.hook}</p>
                <button
                  onClick={() => copy(trend.hook, "hook")}
                  style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: copied === "hook" ? "#4ecdc4" : "#ff7b00", background: copied === "hook" ? "rgba(78,205,196,0.15)" : "rgba(255,123,0,0.15)", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}
                >
                  {copied === "hook" ? "✓ Copiado" : "📋 Copiar"}
                </button>
              </div>
            </div>
          )}

          {/* Ideia de conteúdo */}
          {trend.contentIdea && (
            <div style={{ background: "rgba(78,205,196,0.07)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4ecdc4", letterSpacing: "0.08em", marginBottom: 6 }}>💡 IDEIA DE CONTEÚDO</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, flex: 1 }}>{trend.contentIdea}</p>
                <button
                  onClick={() => copy(trend.contentIdea, "idea")}
                  style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: copied === "idea" ? "#4ecdc4" : "#4ecdc4", background: "rgba(78,205,196,0.15)", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}
                >
                  {copied === "idea" ? "✓ Copiado" : "📋 Copiar"}
                </button>
              </div>
            </div>
          )}

          {/* Tags */}
          {trend.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {trend.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "3px 9px" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrendRadarSection() {
  const [activeCategory, setActiveCategory] = useState("tech");
  const [filterPlatform, setFilterPlatform] = useState(null);
  const { data, loading, error, refetch, lastFetch } = useTrendData(activeCategory);

  const trends = data?.trends || [];
  const filtered = filterPlatform
    ? trends.filter((t) => (t.platforms || []).includes(filterPlatform))
    : trends;

  return (
    <div>
      {/* Seletor de categoria */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            style={{
              padding: "7px 14px", borderRadius: 99,
              border: activeCategory === c.id ? "1.5px solid #fe2c55" : "1.5px solid rgba(255,255,255,0.12)",
              background: activeCategory === c.id ? "rgba(254,44,85,0.12)" : "transparent",
              color: activeCategory === c.id ? "#fe2c55" : "rgba(255,255,255,0.5)",
              fontWeight: activeCategory === c.id ? 700 : 500,
              fontSize: 13, cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'Sora', sans-serif",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Header com heat global + botão refresh */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {data && !loading && (
            <>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
                HEAT GERAL
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: data.heatScore >= 80 ? "#fe2c55" : data.heatScore >= 60 ? "#ff7b00" : "#ffc107", fontFamily: "'Sora', sans-serif" }}>
                {data.heatScore}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/100</span>
              </span>
              {data.summary && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {data.summary}
                </span>
              )}
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastFetch && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace" }}>
              {lastFetch.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 99,
              border: "1.5px solid rgba(255,255,255,0.15)",
              background: loading ? "rgba(255,255,255,0.03)" : "rgba(254,44,85,0.1)",
              color: loading ? "rgba(255,255,255,0.25)" : "#fe2c55",
              fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Space Mono', monospace", letterSpacing: 0.5,
              transition: "all 0.2s", opacity: loading ? 0.5 : 1,
            }}
          >
            <span style={loading ? { display: "inline-block", animation: "spin 1s linear infinite" } : {}}>⟳</span>
            {loading ? "BUSCANDO..." : "ATUALIZAR"}
          </button>
        </div>
      </div>

      {/* Filtro por plataforma */}
      {!loading && trends.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          <button
            onClick={() => setFilterPlatform(null)}
            style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${!filterPlatform ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`, background: !filterPlatform ? "rgba(255,255,255,0.08)" : "transparent", color: !filterPlatform ? "#fff" : "rgba(255,255,255,0.35)" }}
          >
            Todas
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPlatform(filterPlatform === p.id ? null : p.id)}
              style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${filterPlatform === p.id ? p.color : "rgba(255,255,255,0.1)"}`, background: filterPlatform === p.id ? `${p.color}20` : "transparent", color: filterPlatform === p.id ? p.color : "rgba(255,255,255,0.35)" }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 100, borderRadius: 14, background: "rgba(255,255,255,0.04)", animation: `shimmer 1.4s ease-in-out ${i * 0.12}s infinite`, backgroundSize: "200% 100%" }} />
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
        </div>
      )}

      {/* Erro */}
      {error && !loading && (
        <div style={{ background: "rgba(254,44,85,0.08)", border: "1px solid rgba(254,44,85,0.25)", borderRadius: 14, padding: 20, textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#fe2c55" }}>⚠️ Erro ao buscar tendências</p>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{error}</p>
          <button onClick={refetch} style={{ padding: "8px 20px", borderRadius: 20, border: "1px solid #fe2c55", background: "rgba(254,44,85,0.15)", color: "#fe2c55", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Lista de trends */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "30px 0" }}>
              Nenhum trend para esta plataforma
            </p>
          ) : (
            filtered.map((trend, i) => (
              <TrendCardExpanded key={trend.id || i} trend={trend} />
            ))
          )}
        </div>
      )}

      {/* Nota de rodapé */}
      {!loading && !error && trends.length > 0 && (
        <p style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", fontFamily: "'Space Mono', monospace" }}>
          Dados via Gemini + Google Search · Atualiza automaticamente a cada 30min
        </p>
      )}
    </div>
  );
}

/* ─── Content Ideas Generator ─── */

function ContentIdeasGenerator() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [format, setFormat] = useState("short");
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const formats = [
    { id: "short", label: "Short/Reels (< 60s)" },
    { id: "long", label: "Vídeo longo (> 5min)" },
    { id: "carousel", label: "Carrossel" },
    { id: "story", label: "Story/Flick" },
  ];

  const generateIdeas = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setIdeas([]);

    try {
      const prompt = `Gere 5 ideias criativas e virais de conteúdo para:
Nicho: ${niche}
Plataforma: ${PLATFORMS.find((p) => p.id === platform)?.label}
Formato: ${formats.find((f) => f.id === format)?.label}

Responda SOMENTE com um array JSON:
[
  {
    "title": "Título chamativo do conteúdo",
    "hook": "Primeiro texto/fala dos primeiros 3 segundos",
    "structure": "Estrutura resumida: intro → desenvolvimento → CTA",
    "viralFactor": "Por que isso pode viralizar"
  }
]`;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY não configurada no .env");

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
          }),
        }
      );

      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) setIdeas(JSON.parse(jsonMatch[0]));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>SEU NICHO</label>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: finanças pessoais para millennials"
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>PLATAFORMA</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "'Sora', sans-serif", outline: "none" }}>
              {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>FORMATO</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "'Sora', sans-serif", outline: "none" }}>
              {formats.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={generateIdeas}
          disabled={!niche.trim() || loading}
          style={{ padding: "13px", borderRadius: 12, border: "none", background: niche.trim() && !loading ? "linear-gradient(135deg, #fe2c55, #ff7b00)" : "rgba(255,255,255,0.06)", color: niche.trim() && !loading ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700, cursor: niche.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", transition: "all 0.2s" }}>
          {loading ? "⟳ Gerando..." : "✨ Gerar 5 Ideias Virais"}
        </button>
      </div>

      {ideas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ideas.map((idea, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(254,44,85,0.2)", color: "#fe2c55", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Space Mono', monospace" }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{idea.title}</p>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ background: "rgba(255,180,0,0.06)", border: "1px solid rgba(255,180,0,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#ff7b00", letterSpacing: "0.08em" }}>🪝 HOOK</span>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{idea.hook}</p>
                </div>
                <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4ecdc4", letterSpacing: "0.08em" }}>📋 ESTRUTURA</span>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{idea.structure}</p>
                </div>
                <div style={{ background: "rgba(254,44,85,0.06)", border: "1px solid rgba(254,44,85,0.15)", borderRadius: 8, padding: "8px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fe2c55", letterSpacing: "0.08em" }}>🔥 FATOR VIRAL</span>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{idea.viralFactor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Caption Generator ─── */

function CaptionGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("engajamento");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const tones = [
    { id: "engajamento", label: "Engajamento" },
    { id: "informativo", label: "Informativo" },
    { id: "storytelling", label: "Storytelling" },
    { id: "provocativo", label: "Provocativo" },
    { id: "inspiracional", label: "Inspiracional" },
  ];

  const generateCaptions = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCaptions([]);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY não configurada");

      const prompt = `Crie 3 legendas para Instagram/TikTok sobre "${topic}" no tom: ${tone}.
Cada legenda deve ter: gancho forte, desenvolvimento, CTA e hashtags relevantes.
Responda SOMENTE com JSON array:
[{ "caption": "texto completo com emojis e hashtags", "cta": "chamada para ação destacada", "hooks": "primeiro linha isolada" }]`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, maxOutputTokens: 2048 } }),
        }
      );
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) setCaptions(JSON.parse(match[0]));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>ASSUNTO DO POST</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: 3 erros que estão te impedindo de crescer no Instagram"
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>TOM DA LEGENDA</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tones.map((t) => (
              <button key={t.id} onClick={() => setTone(t.id)}
                style={{ padding: "7px 14px", borderRadius: 99, border: `1.5px solid ${tone === t.id ? "#fe2c55" : "rgba(255,255,255,0.12)"}`, background: tone === t.id ? "rgba(254,44,85,0.12)" : "transparent", color: tone === t.id ? "#fe2c55" : "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generateCaptions} disabled={!topic.trim() || loading}
          style={{ padding: "13px", borderRadius: 12, border: "none", background: topic.trim() && !loading ? "linear-gradient(135deg, #fe2c55, #ff7b00)" : "rgba(255,255,255,0.06)", color: topic.trim() && !loading ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700, cursor: topic.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", transition: "all 0.2s" }}>
          {loading ? "⟳ Criando legendas..." : "✨ Gerar Legendas"}
        </button>
      </div>

      {captions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {captions.map((cap, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>LEGENDA {i + 1}</span>
                <button onClick={() => copy(cap.caption, i)}
                  style={{ fontSize: 11, fontWeight: 600, color: copied === i ? "#4ecdc4" : "#fe2c55", background: copied === i ? "rgba(78,205,196,0.15)" : "rgba(254,44,85,0.1)", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer" }}>
                  {copied === i ? "✓ Copiado!" : "📋 Copiar tudo"}
                </button>
              </div>
              {cap.hooks && (
                <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#fe2c55", lineHeight: 1.3 }}>{cap.hooks}</p>
              )}
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{cap.caption}</p>
              {cap.cta && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#4ecdc4", fontWeight: 600 }}>→ {cap.cta}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Thumbnail Analyzer ─── */

function ThumbnailAnalyzer() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY não configurada");

      const imageRes = await fetch(url);
      const blob = await imageRes.blob();
      const base64 = await new Promise((res) => {
        const r = new FileReader();
        r.onloadend = () => res(r.result.split(",")[1]);
        r.readAsDataURL(blob);
      });

      const prompt = `Analise esta thumbnail para YouTube/redes sociais. Avalie de 0-10:
- Clareza visual (contraste, legibilidade)
- Gatilho emocional (desperta curiosidade?)
- Texto (impactante, tamanho ideal?)
- Cores (chamativas, harmônicas?)
- CTR estimado (potencial de cliques)

Responda SOMENTE com JSON:
{
  "overallScore": <0-100>,
  "scores": { "clarity": <0-10>, "emotion": <0-10>, "text": <0-10>, "colors": <0-10>, "ctr": <0-10> },
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "improvements": ["melhoria 1", "melhoria 2"],
  "verdict": "frase de 1 linha sobre a thumbnail"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: blob.type || "image/jpeg", data: base64 } },
                { text: prompt },
              ],
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
          }),
        }
      );
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) setAnalysis(JSON.parse(match[0]));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scoreLabels = { clarity: "Clareza", emotion: "Emoção", text: "Texto", colors: "Cores", ctr: "CTR" };

  return (
    <div>
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>URL DA IMAGEM</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://i.ytimg.com/vi/..."
            style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        {url && (
          <img src={url} alt="preview" onError={(e) => e.target.style.display = "none"} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} />
        )}
        <button onClick={analyze} disabled={!url.trim() || loading}
          style={{ padding: "13px", borderRadius: 12, border: "none", background: url.trim() && !loading ? "linear-gradient(135deg, #fe2c55, #ff7b00)" : "rgba(255,255,255,0.06)", color: url.trim() && !loading ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 14, fontWeight: 700, cursor: url.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "'Sora', sans-serif", transition: "all 0.2s" }}>
          {loading ? "⟳ Analisando..." : "🔍 Analisar Thumbnail"}
        </button>
      </div>

      {analysis && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>SCORE GERAL</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{analysis.verdict}</p>
            </div>
            <CircularScore score={analysis.overallScore} size={100} />
          </div>

          {analysis.scores && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
              {Object.entries(analysis.scores).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{scoreLabels[key] || key}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fe2c55", fontFamily: "'Space Mono', monospace" }}>{val}/10</span>
                  </div>
                  <HeatBar value={val * 10} size="sm" />
                </div>
              ))}
            </div>
          )}

          {analysis.strengths?.length > 0 && (
            <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#4ecdc4", letterSpacing: "0.08em" }}>✅ PONTOS FORTES</p>
              {analysis.strengths.map((s, i) => <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>• {s}</p>)}
            </div>
          )}

          {analysis.improvements?.length > 0 && (
            <div style={{ background: "rgba(254,44,85,0.06)", border: "1px solid rgba(254,44,85,0.15)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#fe2c55", letterSpacing: "0.08em" }}>⚡ MELHORIAS</p>
              {analysis.improvements.map((s, i) => <p key={i} style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>• {s}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main App ─── */

const TOOLS = [
  { id: "radar", label: "Radar de Tendências", icon: "📡", description: "Trends reais por nicho e plataforma" },
  { id: "viral", label: "Score Viral", icon: "🔥", description: "Avalie o potencial viral do seu conteúdo" },
  { id: "ideas", label: "Gerador de Ideias", icon: "💡", description: "5 ideias virais para qualquer nicho" },
  { id: "captions", label: "Legendas IA", icon: "✍️", description: "Legendas que geram engajamento" },
  { id: "thumbnail", label: "Análise Thumbnail", icon: "🖼️", description: "Score e feedback da sua thumbnail" },
];

export default function ViralToolkit() {
  const [activeTool, setActiveTool] = useState("radar");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_URL;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const tool = TOOLS.find((t) => t.id === activeTool);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)", fontFamily: "'Sora', sans-serif", color: "#fff" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #1a1a2e; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 0", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #fe2c55, #ff7b00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.7))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Viral Toolkit
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
              criador de conteúdo · powered by gemini
            </p>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 99,
                border: activeTool === t.id ? "1.5px solid rgba(254,44,85,0.6)" : "1.5px solid rgba(255,255,255,0.08)",
                background: activeTool === t.id ? "rgba(254,44,85,0.12)" : "rgba(255,255,255,0.03)",
                color: activeTool === t.id ? "#fe2c55" : "rgba(255,255,255,0.45)",
                fontWeight: activeTool === t.id ? 700 : 500,
                fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Sora', sans-serif",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Tool header */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>
            {tool?.icon} {tool?.label}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{tool?.description}</p>
        </div>

        {/* Tool content */}
        {activeTool === "radar" && <TrendRadarSection />}
        {activeTool === "viral" && <ViralScoreChecker />}
        {activeTool === "ideas" && <ContentIdeasGenerator />}
        {activeTool === "captions" && <CaptionGenerator />}
        {activeTool === "thumbnail" && <ThumbnailAnalyzer />}
      </div>
    </div>
  );
}
