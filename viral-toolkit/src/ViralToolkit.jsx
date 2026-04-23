import { useState, useEffect, useRef, useCallback } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";

/* ─── Design tokens ─── */
const C = {
  bg:          "#000000",
  surface:     "#0a0a0a",
  surfaceHover:"#111111",
  border:      "#1c1c1c",
  borderHover: "#2a2a2a",
  blue:        "#2563eb",
  blueHover:   "#3b82f6",
  blueDim:     "rgba(37,99,235,0.12)",
  blueBorder:  "rgba(37,99,235,0.45)",
  text:        "#ffffff",
  textMid:     "rgba(255,255,255,0.55)",
  textDim:     "rgba(255,255,255,0.22)",
  success:     "#22c55e",
  warn:        "#f59e0b",
  danger:      "#ef4444",
};

/* ─── Data ─── */
const CATEGORIES = [
  { id: "tech",          label: "Tecnologia",    icon: "⚡" },
  { id: "entertainment", label: "Entretenimento", icon: "🎬" },
  { id: "business",      label: "Negócios",       icon: "📈" },
  { id: "health",        label: "Saúde",          icon: "💪" },
  { id: "lifestyle",     label: "Lifestyle",      icon: "✨" },
  { id: "education",     label: "Educação",       icon: "📚" },
  { id: "gaming",        label: "Games",          icon: "🎮" },
  { id: "food",          label: "Gastronomia",    icon: "🍕" },
];

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok"     },
  { id: "instagram", label: "Instagram"  },
  { id: "youtube",   label: "YouTube"    },
  { id: "twitter",   label: "X / Twitter"},
];

const VIRAL_CRITERIA = [
  { id: "hook",      label: "Gancho nos primeiros 3s",        description: "Prende atenção imediatamente?",               weight: 20 },
  { id: "trend",     label: "Tema em tendência",               description: "Assunto em alta nas redes?",                  weight: 15 },
  { id: "emotion",   label: "Gatilho emocional",               description: "Causa riso, choque, inspiração, curiosidade?", weight: 18 },
  { id: "shareable", label: "Compartilhável",                  description: "Dá vontade de marcar alguém?",                weight: 15 },
  { id: "duration",  label: "Duração otimizada",               description: "Tempo ideal para a plataforma?",              weight: 8  },
  { id: "audio",     label: "Áudio/Música trending",           description: "Usa áudio popular do momento?",               weight: 10 },
  { id: "retention", label: "Retenção até o final",            description: "Motivo para assistir até o fim?",             weight: 14 },
];

const TOOLS = [
  { id: "radar",     label: "Radar de Tendências", description: "Trends reais por nicho e plataforma"        },
  { id: "video",     label: "Analisar Vídeo",       description: "Envie um vídeo e veja seu potencial viral"  },
  { id: "viral",     label: "Score Viral",          description: "Avalie o potencial viral do seu conteúdo"   },
  { id: "ideas",     label: "Gerador de Ideias",    description: "5 ideias virais para qualquer nicho"         },
  { id: "captions",  label: "Legendas IA",          description: "Legendas que geram engajamento"              },
  { id: "thumbnail", label: "Análise Thumbnail",    description: "Score e feedback da sua thumbnail"           },
];

/* ════════════════════════════════════════════
   PRIMITIVES
════════════════════════════════════════════ */

function Bar({ value }) {
  return (
    <div style={{ width: "100%", height: 3, borderRadius: 3, background: C.border }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: C.blue, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function ScoreRing({ score, size = 100 }) {
  const stroke = 2.5, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.blue} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: Math.round(size * 0.25), fontWeight: 700, color: C.text, lineHeight: 1, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'JetBrains Mono', monospace" }}>/100</span>
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: "5px 11px", borderRadius: 4, border: `1px solid ${active ? C.blueBorder : C.border}`, background: active ? C.blueDim : "transparent", color: active ? C.blue : C.textDim, fontSize: 12, fontWeight: active ? 500 : 400, cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick, disabled, fullWidth }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: fullWidth ? "100%" : undefined, padding: "10px 18px", borderRadius: 6, border: "none", background: disabled ? C.surface : C.blue, color: disabled ? C.textDim : C.text, fontSize: 13, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter', sans-serif", border: `1px solid ${disabled ? C.border : "transparent"}` }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: "7px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, fontSize: 12, cursor: "pointer", transition: "all 0.12s", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif" }}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px", ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color: C.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{ padding: "3px 9px", borderRadius: 4, border: `1px solid ${ok ? C.success + "66" : C.border}`, background: "transparent", color: ok ? C.success : C.textDim, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", transition: "all 0.18s", flexShrink: 0 }}>
      {ok ? "✓" : "copy"}
    </button>
  );
}

function FieldInput({ value, onChange, placeholder, mono }) {
  const [focus, setFocus] = useState(false);
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ width: "100%", padding: "10px 12px", background: C.surface, border: `1px solid ${focus ? C.blueBorder : C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
    />
  );
}

function FieldSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width: "100%", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", cursor: "pointer" }}>
      {children}
    </select>
  );
}

function Spin() { return <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>↻</span>; }

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      {label && <Label>{label}</Label>}
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

/* ─── Radar chart (canvas) ─── */
function RadarChart({ scores }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
    const radius = Math.min(cx, cy) - 44;
    const ids    = ["hook","trend","emotion","shareable","duration","audio","retention"];
    const labels = ["Gancho","Tendência","Emoção","Compartilhável","Duração","Áudio","Retenção"];
    const values = ids.map(id => scores[id]?.score || 0);
    const n = ids.length, step = (2*Math.PI)/n, start = -Math.PI/2;
    ctx.clearRect(0, 0, W, H);
    for (let ring = 2; ring <= 10; ring += 2) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = start+i*step, rl=(ring/10)*radius; i===0?ctx.moveTo(cx+rl*Math.cos(a),cy+rl*Math.sin(a)):ctx.lineTo(cx+rl*Math.cos(a),cy+rl*Math.sin(a)); }
      ctx.closePath(); ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=1; ctx.stroke();
    }
    for (let i=0;i<n;i++){const a=start+i*step;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+radius*Math.cos(a),cy+radius*Math.sin(a));ctx.strokeStyle="rgba(255,255,255,0.05)";ctx.lineWidth=1;ctx.stroke();}
    const pts=values.map((v,i)=>{const a=start+i*step,rl=(v/100)*radius;return{x:cx+rl*Math.cos(a),y:cy+rl*Math.sin(a)};});
    ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.closePath();
    ctx.fillStyle="rgba(37,99,235,0.14)";ctx.fill();ctx.strokeStyle=C.blue;ctx.lineWidth=1.5;ctx.stroke();
    pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3,0,2*Math.PI);ctx.fillStyle=C.blue;ctx.fill();});
    ctx.font="11px 'Inter',sans-serif";ctx.fillStyle="rgba(255,255,255,0.35)";ctx.textAlign="center";
    labels.forEach((lbl,i)=>{const a=start+i*step,rl=radius+22;ctx.fillText(lbl,cx+rl*Math.cos(a),cy+rl*Math.sin(a)+4);});
  }, [scores]);
  return <canvas ref={ref} width={300} height={300} style={{ maxWidth:"100%", display:"block", margin:"0 auto" }} />;
}

/* ════════════════════════════════════════════
   TOOL 1 — TREND RADAR
════════════════════════════════════════════ */

function useTrendData(niche) {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [lastFetch,setLastFetch]=useState(null);
  const fetch_=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const r=await fetch(`/api/trends?niche=${niche}`);
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||`HTTP ${r.status}`);}
      setData(await r.json());setLastFetch(new Date());
    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[niche]);
  useEffect(()=>{fetch_();},[fetch_]);
  useEffect(()=>{const t=setInterval(fetch_,30*60*1000);return()=>clearInterval(t);},[fetch_]);
  return{data,loading,error,refetch:fetch_,lastFetch};
}

function TrendCard({trend,index}){
  const[open,setOpen]=useState(false);
  return(
    <div onClick={()=>setOpen(!open)}
      style={{background:open?C.surfaceHover:C.surface,border:`1px solid ${open?C.blueBorder:C.border}`,borderRadius:7,overflow:"hidden",cursor:"pointer",transition:"all 0.12s"}}>
      <div style={{padding:"11px 13px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
          <span style={{fontSize:11,color:C.textDim,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,paddingTop:1}}>{String(index+1).padStart(2,"0")}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:5}}>
              <Chip active>{trend.timing}</Chip>
              {trend.category&&<Chip>{trend.category}</Chip>}
            </div>
            <p style={{margin:"0 0 3px",fontSize:13,fontWeight:500,color:C.text,lineHeight:1.35}}>{trend.topic}</p>
            {trend.description&&<p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.4}}>{trend.description}</p>}
          </div>
          <div style={{flexShrink:0,textAlign:"right"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{trend.heat}</div>
            {trend.growth&&<div style={{fontSize:10,color:C.blue,fontFamily:"'JetBrains Mono',monospace"}}>{trend.growth}</div>}
          </div>
        </div>
        <div style={{marginTop:9}}><Bar value={trend.heat}/></div>
      </div>
      {open&&(
        <div onClick={e=>e.stopPropagation()} style={{borderTop:`1px solid ${C.border}`,padding:"11px 13px",display:"flex",flexDirection:"column",gap:10}}>
          {trend.hook&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><Label>Hook</Label><CopyBtn text={trend.hook}/></div>
              <p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.5}}>{trend.hook}</p>
            </div>
          )}
          {trend.contentIdea&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><Label>Ideia de conteúdo</Label><CopyBtn text={trend.contentIdea}/></div>
              <p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.5}}>{trend.contentIdea}</p>
            </div>
          )}
          {trend.tags?.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {trend.tags.map(t=><Chip key={t}>#{t}</Chip>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrendRadarSection(){
  const[cat,setCat]=useState("tech");
  const[plat,setPlat]=useState(null);
  const{data,loading,error,refetch,lastFetch}=useTrendData(cat);
  const trends=data?.trends||[];
  const filtered=plat?trends.filter(t=>(t.platforms||[]).includes(plat)):trends;
  return(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{marginBottom:8}}><Label>Nicho</Label></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {CATEGORIES.map(c=><Chip key={c.id} active={cat===c.id} onClick={()=>setCat(c.id)}>{c.icon} {c.label}</Chip>)}
        </div>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {data&&!loading&&(
            <><span style={{fontSize:10,color:C.textDim,fontFamily:"'JetBrains Mono',monospace"}}>heat</span>
            <span style={{fontSize:15,fontWeight:700,color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{data.heatScore}<span style={{fontSize:10,color:C.textDim}}>/100</span></span>
            {data.summary&&<span style={{fontSize:11,color:C.textDim,maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{data.summary}</span>}</>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {lastFetch&&<span style={{fontSize:10,color:C.textDim,fontFamily:"'JetBrains Mono',monospace"}}>{lastFetch.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>}
          <GhostBtn onClick={refetch}>{loading?<><Spin/> buscando</>:"↻ atualizar"}</GhostBtn>
        </div>
      </div>

      {!loading&&trends.length>0&&(
        <div style={{display:"flex",gap:5,marginBottom:12,overflowX:"auto"}}>
          <Chip active={!plat} onClick={()=>setPlat(null)}>Todas</Chip>
          {PLATFORMS.map(p=><Chip key={p.id} active={plat===p.id} onClick={()=>setPlat(plat===p.id?null:p.id)}>{p.label}</Chip>)}
        </div>
      )}

      {loading&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[...Array(4)].map((_,i)=><div key={i} style={{height:72,borderRadius:7,background:C.surface,border:`1px solid ${C.border}`,animation:`pulse_ 1.4s ease-in-out ${i*0.1}s infinite`}}/>)}
        </div>
      )}

      {error&&!loading&&(
        <Card>
          <p style={{margin:"0 0 4px",fontSize:13,color:C.danger}}>Erro ao buscar tendências</p>
          <p style={{margin:"0 0 12px",fontSize:12,color:C.textDim}}>{error}</p>
          <PrimaryBtn onClick={refetch}>Tentar novamente</PrimaryBtn>
        </Card>
      )}

      {!loading&&!error&&(
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {filtered.length===0
            ?<p style={{fontSize:12,color:C.textDim,padding:"20px 0",textAlign:"center"}}>Nenhum trend para esta plataforma</p>
            :filtered.map((t,i)=><TrendCard key={t.id||i} trend={t} index={i}/>)
          }
        </div>
      )}

      {!loading&&!error&&trends.length>0&&(
        <p style={{marginTop:14,fontSize:10,color:C.textDim,textAlign:"center",fontFamily:"'JetBrains Mono',monospace"}}>gemini + google search · auto-refresh 30min</p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOOL 2 — VIDEO ANALYZER
════════════════════════════════════════════ */

function VideoAnalyzer(){
  const[mode,setMode]=useState("upload");
  const[file,setFile]=useState(null);
  const[videoUrl,setVideoUrl]=useState("");
  const[preview,setPreview]=useState(null);
  const[analysis,setAnalysis]=useState(null);
  const[loading,setLoading]=useState(false);
  const[progress,setProgress]=useState("");
  const[drag,setDrag]=useState(false);
  const inputRef=useRef(null);

  const handleFile=f=>{if(!f||!f.type.startsWith("video/"))return;setFile(f);setAnalysis(null);setPreview(URL.createObjectURL(f));};

  const analyze=async()=>{
    const apiKey=import.meta.env.VITE_GEMINI_API_KEY;
    if(!apiKey){alert("VITE_GEMINI_API_KEY não configurada");return;}
    setLoading(true);setAnalysis(null);
    try{
      let base64=null,mimeType="video/mp4";
      if(mode==="upload"&&file){
        setProgress("carregando vídeo...");
        mimeType=file.type||"video/mp4";
        base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      }
      setProgress("analisando...");
      const prompt=`Analise este vídeo para redes sociais brasileiras. Avalie o potencial viral.
Responda SOMENTE com JSON:
{"viralScore":<0-100>,"verdict":"frase curta","scores":{"hook":<0-10>,"emotion":<0-10>,"retention":<0-10>,"shareable":<0-10>,"trend":<0-10>,"audio":<0-10>,"editing":<0-10>},"strengths":["p1","p2","p3"],"improvements":["m1","m2","m3"],"bestPlatform":"plataforma","estimatedReach":"ex: 10k–50k views","hookSuggestion":"gancho sugerido","bestPostTime":"horário ideal"}`;
      const parts=base64?[{inlineData:{mimeType,data:base64}},{text:prompt}]:[{text:`URL: ${videoUrl}\n\n${prompt}`}];
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:0.3,maxOutputTokens:2048}}),
      });
      const d=await r.json();
      const raw=d?.candidates?.[0]?.content?.parts?.[0]?.text||"{}";
      const m=raw.match(/\{[\s\S]*\}/);
      if(m)setAnalysis(JSON.parse(m[0]));
    }catch(e){alert("Erro: "+e.message);}
    finally{setLoading(false);setProgress("");}
  };

  const sLabels={hook:"Gancho (3s)",emotion:"Emoção",retention:"Retenção",shareable:"Compartilhável",trend:"Tendência",audio:"Áudio",editing:"Edição"};
  const canAnalyze=mode==="upload"?!!file:!!videoUrl.trim();

  return(
    <div>
      <div style={{display:"flex",gap:5,marginBottom:16}}>
        {[{id:"upload",label:"Enviar arquivo"},{id:"url",label:"Colar URL"}].map(m=>(
          <Chip key={m.id} active={mode===m.id} onClick={()=>{setMode(m.id);setAnalysis(null);setFile(null);setPreview(null);setVideoUrl("");}}>
            {m.label}
          </Chip>
        ))}
      </div>

      {mode==="upload"&&(
        <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={()=>!file&&inputRef.current?.click()}
          style={{border:`1px dashed ${drag?C.blue:C.border}`,borderRadius:8,padding:file?"12px":"32px 20px",textAlign:"center",cursor:file?"default":"pointer",background:drag?C.blueDim:C.surface,marginBottom:14,transition:"all 0.15s"}}>
          <input ref={inputRef} type="file" accept="video/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          {!file?(
            <>
              <p style={{margin:"0 0 3px",fontSize:13,color:C.textMid}}>Arraste ou clique para selecionar</p>
              <p style={{margin:0,fontSize:11,color:C.textDim}}>MP4 · MOV · AVI</p>
            </>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {preview&&<video src={preview} style={{width:64,height:64,objectFit:"cover",borderRadius:5,flexShrink:0}} muted/>}
              <div style={{flex:1,textAlign:"left"}}>
                <p style={{margin:"0 0 2px",fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</p>
                <p style={{margin:0,fontSize:11,color:C.textDim}}>{(file.size/1024/1024).toFixed(1)} MB</p>
              </div>
              <button onClick={e=>{e.stopPropagation();setFile(null);setPreview(null);setAnalysis(null);}}
                style={{border:`1px solid ${C.border}`,background:"transparent",color:C.textDim,borderRadius:4,padding:"4px 8px",fontSize:11,cursor:"pointer"}}>trocar</button>
            </div>
          )}
        </div>
      )}

      {mode==="url"&&(
        <div style={{marginBottom:14}}>
          <FieldInput value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://www.tiktok.com/... ou youtube.com/shorts/..." mono/>
        </div>
      )}

      <PrimaryBtn onClick={analyze} disabled={!canAnalyze||loading} fullWidth>
        {loading?<><Spin/> {progress||"analisando..."}</>:"Analisar potencial viral"}
      </PrimaryBtn>

      {analysis&&(
        <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{display:"flex",alignItems:"center",gap:16}}>
            <ScoreRing score={analysis.viralScore} size={90}/>
            <div>
              <Label>Potencial viral</Label>
              <p style={{margin:"5px 0 8px",fontSize:13,color:C.text,lineHeight:1.4}}>{analysis.verdict}</p>
              {analysis.bestPlatform&&<Chip active>{analysis.bestPlatform}</Chip>}
            </div>
          </Card>

          {(analysis.estimatedReach||analysis.bestPostTime)&&(
            <Card>
              {analysis.estimatedReach&&(
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:12,color:C.textMid}}>Alcance estimado</span>
                  <span style={{fontSize:12,fontWeight:500,color:C.blue,fontFamily:"'JetBrains Mono',monospace"}}>{analysis.estimatedReach}</span>
                </div>
              )}
              {analysis.bestPostTime&&(
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                  <span style={{fontSize:12,color:C.textMid}}>Melhor horário</span>
                  <span style={{fontSize:12,fontWeight:500,color:C.blue,fontFamily:"'JetBrains Mono',monospace"}}>{analysis.bestPostTime}</span>
                </div>
              )}
            </Card>
          )}

          {analysis.scores&&(
            <Card>
              <Label>Breakdown</Label>
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:9}}>
                {Object.entries(analysis.scores).map(([k,v])=>(
                  <div key={k}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:C.textMid}}>{sLabels[k]||k}</span>
                      <span style={{fontSize:11,fontWeight:600,color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{v}/10</span>
                    </div>
                    <Bar value={v*10}/>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {analysis.hookSuggestion&&(
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <Label>Gancho sugerido</Label><CopyBtn text={analysis.hookSuggestion}/>
              </div>
              <p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.5,fontStyle:"italic"}}>"{analysis.hookSuggestion}"</p>
            </Card>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {analysis.strengths?.length>0&&(
              <Card>
                <Label>Pontos fortes</Label>
                <div style={{marginTop:7}}>{analysis.strengths.map((s,i)=><p key={i} style={{margin:"0 0 4px",fontSize:11,color:C.textMid,lineHeight:1.4}}>· {s}</p>)}</div>
              </Card>
            )}
            {analysis.improvements?.length>0&&(
              <Card>
                <Label>Melhorar</Label>
                <div style={{marginTop:7}}>{analysis.improvements.map((s,i)=><p key={i} style={{margin:"0 0 4px",fontSize:11,color:C.textMid,lineHeight:1.4}}>· {s}</p>)}</div>
              </Card>
            )}
          </div>

          <GhostBtn onClick={()=>{setFile(null);setPreview(null);setVideoUrl("");setAnalysis(null);}}>↩ Analisar outro vídeo</GhostBtn>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOOL 3 — VIRAL SCORE
════════════════════════════════════════════ */

function ViralScoreChecker(){
  const[scores,setScores]=useState({});
  const total=Math.round(VIRAL_CRITERIA.reduce((acc,c)=>acc+((scores[c.id]?.score||0)/10)*c.weight,0));
  const set=(id,v)=>setScores(p=>({...p,[id]:{score:v}}));
  return(
    <div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
        {VIRAL_CRITERIA.map(c=>(
          <Card key={c.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <p style={{margin:"0 0 2px",fontSize:13,fontWeight:500,color:C.text}}>{c.label}</p>
                <p style={{margin:0,fontSize:11,color:C.textDim}}>{c.description}</p>
              </div>
              <span style={{fontSize:10,color:C.textDim,fontFamily:"'JetBrains Mono',monospace"}}>×{c.weight}</span>
            </div>
            <div style={{display:"flex",gap:3}}>
              {[0,1,2,3,4,5,6,7,8,9,10].map(v=>(
                <button key={v} onClick={()=>set(c.id,v*10)}
                  style={{width:25,height:25,borderRadius:4,border:`1px solid ${scores[c.id]?.score===v*10?C.blue:C.border}`,background:scores[c.id]?.score===v*10?C.blueDim:"transparent",color:scores[c.id]?.score===v*10?C.blue:C.textDim,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.1s"}}>
                  {v}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(scores).length>=4&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <Card style={{width:"100%",display:"flex",alignItems:"center",gap:16}}>
            <ScoreRing score={total} size={90}/>
            <div>
              <Label>Score viral</Label>
              <p style={{margin:"5px 0 4px",fontSize:22,fontWeight:700,color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{total}<span style={{fontSize:11,color:C.textDim}}>/100</span></p>
              <p style={{margin:0,fontSize:12,color:total>=80?C.blue:total>=60?C.success:C.textDim}}>
                {total>=80?"Alto potencial":total>=60?"Bom potencial":total>=40?"Potencial médio":"Baixo potencial"}
              </p>
            </div>
          </Card>
          <RadarChart scores={scores}/>
          <GhostBtn onClick={()=>setScores({})}>Resetar avaliação</GhostBtn>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOOL 4 — CONTENT IDEAS
════════════════════════════════════════════ */

function ContentIdeasGenerator(){
  const[niche,setNiche]=useState("");
  const[platform,setPlatform]=useState("tiktok");
  const[format,setFormat]=useState("short");
  const[ideas,setIdeas]=useState([]);
  const[loading,setLoading]=useState(false);
  const formats=[{id:"short",label:"Short/Reels (<60s)"},{id:"long",label:"Vídeo longo (>5min)"},{id:"carousel",label:"Carrossel"},{id:"story",label:"Story/Flick"}];

  const generate=async()=>{
    if(!niche.trim())return;
    setLoading(true);setIdeas([]);
    try{
      const apiKey=import.meta.env.VITE_GEMINI_API_KEY;
      const prompt=`Gere 5 ideias virais. Nicho: ${niche}. Plataforma: ${PLATFORMS.find(p=>p.id===platform)?.label}. Formato: ${formats.find(f=>f.id===format)?.label}.
JSON array: [{"title":"título","hook":"gancho 3s","structure":"intro→dev→CTA","viralFactor":"por que viraliza"}]`;
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.9,maxOutputTokens:2048}}),
      });
      const d=await r.json();
      const raw=d?.candidates?.[0]?.content?.parts?.[0]?.text||"[]";
      const m=raw.match(/\[[\s\S]*\]/);
      if(m)setIdeas(JSON.parse(m[0]));
    }catch(e){console.error(e);}finally{setLoading(false);}
  };

  return(
    <div>
      <div style={{marginBottom:14}}>
        <div style={{marginBottom:6}}><Label>Seu nicho</Label></div>
        <FieldInput value={niche} onChange={e=>setNiche(e.target.value)} placeholder="Ex: finanças pessoais para millennials"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div><div style={{marginBottom:5}}><Label>Plataforma</Label></div><FieldSelect value={platform} onChange={e=>setPlatform(e.target.value)}>{PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</FieldSelect></div>
        <div><div style={{marginBottom:5}}><Label>Formato</Label></div><FieldSelect value={format} onChange={e=>setFormat(e.target.value)}>{formats.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</FieldSelect></div>
      </div>
      <PrimaryBtn onClick={generate} disabled={!niche.trim()||loading} fullWidth>
        {loading?<><Spin/> gerando...</>:"Gerar 5 ideias virais"}
      </PrimaryBtn>
      {ideas.length>0&&(
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:7}}>
          {ideas.map((idea,i)=>(
            <Card key={i}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <span style={{fontSize:10,color:C.textDim,fontFamily:"'JetBrains Mono',monospace",flexShrink:0,paddingTop:1}}>{String(i+1).padStart(2,"0")}</span>
                <p style={{margin:0,fontSize:13,fontWeight:500,color:C.text,lineHeight:1.3}}>{idea.title}</p>
              </div>
              {[["Hook",idea.hook],["Estrutura",idea.structure],["Fator viral",idea.viralFactor]].map(([lbl,val])=>(
                <div key={lbl} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><Label>{lbl}</Label><CopyBtn text={val}/></div>
                  <p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.4}}>{val}</p>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOOL 5 — CAPTIONS
════════════════════════════════════════════ */

function CaptionGenerator(){
  const[topic,setTopic]=useState("");
  const[tone,setTone]=useState("engajamento");
  const[captions,setCaptions]=useState([]);
  const[loading,setLoading]=useState(false);
  const tones=["engajamento","informativo","storytelling","provocativo","inspiracional"];

  const generate=async()=>{
    if(!topic.trim())return;
    setLoading(true);setCaptions([]);
    try{
      const apiKey=import.meta.env.VITE_GEMINI_API_KEY;
      const prompt=`Crie 3 legendas para Instagram/TikTok sobre "${topic}" no tom: ${tone}. Com gancho, desenvolvimento, CTA e hashtags.
JSON: [{"caption":"texto","cta":"chamada","hooks":"primeira linha"}]`;
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.85,maxOutputTokens:2048}}),
      });
      const d=await r.json();
      const raw=d?.candidates?.[0]?.content?.parts?.[0]?.text||"[]";
      const m=raw.match(/\[[\s\S]*\]/);
      if(m)setCaptions(JSON.parse(m[0]));
    }catch(e){console.error(e);}finally{setLoading(false);}
  };

  return(
    <div>
      <div style={{marginBottom:14}}>
        <div style={{marginBottom:6}}><Label>Assunto do post</Label></div>
        <FieldInput value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Ex: 3 erros que estão te impedindo de crescer"/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{marginBottom:8}}><Label>Tom</Label></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {tones.map(t=><Chip key={t} active={tone===t} onClick={()=>setTone(t)}>{t}</Chip>)}
        </div>
      </div>
      <PrimaryBtn onClick={generate} disabled={!topic.trim()||loading} fullWidth>
        {loading?<><Spin/> criando...</>:"Gerar legendas"}
      </PrimaryBtn>
      {captions.length>0&&(
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:7}}>
          {captions.map((cap,i)=>(
            <Card key={i}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><Label>Legenda {i+1}</Label><CopyBtn text={cap.caption}/></div>
              {cap.hooks&&<p style={{margin:"0 0 6px",fontSize:13,fontWeight:500,color:C.blue}}>{cap.hooks}</p>}
              <p style={{margin:0,fontSize:12,color:C.textMid,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{cap.caption}</p>
              {cap.cta&&<p style={{margin:"7px 0 0",fontSize:11,color:C.textDim}}>→ {cap.cta}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   TOOL 6 — THUMBNAIL
════════════════════════════════════════════ */

function ThumbnailAnalyzer(){
  const[url,setUrl]=useState("");
  const[analysis,setAnalysis]=useState(null);
  const[loading,setLoading]=useState(false);

  const analyze=async()=>{
    if(!url.trim())return;
    setLoading(true);setAnalysis(null);
    try{
      const apiKey=import.meta.env.VITE_GEMINI_API_KEY;
      const imgRes=await fetch(url);
      const blob=await imgRes.blob();
      const base64=await new Promise(res=>{const r=new FileReader();r.onloadend=()=>res(r.result.split(",")[1]);r.readAsDataURL(blob);});
      const prompt=`Analise esta thumbnail. Avalie 0-10: clareza, emoção, texto, cores, CTR.
JSON: {"overallScore":<0-100>,"scores":{"clarity":<0-10>,"emotion":<0-10>,"text":<0-10>,"colors":<0-10>,"ctr":<0-10>},"strengths":["s1","s2"],"improvements":["m1","m2"],"verdict":"frase"}`;
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({contents:[{parts:[{inlineData:{mimeType:blob.type||"image/jpeg",data:base64}},{text:prompt}]}],generationConfig:{temperature:0.3,maxOutputTokens:1024}}),
      });
      const d=await r.json();
      const raw=d?.candidates?.[0]?.content?.parts?.[0]?.text||"{}";
      const m=raw.match(/\{[\s\S]*\}/);
      if(m)setAnalysis(JSON.parse(m[0]));
    }catch(e){console.error(e);}finally{setLoading(false);}
  };

  const sLabels={clarity:"Clareza",emotion:"Emoção",text:"Texto",colors:"Cores",ctr:"CTR"};

  return(
    <div>
      <div style={{marginBottom:14}}>
        <div style={{marginBottom:6}}><Label>URL da imagem</Label></div>
        <FieldInput value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://i.ytimg.com/vi/..." mono/>
      </div>
      {url&&<div style={{marginBottom:14}}><img src={url} alt="preview" onError={e=>e.target.style.display="none"} style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:7,border:`1px solid ${C.border}`}}/></div>}
      <PrimaryBtn onClick={analyze} disabled={!url.trim()||loading} fullWidth>
        {loading?<><Spin/> analisando...</>:"Analisar thumbnail"}
      </PrimaryBtn>
      {analysis&&(
        <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
          <Card style={{display:"flex",alignItems:"center",gap:16}}>
            <ScoreRing score={analysis.overallScore} size={90}/>
            <div><Label>Resultado</Label><p style={{margin:"5px 0 0",fontSize:13,color:C.textMid,lineHeight:1.4}}>{analysis.verdict}</p></div>
          </Card>
          {analysis.scores&&(
            <Card>
              <Label>Breakdown</Label>
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:9}}>
                {Object.entries(analysis.scores).map(([k,v])=>(
                  <div key={k}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,color:C.textMid}}>{sLabels[k]||k}</span>
                      <span style={{fontSize:11,fontWeight:600,color:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{v}/10</span>
                    </div>
                    <Bar value={v*10}/>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {analysis.strengths?.length>0&&<Card><Label>Pontos fortes</Label><div style={{marginTop:7}}>{analysis.strengths.map((s,i)=><p key={i} style={{margin:"0 0 4px",fontSize:11,color:C.textMid}}>· {s}</p>)}</div></Card>}
            {analysis.improvements?.length>0&&<Card><Label>Melhorias</Label><div style={{marginTop:7}}>{analysis.improvements.map((s,i)=><p key={i} style={{margin:"0 0 4px",fontSize:11,color:C.textMid}}>· {s}</p>)}</div></Card>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════ */

const SW = 216; // sidebar width

export default function ViralToolkit(){
  const[active,setActive]=useState("radar");
  const[mobileOpen,setMobileOpen]=useState(false);
  const tool=TOOLS.find(t=>t.id===active);

  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";link.href=FONTS_URL;
    document.head.appendChild(link);
    return()=>document.head.removeChild(link);
  },[]);

  const renderTool=()=>{
    if(active==="radar")     return <TrendRadarSection/>;
    if(active==="video")     return <VideoAnalyzer/>;
    if(active==="viral")     return <ViralScoreChecker/>;
    if(active==="ideas")     return <ContentIdeasGenerator/>;
    if(active==="captions")  return <CaptionGenerator/>;
    if(active==="thumbnail") return <ThumbnailAnalyzer/>;
    return null;
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter',sans-serif",color:C.text,display:"flex"}}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse_{0%,100%{opacity:.35}50%{opacity:.6}}
        input::placeholder,textarea::placeholder{color:${C.textDim};}
        select option{background:#0a0a0a;color:#fff;}
        button:focus-visible{outline:2px solid ${C.blue};outline-offset:2px;}
        @media(max-width:680px){
          .vt-sidebar{transform:translateX(-100%);transition:transform .22s ease;position:fixed!important;z-index:100;}
          .vt-sidebar.open{transform:translateX(0);}
          .vt-overlay{display:block!important;}
          .vt-main{margin-left:0!important;}
          .vt-mobile-bar{display:flex!important;}
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className={`vt-sidebar${mobileOpen?" open":""}`}
        style={{width:SW,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,overflowY:"auto"}}>

        {/* Logo */}
        <div style={{padding:"18px 14px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:26,height:26,borderRadius:5,border:`1px solid ${C.blueBorder}`,background:C.blueDim,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke={C.blue} strokeWidth="1"/>
              <circle cx="6" cy="6" r="2" fill={C.blue}/>
              <line x1="6" y1="0.5" x2="6" y2="1.5" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
              <line x1="6" y1="10.5" x2="6" y2="11.5" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
              <line x1="0.5" y1="6" x2="1.5" y2="6" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
              <line x1="10.5" y1="6" x2="11.5" y2="6" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.text,letterSpacing:"-0.01em"}}>Viral Toolkit</div>
            <div style={{fontSize:9,color:C.textDim,fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>gemini · v2</div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 8px"}}>
          <div style={{padding:"4px 6px 8px"}}><Label>Ferramentas</Label></div>
          {TOOLS.map(t=>{
            const on=active===t.id;
            return(
              <button key={t.id} onClick={()=>{setActive(t.id);setMobileOpen(false);}}
                style={{width:"100%",padding:"8px 10px",borderRadius:5,border:`1px solid ${on?C.blueBorder:"transparent"}`,background:on?C.blueDim:"transparent",color:on?C.blue:C.textMid,fontSize:12,fontWeight:on?500:400,cursor:"pointer",transition:"all 0.12s",textAlign:"left",display:"flex",alignItems:"center",gap:8,marginBottom:1}}
                onMouseEnter={e=>{if(!on){e.currentTarget.style.background=C.surfaceHover;e.currentTarget.style.color=C.text;}}}
                onMouseLeave={e=>{if(!on){e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.textMid;}}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:on?C.blue:"transparent",border:`1px solid ${on?C.blue:C.border}`,flexShrink:0,transition:"all 0.12s"}}/>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
          <p style={{fontSize:9,color:C.textDim,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.8}}>
            gemini-2.0-flash<br/>google search grounding
          </p>
        </div>
      </div>

      {/* Mobile overlay */}
      <div className="vt-overlay" onClick={()=>setMobileOpen(false)}
        style={{display:"none",position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:50}}/>

      {/* ── MAIN ── */}
      <div className="vt-main" style={{marginLeft:SW,flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>

        {/* Mobile topbar */}
        <div className="vt-mobile-bar"
          style={{display:"none",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,background:C.bg,zIndex:30}}>
          <button onClick={()=>setMobileOpen(true)}
            style={{width:30,height:30,borderRadius:5,border:`1px solid ${C.border}`,background:"transparent",color:C.text,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
            ☰
          </button>
          <span style={{fontSize:13,fontWeight:500}}>{tool?.label}</span>
        </div>

        {/* Page header */}
        <div style={{padding:"24px 24px 18px",borderBottom:`1px solid ${C.border}`}}>
          <h1 style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:3,letterSpacing:"-0.01em"}}>{tool?.label}</h1>
          <p style={{fontSize:12,color:C.textDim}}>{tool?.description}</p>
        </div>

        {/* Content */}
        <div style={{padding:"22px 24px 60px",maxWidth:660,width:"100%"}}>
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
