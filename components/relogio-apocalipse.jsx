import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const YEAR_START = 2024;
const YEAR_END = 2124;
const OFFICIAL_S = 85;
const HOUR_S = 3600;
const AGGRAVATION_DATE = new Date("2026-01-28T12:00:00Z");
const NEXT_REVIEW_DATE = new Date("2027-01-20T15:00:00Z");

const CAT_COLOR = {
  NUCLEAR: "#c8341c", CLIMA: "#c87820", IA: "#2890a8",
  BIOLÓGICO: "#289850", GEOPOLÍTICO: "#8830a8", CÓSMICO: "#a8a020",
};
const CAT_LABEL = {
  NUCLEAR: "NUCLEAR", CLIMA: "CLIMÁTICO", IA: "INT. ARTIFICIAL",
  BIOLÓGICO: "BIOLÓGICO", GEOPOLÍTICO: "GEOPOLÍTICO", CÓSMICO: "CÓSMICO",
};
const LOADING_MSGS = [
  "VARRENDO FREQUÊNCIAS GLOBAIS...",
  "CALCULANDO VETORES DE EXTINÇÃO...",
  "INTERCEPTANDO TRANSMISSÕES...",
  "ANALISANDO AMEAÇAS EXISTENCIAIS...",
  "CONSULTANDO ARQUIVOS CLASSIFICADOS...",
];
const PAGES = ["relogio", "oraculo", "violencia", "loja"];
const PAGE_LABELS = { relogio: "RELÓGIO", oraculo: "ORÁCULO", violencia: "BR", loja: "LOJA" };

const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM · IA MILITAR SEM SUPERVISÃO · TEMPERATURA GLOBAL BATE RECORDE",
  violencia_br: 73,
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES EM EXPANSÃO", manchete_real: "Potências expandem ogivas sem tratados ativos", interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental: 34% em 18 anos.", impacto_anos: 3.2, categoria: "NUCLEAR", probabilidade: 72, gravidade: 9 },
    { titulo: "IA MILITAR SEM APROVAÇÃO HUMANA", manchete_real: "Sistemas autônomos sem loop humano", interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana. Tempo de escalada cai para 11 minutos.", impacto_anos: 4.7, categoria: "IA", probabilidade: 61, gravidade: 10 },
    { titulo: "RECORDE DE TEMPERATURA GLOBAL", manchete_real: "2025 o ano mais quente da história", interpretacao: "Terceiro ano consecutivo de recordes. Colapso agrícola revisado para 2041.", impacto_anos: 2.1, categoria: "CLIMA", probabilidade: 89, gravidade: 8 },
  ],
};

const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação.", price: "R$ 19,90", badge: "MAIS VENDIDO" },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração.", price: "R$ 24,90", badge: null },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle Humano", desc: "38 páginas. IA autônoma, cenários 2030-2050.", price: "R$ 19,90", badge: "NOVO" },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto.", price: "R$ 44,90", badge: "ECONOMIA" },
];

const AFFILIATES = [
  { icon: "📻", name: "Rádio Solar de Emergência", cat: "COMUNICAÇÃO", store: "Amazon" },
  { icon: "💧", name: "Filtro de Água LifeStraw", cat: "SOBREVIVÊNCIA", store: "Amazon" },
  { icon: "🧰", name: "Kit Primeiros Socorros Pro", cat: "MÉDICO", store: "Amazon" },
  { icon: "🔦", name: "Lanterna Tática 1000lm", cat: "EQUIPAMENTO", store: "Amazon" },
  { icon: "🥫", name: "Ração de Emergência 72h", cat: "ALIMENTAÇÃO", store: "Shopee" },
  { icon: "☢", name: "Dosímetro de Radiação", cat: "NUCLEAR", store: "Amazon" },
];

// ═══════════════════════════════════════════
// MATH
// ═══════════════════════════════════════════
function secondsToYear(s) { return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START); }
function yearsLeft(s) { return YEAR_END - secondsToYear(s); }
function predYear(s) {
  const yr = secondsToYear(s), y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)], full: yr };
}
function dangerPct(s) { return ((HOUR_S - s) / HOUR_S) * 100; }
function getMidMs() { const n = new Date(), m = new Date(n); m.setHours(24,0,0,0); return m - n; }
function padZ(n, l = 2) { return String(n).padStart(l, "0"); }
function fmtMs(ms) {
  const s = Math.floor(ms / 1000);
  return { h: padZ(Math.floor(s/3600)), m: padZ(Math.floor((s%3600)/60)), s: padZ(s%60), ms: padZ(Math.floor(ms%1000),3) };
}
function fmtDuration(ms) {
  const s = Math.floor(ms/1000), d = Math.floor(s/86400), h = Math.floor((s%86400)/3600), m = Math.floor((s%3600)/60);
  return { d, h: padZ(h), m: padZ(m), s: padZ(s%60) };
}

// ═══════════════════════════════════════════
// FEEDS + AI
// ═══════════════════════════════════════════
const FEEDS = [
  "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://feeds.bbci.co.uk/portuguese/rss.xml"),
  "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://rss.dw.com/rdf/rss-port-all"),
];
function parseRSS(xml) {
  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return Array.from(doc.querySelectorAll("item")).slice(0,7).map(i => ({ title: i.querySelector("title")?.textContent || "" })).filter(i => i.title);
  } catch { return []; }
}
async function fetchFeeds() {
  const all = [];
  for (const u of FEEDS) { try { const r = await fetch(u, { signal: AbortSignal.timeout(6000) }); all.push(...parseRSS(await r.text())); } catch {} }
  return all.slice(0, 8);
}
async function callOracle(items) {
  const hl = items.map((it, i) => `${i+1}. ${it.title}`).join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1600,
      system: `Você é o ALGORITMO CRONOS. Analise manchetes e calcule impacto no prazo de extinção humana. Responda SOMENTE JSON válido sem markdown. {"ajuste_segundos":inteiro -20 a 30,"veredicto":"frase sombria","ticker":"manchete curta","violencia_br":0-100,"previsoes":[{"titulo":"MAIÚSCULAS máx 7 palavras","manchete_real":"resumida","interpretacao":"2-3 frases","impacto_anos":decimal,"categoria":"NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO","probabilidade":1-99,"gravidade":1-10}]}`,
      messages: [{ role: "user", content: `Analise:\n${hl}` }],
    }),
  });
  const d = await res.json();
  const t = d.content?.map(c => c.text || "").join("") || "{}";
  try { return JSON.parse(t.replace(/```json|```/g,"").trim()); } catch { return null; }
}

// ═══════════════════════════════════════════
// STEAMPUNK CLOCK
// ═══════════════════════════════════════════
function SteampunkClock({ seconds, glitch, pulse }) {
  const S = 280, cx = S/2, cy = S/2, R = S/2;
  const fraction = seconds / HOUR_S;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;
  const [gearAngle, setGearAngle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setGearAngle(a => a + 0.4), 50);
    return () => clearInterval(t);
  }, []);

  function GearPath({ x, y, r, teeth, angle }) {
    let d = "";
    const th = r * 0.32, tw = 0.55;
    for (let i = 0; i < teeth; i++) {
      const a1 = ((i-tw/2)/teeth)*Math.PI*2+angle, a2 = ((i+tw/2)/teeth)*Math.PI*2+angle;
      const a3 = ((i+0.5-tw/2)/teeth)*Math.PI*2+angle, a4 = ((i+0.5+tw/2)/teeth)*Math.PI*2+angle;
      const ro = r + th;
      if (i === 0) d += `M${x+Math.cos(a1)*r} ${y+Math.sin(a1)*r}`;
      d += ` L${x+Math.cos(a1)*r} ${y+Math.sin(a1)*r} L${x+Math.cos(a3)*ro} ${y+Math.sin(a3)*ro} L${x+Math.cos(a4)*ro} ${y+Math.sin(a4)*ro} L${x+Math.cos(a2)*r} ${y+Math.sin(a2)*r}`;
    }
    return <path d={d+"Z"} fill="#3d2a0a" stroke="#6b4a1a" strokeWidth="0.7" />;
  }

  const gears = [
    { x: cx-R*0.60, y: cy-R*0.58, r: R*0.11, teeth: 11, speed: 0.8 },
    { x: cx+R*0.63, y: cy-R*0.56, r: R*0.085, teeth: 9, speed: -1.2 },
    { x: cx-R*0.65, y: cy+R*0.53, r: R*0.09, teeth: 10, speed: 1.0 },
    { x: cx+R*0.60, y: cy+R*0.58, r: R*0.075, teeth: 8, speed: -0.9 },
  ];

  const markers = Array.from({ length: 60 }, (_, i) => {
    const a = (i/60)*Math.PI*2 - Math.PI/2, major = i%5===0;
    return { x1: cx+Math.cos(a)*R*(major?0.76:0.82), y1: cy+Math.sin(a)*R*(major?0.76:0.82), x2: cx+Math.cos(a)*R*0.88, y2: cy+Math.sin(a)*R*0.88, major, zero: i===0 };
  });

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{
      display: "block", maxWidth: "100%",
      transform: `scale(${pulse ? 1.012 : 1.0})`,
      filter: glitch ? "drop-shadow(0 0 22px #c8341ccc)" : pulse ? "drop-shadow(0 0 18px #c8901a99)" : "drop-shadow(0 0 8px #8b5a0a55)",
      transition: "filter 0.6s, transform 0.15s ease-out",
    }}>
      <defs>
        <radialGradient id="fg2" cx="50%" cy="40%"><stop offset="0%" stopColor="#1a1005"/><stop offset="100%" stopColor="#0a0800"/></radialGradient>
        <radialGradient id="bg2" cx="50%" cy="30%"><stop offset="0%" stopColor="#5a3a10"/><stop offset="60%" stopColor="#3d2a08"/><stop offset="100%" stopColor="#1a1005"/></radialGradient>
        <pattern id="eng2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="8" y2="8" stroke="#2a1a05" strokeWidth="0.3"/></pattern>
      </defs>
      <circle cx={cx} cy={cy} r={R*0.99} fill="url(#bg2)" stroke="#7a5020" strokeWidth="2.5"/>
      {[0,90,180,270].map(a => { const rad=a*Math.PI/180; return <circle key={a} cx={cx+Math.cos(rad)*R*0.93} cy={cy+Math.sin(rad)*R*0.93} r={R*0.024} fill="#8b6020" stroke="#6b4a10" strokeWidth="1"/>; })}
      <circle cx={cx} cy={cy} r={R*0.95} fill="url(#eng2)" opacity="0.35"/>
      {gears.map((g, i) => <GearPath key={i} x={g.x} y={g.y} r={g.r} teeth={g.teeth} angle={gearAngle*g.speed*Math.PI/180}/>)}
      {gears.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r*0.28} fill="#5a3a10" stroke="#8b6020" strokeWidth="0.8"/>)}
      <circle cx={cx} cy={cy} r={R*0.79} fill="url(#fg2)"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="url(#eng2)" opacity="0.15"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="none" stroke="#5a3a10" strokeWidth="1.5"/>
      {Array.from({length:18},(_,i) => { const frac=i/60, a=-Math.PI/2+frac*Math.PI*2; return <line key={i} x1={cx+Math.cos(a)*R*0.40} y1={cy+Math.sin(a)*R*0.40} x2={cx+Math.cos(a)*R*0.79} y2={cy+Math.sin(a)*R*0.79} stroke={`rgba(200,52,28,${0.055-frac*0.003})`} strokeWidth="5"/>; })}
      {[0.64,0.50,0.36].map((r,i) => <circle key={i} cx={cx} cy={cy} r={R*r} fill="none" stroke="#2a1a06" strokeWidth="0.5"/>)}
      {markers.map((m,i) => <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.zero?"#c8341c":m.major?"#6b4a1a":"#2a1a06"} strokeWidth={m.zero?2:m.major?1.5:0.5}/>)}
      <text x={cx} y={cy-R*0.64} textAnchor="middle" dominantBaseline="middle" fill="#c8901a" fontSize={R*0.076} fontFamily="Georgia,serif" letterSpacing="2">XII</text>
      {[{l:"XI",a:-Math.PI/2-Math.PI/6},{l:"I",a:-Math.PI/2+Math.PI/6}].map((h,i) => <text key={i} x={cx+Math.cos(h.a)*R*0.62} y={cy+Math.sin(h.a)*R*0.62} textAnchor="middle" dominantBaseline="middle" fill="#5a3a10" fontSize={R*0.062} fontFamily="Georgia,serif">{h.l}</text>)}
      <text x={cx} y={cy-R*0.52} textAnchor="middle" dominantBaseline="middle" fill="#4a2a08" fontSize={R*0.029} fontFamily="Courier New,monospace" letterSpacing="3">MEIA-NOITE</text>
      <text x={cx} y={cy-R*0.17} textAnchor="middle" dominantBaseline="middle" fill="#4a2a08" fontSize={R*0.027} fontFamily="Courier New,monospace" letterSpacing="5">IT IS</text>
      <text x={cx} y={cy-R*0.055} textAnchor="middle" dominantBaseline="middle" fill="#c8341c" fontSize={R*0.082} fontFamily="Georgia,serif" fontWeight="bold" style={{transition:"all 1.5s ease"}}>{seconds}s</text>
      <text x={cx} y={cy+R*0.065} textAnchor="middle" dominantBaseline="middle" fill="#4a2a08" fontSize={R*0.027} fontFamily="Courier New,monospace" letterSpacing="3">TO MIDNIGHT</text>
      <text x={cx} y={cy+R*0.27} textAnchor="middle" dominantBaseline="middle" fill="#2a1a05" fontSize={R*0.024} fontFamily="Courier New,monospace" letterSpacing="3">BOLETIM DOS CIENTISTAS</text>
      <text x={cx} y={cy+R*0.34} textAnchor="middle" dominantBaseline="middle" fill="#2a1a05" fontSize={R*0.024} fontFamily="Courier New,monospace" letterSpacing="3">DO APOCALIPSE</text>
      <line x1={cx-Math.cos(handRad)*R*0.13+1.5} y1={cy-Math.sin(handRad)*R*0.13+1.5} x2={cx+Math.cos(handRad)*R*0.70+1.5} y2={cy+Math.sin(handRad)*R*0.70+1.5} stroke="#00000066" strokeWidth={R*0.026} strokeLinecap="round"/>
      <line x1={cx-Math.cos(handRad)*R*0.13} y1={cy-Math.sin(handRad)*R*0.13} x2={cx+Math.cos(handRad)*R*0.70} y2={cy+Math.sin(handRad)*R*0.70} stroke="#c8341c44" strokeWidth={R*0.065} strokeLinecap="round"/>
      <line x1={cx-Math.cos(handRad)*R*0.13} y1={cy-Math.sin(handRad)*R*0.13} x2={cx+Math.cos(handRad)*R*0.70} y2={cy+Math.sin(handRad)*R*0.70} stroke="#c8341c" strokeWidth={R*0.022} strokeLinecap="round" style={{transition:"x2 2s cubic-bezier(0.4,0,0.2,1),y2 2s,x1 2s,y1 2s"}}/>
      <circle cx={cx} cy={cy} r={R*0.048} fill="#6b4a10" stroke="#8b6a20" strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r={R*0.026} fill="#c8901a"/>
      <circle cx={cx} cy={cy} r={R*0.011} fill="#e8c050"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="none" stroke="#c8341c" strokeWidth="1" opacity={pulse?0.18:0.06} style={{transition:"opacity 0.15s"}}/>
    </svg>
  );
}

// ═══════════════════════════════════════════
// DAILY CLOCK
// ═══════════════════════════════════════════
function DailyClock({ ms }) {
  const t = fmtMs(ms);
  const [blink, setBlink] = useState(true);
  const pct = (ms / 86400000) * 100;
  const urgency = pct < 10;
  const survived = ms <= 500;
  useEffect(() => { const i = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(i); }, []);
  const barColor = urgency ? "#c8341c" : pct < 30 ? "#c87820" : "#6b4a1a";
  return (
    <div style={{ border: `1px solid ${urgency?"#c8341c88":"#3a2008"}`, background: urgency?"#0f0300":"#060200", padding: "16px", width: "100%" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: urgency?"#c87060":"#7a4820", fontFamily: "Courier New,monospace", textAlign: "center", marginBottom: 12, fontStyle: "italic" }}>
        {survived ? "✓ SOBREVIVEMOS MAIS UM DIA" : urgency ? "⚠ AS HORAS FINAIS..." : "HOJE AINDA ESTAREMOS AQUI?"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 2, marginBottom: 10, flexWrap: "nowrap" }}>
        {[{v:t.h,l:"H"},{v:null},{v:t.m,l:"M"},{v:null},{v:t.s,l:"S"}].map((seg, i) => {
          if (seg.v === null) return <span key={i} style={{ fontSize: "clamp(22px,6vw,38px)", fontWeight: 700, color: urgency?"#c8341c":"#8b6020", opacity: blink?1:0.15, lineHeight: 1, margin: "0 1px", paddingBottom: 10 }}>:</span>;
          return (
            <div key={i} style={{ textAlign: "center", minWidth: "clamp(32px,8vw,52px)" }}>
              <div style={{ fontSize: "clamp(22px,6vw,38px)", fontWeight: 700, color: urgency?"#c8341c":"#c8901a", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{seg.v}</div>
              <div style={{ fontSize: 9, color: "#3a1808", letterSpacing: 2, marginTop: 2, fontFamily: "Courier New,monospace" }}>{seg.l}</div>
            </div>
          );
        })}
        <div style={{ marginLeft: 4, paddingBottom: 1 }}>
          <span style={{ fontSize: 11, color: "#8b602088", fontFamily: "Courier New,monospace" }}>.{t.ms}</span>
        </div>
      </div>
      <div style={{ height: 3, background: "#0a0400", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${barColor}44,${barColor})`, transition: "width 1s linear" }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2a1208", fontFamily: "Courier New,monospace", letterSpacing: 1, marginTop: 4 }}>
        <span>MEIA-NOITE</span><span style={{ color: barColor }}>{pct.toFixed(0)}% RESTANTE</span><span>00:00</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// HEARTBEAT COUNTERS
// ═══════════════════════════════════════════
function HeartbeatCounters({ sinceMs, untilMs }) {
  const since = fmtDuration(sinceMs), until = fmtDuration(untilMs);
  const [beat, setBeat] = useState(false);
  useEffect(() => { const t = setInterval(() => { setBeat(true); setTimeout(() => setBeat(false), 180); }, 1200); return () => clearInterval(t); }, []);
  const totalSpan = NEXT_REVIEW_DATE.getTime() - AGGRAVATION_DATE.getTime();
  const reviewPct = Math.min(100, ((totalSpan - untilMs) / totalSpan) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <div style={{ border: "1px solid #3a2008", background: "#060200", padding: "14px 16px" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 6 }}>◈ DESDE O ÚLTIMO AGRAVAMENTO</div>
        <div style={{ fontSize: 12, color: "#7a4820", marginBottom: 10, lineHeight: 1.5 }}>
          28 Jan 2026 → relógio foi a <span style={{ color: "#c8341c", fontWeight: 700 }}>85s</span>. O perigo persiste há:
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          {[{v:since.d,l:"DIAS"},{v:since.h,l:"H"},{v:since.m,l:"MIN"},{v:since.s,l:"SEG"}].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: i===0?"clamp(22px,5vw,32px)":"clamp(16px,4vw,22px)", fontWeight: 700, color: i===0?"#c8341c":"#8b5a20", fontFamily: "Courier New,monospace", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{seg.v}</div>
              <div style={{ fontSize: 9, color: "#3a1808", letterSpacing: 2, fontFamily: "Courier New,monospace", marginTop: 2 }}>{seg.l}</div>
            </div>
          ))}
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: beat?"#c8341c":"#2a0808", boxShadow: beat?"0 0 12px #c8341c":"none", transition: "background 0.1s, box-shadow 0.1s", alignSelf: "center", marginLeft: 4 }}/>
        </div>
      </div>

      <div style={{ border: "1px solid #3a2008", background: "#060200", padding: "14px 16px" }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 6 }}>◈ ATÉ A PRÓXIMA REVISÃO</div>
        <div style={{ fontSize: 12, color: "#7a4820", marginBottom: 10, lineHeight: 1.5 }}>
          Bulletin revisa em <span style={{ color: "#c8901a" }}>Jan 2027</span>. Vai piorar?
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
          {[{v:until.d,l:"DIAS"},{v:until.h,l:"H"},{v:until.m,l:"MIN"},{v:until.s,l:"SEG"}].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: i===0?"clamp(22px,5vw,32px)":"clamp(16px,4vw,22px)", fontWeight: 700, color: i===0?"#c8901a":"#8b5a20", fontFamily: "Courier New,monospace", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{seg.v}</div>
              <div style={{ fontSize: 9, color: "#3a1808", letterSpacing: 2, fontFamily: "Courier New,monospace", marginTop: 2 }}>{seg.l}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: "#0a0400" }}>
          <div style={{ height: "100%", width: `${reviewPct}%`, background: "linear-gradient(90deg,#3a1808,#c8901a)", transition: "width 1s" }}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEWS TICKER
// ═══════════════════════════════════════════
function NewsTicker({ text }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(400);
  const [w, setW] = useState(0);
  useEffect(() => { if (ref.current) setW(ref.current.scrollWidth); }, [text]);
  useEffect(() => {
    if (!w) return;
    let x = window.innerWidth || 400;
    const t = setInterval(() => { x -= 0.7; if (x < -w) x = window.innerWidth || 400; setPos(x); }, 16);
    return () => clearInterval(t);
  }, [w]);
  return (
    <div style={{ background: "#080300", borderTop: "1px solid #2a1208", borderBottom: "1px solid #2a1208", height: 32, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", zIndex: 2 }}>
        <div style={{ background: "#c8341c", padding: "0 12px", height: "100%", display: "flex", alignItems: "center", fontSize: 10, letterSpacing: 3, color: "#fff", fontFamily: "Courier New,monospace", fontWeight: 700, boxShadow: "4px 0 8px #00000088" }}>URGENTE</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 80, right: 0, overflow: "hidden" }}>
        <div ref={ref} style={{ position: "absolute", top: 0, whiteSpace: "nowrap", transform: `translateX(${pos}px)`, fontSize: 12, color: "#c8901a", fontFamily: "Courier New,monospace", letterSpacing: 2, lineHeight: "32px" }}>
          {`${text} ·· ${text} ·· ${text}`}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PREDICTION CARD
// ═══════════════════════════════════════════
function PredCard({ ev, active, onToggle }) {
  const col = CAT_COLOR[ev.categoria] || "#c8341c";
  const label = CAT_LABEL[ev.categoria] || ev.categoria;
  const worsens = ev.impacto_anos > 0;
  return (
    <div onClick={onToggle} style={{ border: `1px solid ${active?col+"55":"#2a1208"}`, background: active?`${col}09`:"#060200", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.25s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${col}${Math.round((ev.gravidade||5)/10*255).toString(16).padStart(2,"0")},transparent)` }}/>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: col, fontFamily: "Courier New,monospace", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#c8a070", lineHeight: 1.4 }}>{ev.titulo}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: worsens?"#c8341c":"#289850", fontFamily: "Courier New,monospace", lineHeight: 1 }}>{worsens?"+":"-"}{Math.abs(ev.impacto_anos).toFixed(1)}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a1808", fontFamily: "Courier New,monospace" }}>ANOS</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#7a4020", fontStyle: "italic", lineHeight: 1.5, borderLeft: "2px solid #2a1208", paddingLeft: 8, marginBottom: active?12:0 }}>"{ev.manchete_real}"</div>
        {active && (
          <div style={{ borderTop: "1px solid #1a0a04", paddingTop: 10, marginTop: 8 }}>
            <div style={{ fontSize: 13, color: "#8a5030", lineHeight: 1.75, marginBottom: 10 }}>{ev.interpretacao}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a1808", fontFamily: "Courier New,monospace", marginBottom: 3 }}>PROBABILIDADE</div>
                <div style={{ fontSize: 16, color: col, fontFamily: "Courier New,monospace", fontWeight: 700 }}>{ev.probabilidade}%</div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#3a1808", fontFamily: "Courier New,monospace", marginBottom: 3 }}>GRAVIDADE</div>
                <div style={{ display: "flex", gap: 2 }}>{Array.from({length:10},(_,i) => <div key={i} style={{ width: 9, height: 9, background: i<(ev.gravidade||0)?col:"#1a0a04" }}/>)}</div>
              </div>
            </div>
          </div>
        )}
        {!active && <div style={{ marginTop: 5, fontSize: 10, color: "#1a0a04", letterSpacing: 2, fontFamily: "Courier New,monospace" }}>EXPANDIR ▼</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VIOLENCE METER
// ═══════════════════════════════════════════
function ViolenceMeter({ value = 73 }) {
  const color = value>=80?"#c8341c":value>=60?"#c87820":value>=40?"#a89020":"#289850";
  const label = value>=80?"CRÍTICO":value>=60?"ALTO":value>=40?"MODERADO":"BAIXO";
  const STATES = [{name:"SP",v:82},{name:"RJ",v:78},{name:"BA",v:75},{name:"PE",v:71},{name:"CE",v:68},{name:"MG",v:52},{name:"RS",v:45},{name:"PR",v:42}];
  return (
    <div>
      <div style={{ border: "1px solid #3a2008", background: "#080400", padding: "20px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a2a08", fontFamily: "Courier New,monospace", marginBottom: 14 }}>ÍNDICE NACIONAL DE VIOLÊNCIA</div>
        <div style={{ position: "relative", width: 180, height: 100, margin: "0 auto 14px" }}>
          <svg width="180" height="100" viewBox="0 0 180 100">
            <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#1a0a04" strokeWidth="16" strokeLinecap="round"/>
            <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(value/100)*251} 251`}/>
            {(() => { const a=Math.PI-(value/100)*Math.PI; const nx=90+Math.cos(a)*70, ny=90-Math.sin(a)*70; return (<><line x1="90" y1="90" x2={nx} y2={ny} stroke="#c8341c" strokeWidth="2.5" strokeLinecap="round"/><circle cx="90" cy="90" r="6" fill="#5a3a10" stroke="#c8901a" strokeWidth="2"/></>); })()}
            <text x="90" y="82" textAnchor="middle" fill={color} fontSize="24" fontFamily="Georgia,serif" fontWeight="bold">{value}</text>
            <text x="10" y="98" fill="#3a1a08" fontSize="9" fontFamily="Courier New,monospace">BAIXO</text>
            <text x="138" y="98" fill="#3a1a08" fontSize="9" fontFamily="Courier New,monospace">ALTO</text>
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "Courier New,monospace", letterSpacing: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#5a2808", marginTop: 8 }}>+{(value/100*2.4).toFixed(1)} anos adicionados ao prazo</div>
      </div>
      <div style={{ border: "1px solid #3a2008", background: "#080400", padding: "16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a2a08", fontFamily: "Courier New,monospace", marginBottom: 12 }}>ESTADOS EM ALERTA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {STATES.map((st, i) => {
            const c = st.v>=75?"#c8341c":st.v>=60?"#c87820":"#a89020";
            return (
              <div key={i} style={{ border: `1px solid ${c}33`, background: "#060200", padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#c8901a", fontFamily: "Courier New,monospace" }}>{st.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: "Courier New,monospace" }}>{st.v}</span>
                </div>
                <div style={{ height: 3, background: "#0f0600" }}><div style={{ height: "100%", width: `${st.v}%`, background: c }}/></div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "12px 16px" }}>
        <div style={{ fontSize: 11, color: "#3a1808", fontFamily: "Courier New,monospace", lineHeight: 1.8 }}>◈ Índice calculado por IA com base em notícias públicas. Atualizado a cada consulta ao Oráculo.</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [seconds, setSeconds] = useState(OFFICIAL_S);
  const [previsoes, setPrevisoes] = useState([]);
  const [veredicto, setVeredicto] = useState("");
  const [tickerText, setTickerText] = useState("RELÓGIO DO JUÍZO FINAL · 85 SEGUNDOS PARA A MEIA-NOITE · RECORDE EM 79 ANOS DE HISTÓRIA");
  const [violencia, setViolencia] = useState(73);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const [midMs, setMidMs] = useState(getMidMs());
  const [sinceMs, setSinceMs] = useState(Date.now() - AGGRAVATION_DATE.getTime());
  const [untilMs, setUntilMs] = useState(NEXT_REVIEW_DATE.getTime() - Date.now());
  const [consultas, setConsultas] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [oracMsg, setOracMsg] = useState("");
  const [page, setPage] = useState("relogio");

  useEffect(() => {
    const t = setInterval(() => {
      setMidMs(getMidMs());
      setSinceMs(Date.now() - AGGRAVATION_DATE.getTime());
      setUntilMs(NEXT_REVIEW_DATE.getTime() - Date.now());
    }, 40);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 180); }, 1200);
    return () => clearInterval(t);
  }, []);

  async function consult() {
    if (loading) return;
    setLoading(true); setPhase("loading"); setActiveIdx(null);
    setOracMsg(LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);
    try {
      const items = await fetchFeeds();
      const r = (await callOracle(items.length ? items : [])) || MOCK;
      const newS = Math.max(10, Math.min(HOUR_S-10, seconds + (r.ajuste_segundos||0)));
      if (r.ticker) setTickerText(r.ticker.toUpperCase());
      if (r.violencia_br) setViolencia(r.violencia_br);
      setTimeout(() => { setSeconds(newS); setGlitch(true); }, 400);
      setTimeout(() => { setGlitch(false); }, 1800);
      setPrevisoes(r.previsoes || []);
      setVeredicto(r.veredicto || "");
      const pd = predYear(newS);
      setConsultas(prev => [{ ts: new Date().toLocaleTimeString("pt-BR"), seconds: newS, delta: r.ajuste_segundos||0, year: pd.y, veredicto: r.veredicto||"" }, ...prev].slice(0,6));
      setPhase("reveal");
    } catch {
      setPrevisoes(MOCK.previsoes); setVeredicto(MOCK.veredicto); setPhase("reveal");
    }
    setLoading(false);
  }

  const pd = predYear(seconds);
  const yl = yearsLeft(seconds);
  const dp = dangerPct(seconds);
  const tclr = seconds<=60?"#e83030":seconds<=90?"#c8341c":seconds<=120?"#c87020":"#c89020";
  const threat = seconds<=60?"CATASTRÓFICO":seconds<=90?"CRÍTICO":seconds<=120?"SEVERO":"ALTO";

  return (
    <div style={{ minHeight: "100vh", background: "#060200", color: "#c0a070", fontFamily: "Georgia,Times New Roman,serif", overflowX: "hidden", width: "100%" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.3} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; background: #060200; }
        ::-webkit-scrollbar-thumb { background: #3a2008; }
      `}</style>

      {/* Grain */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.15, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }}/>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center,transparent 30%,rgba(3,1,0,0.92) 100%)" }}/>

      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>

        {/* HEADER */}
        <header style={{ background: "rgba(6,2,0,0.98)", borderBottom: "1px solid #2a1208", width: "100%" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
            <div style={{ borderBottom: "1px solid #1a0a04", padding: "6px 0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, fontSize: 10, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New,monospace" }}>
              <span>BOLETIM DOS CIENTISTAS · EST. 1947</span>
              <span style={{ color: tclr }}>{threat} · {seconds}s</span>
            </div>
            <div style={{ padding: "12px 0 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "clamp(16px,4vw,30px)", fontWeight: 700, color: "#c8901a", letterSpacing: 3, fontFamily: "Georgia,serif", textShadow: glitch?"3px 0 #c8341c,-3px 0 #2890a8":"none", transition: "text-shadow 0.15s" }}>
                  RELÓGIO DO JUÍZO FINAL
                </div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New,monospace", marginTop: 3 }}>DOOMSDAY CLOCK · 2026</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, color: "#3a1808", fontFamily: "Courier New,monospace" }}>PREVISÃO</div>
                <div style={{ fontSize: "clamp(22px,5vw,40px)", fontWeight: 700, color: tclr, fontFamily: "Courier New,monospace", transition: "all 2s ease" }}>
                  {pd.y} <span style={{ fontSize: "0.4em", color: "#7a4020" }}>{pd.m}</span>
                </div>
              </div>
            </div>
            {/* NAV — scrollable on mobile */}
            <nav style={{ display: "flex", gap: 0, borderTop: "1px solid #1a0a04", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {PAGES.map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${page===p?"#c8341c":"transparent"}`,
                  color: page===p?"#c8901a":"#5a3010",
                  fontFamily: "Courier New,monospace", fontSize: 11, letterSpacing: 3,
                  padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}>{PAGE_LABELS[p]}</button>
              ))}
            </nav>
          </div>
        </header>

        <NewsTicker text={tickerText}/>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 80px", width: "100%" }}>

          {/* ══ RELÓGIO ══ */}
          {page === "relogio" && (
            <div>
              {/* Clock centered */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <SteampunkClock seconds={seconds} glitch={glitch} pulse={pulse}/>
              </div>

              {/* Predicted year */}
              <div style={{ border: `1px solid ${tclr}44`, background: "linear-gradient(160deg,#0e0600,#080400)", padding: "20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: `radial-gradient(ellipse at top right,${tclr}0c,transparent 70%)`, pointerEvents: "none" }}/>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 10 }}>◈ PREVISÃO DO COLAPSO CIVILIZACIONAL</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
                  <div style={{ fontSize: "clamp(56px,15vw,90px)", fontWeight: 700, color: tclr, lineHeight: 0.9, fontFamily: "Georgia,serif", textShadow: `0 0 40px ${tclr}44`, transition: "all 2s ease" }}>{pd.y}</div>
                  <div>
                    <div style={{ fontSize: "clamp(18px,4vw,26px)", color: "#c87040", fontFamily: "Courier New,monospace", letterSpacing: 4 }}>{pd.m}</div>
                    <div style={{ fontSize: 12, color: "#5a2808", fontFamily: "Courier New,monospace", marginTop: 4 }}>{yl.toFixed(1)} ANOS RESTANTES</div>
                  </div>
                </div>
                {/* Timeline */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#2a1208", fontFamily: "Courier New,monospace", marginBottom: 4 }}>
                    <span>2024</span><span>HOJE</span><span style={{ color: tclr+"99" }}>{pd.y}</span><span>2124</span>
                  </div>
                  <div style={{ height: 10, background: "#0a0400", border: "1px solid #1a0a04", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((2026-2024)/100)*100}%`, background: "#1a0804" }}/>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((2026-2024)/100)*100}%`, width: `${((pd.full-2026)/100)*100}%`, background: `linear-gradient(90deg,#3a1008,${tclr}33)` }}/>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((pd.full-2024)/100)*100}%`, width: 3, background: tclr, boxShadow: `0 0 6px ${tclr}` }}/>
                  </div>
                </div>
                {veredicto ? (
                  <div style={{ fontSize: 13, color: "#8a4030", fontStyle: "italic", lineHeight: 1.7, borderTop: "1px solid #1a0a04", paddingTop: 12, marginTop: 12 }}>"{veredicto}"</div>
                ) : (
                  <div style={{ fontSize: 13, color: "#3a1808", lineHeight: 1.7, borderTop: "1px solid #0f0600", paddingTop: 12, marginTop: 12 }}>
                    Baseado na leitura oficial de <span style={{ color: "#c8341c" }}>85 segundos</span> (Jan 2026). Escala: 1 hora = 100 anos.
                  </div>
                )}
              </div>

              {/* Oracle button */}
              <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "20px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New,monospace", marginBottom: 8 }}>ALGORITMO CRONOS · ANÁLISE GLOBAL</div>
                <div style={{ fontSize: 13, color: "#6a3810", lineHeight: 1.7, marginBottom: 16 }}>O Oráculo analisa o mundo em tempo real e recalcula a data do colapso. A cada consulta o relógio pode avançar ou recuar.</div>
                <button onClick={consult} disabled={loading} style={{
                  width: "100%", background: loading?"transparent":"linear-gradient(180deg,#180800,#0f0500)",
                  border: `1px solid ${loading?"#2a1208":tclr+"88"}`,
                  color: loading?"#3a1808":tclr, fontFamily: "Courier New,monospace",
                  fontSize: 14, letterSpacing: 4, padding: "16px 20px",
                  cursor: loading?"not-allowed":"pointer", transition: "all 0.4s",
                }}>
                  {loading ? <span style={{ animation: "blink 1.2s ease-in-out infinite" }}>◈  {oracMsg}</span> : "◈  CONSULTAR O ORÁCULO"}
                </button>
              </div>

              {/* Counters */}
              <HeartbeatCounters sinceMs={sinceMs} untilMs={untilMs}/>
              <div style={{ marginTop: 16 }}>
                <DailyClock ms={midMs}/>
              </div>

              {/* Historical ref */}
              <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "14px 16px", marginTop: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New,monospace", marginBottom: 12 }}>REFERÊNCIA HISTÓRICA OFICIAL</div>
                {[
                  { y: "1991", s: "17 min", n: "Mais seguro. Fim da Guerra Fria.", cur: false },
                  { y: "1947", s: "7 min", n: "Criação. Era Nuclear.", cur: false },
                  { y: "1953", s: "2 min", n: "Bombas de hidrogênio.", cur: false },
                  { y: "2023", s: "90s", n: "Guerra na Ucrânia.", cur: false },
                  { y: "2026", s: "85s", n: "Atual. Recorde histórico.", cur: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: i<4?"1px solid #0f0600":"none", opacity: r.cur?1:0.45 }}>
                    <span style={{ fontSize: 11, color: "#3a1808", fontFamily: "Courier New,monospace", width: 32, flexShrink: 0 }}>{r.y}</span>
                    <span style={{ fontSize: 12, color: r.cur?tclr:"#5a3010", fontFamily: "Courier New,monospace", fontWeight: r.cur?700:400, width: 42, flexShrink: 0 }}>{r.s}</span>
                    <span style={{ fontSize: 13, color: r.cur?"#c87060":"#3a1808" }}>{r.n}</span>
                  </div>
                ))}
              </div>

              {/* Consulta history */}
              {consultas.length > 0 && (
                <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "14px 16px", marginTop: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 3, color: "#2a1208", fontFamily: "Courier New,monospace", marginBottom: 10 }}>HISTÓRICO DE CONSULTAS</div>
                  {consultas.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: i<consultas.length-1?"1px solid #0a0400":"none", opacity: 1-i*0.13, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "#2a1208", fontFamily: "Courier New,monospace" }}>{c.ts}</span>
                      <span style={{ fontSize: 14, color: "#c8341c", fontFamily: "Courier New,monospace", fontWeight: 700 }}>{c.year}</span>
                      <span style={{ fontSize: 11, fontFamily: "Courier New,monospace", color: c.delta>0?"#c8341c":"#289850" }}>{c.delta>0?`+${c.delta}s`:`${c.delta}s`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ORÁCULO ══ */}
          {page === "oraculo" && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 16 }}>◈ PREVISÕES DO ALGORITMO CRONOS</div>
              {phase !== "reveal" ? (
                <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "28px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: "#6a3810", marginBottom: 20, lineHeight: 1.7 }}>Nenhuma análise realizada. Volte na aba Relógio e consulte o Oráculo.</div>
                  <button onClick={() => { setPage("relogio"); setTimeout(consult, 200); }} style={{ background: "transparent", border: `1px solid ${tclr}88`, color: tclr, fontFamily: "Courier New,monospace", fontSize: 13, letterSpacing: 4, padding: "14px 28px", cursor: "pointer" }}>◈ CONSULTAR AGORA</button>
                </div>
              ) : (
                <div>
                  {veredicto && (
                    <div style={{ border: "1px solid #2a1208", background: "#0a0400", padding: "16px 20px", marginBottom: 18 }}>
                      <div style={{ fontSize: 11, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New,monospace", marginBottom: 6 }}>VEREDICTO</div>
                      <div style={{ fontSize: 14, color: "#8a5030", fontStyle: "italic", lineHeight: 1.7 }}>"{veredicto}"</div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
                    {previsoes.map((ev, i) => <PredCard key={i} ev={ev} active={activeIdx===i} onToggle={() => setActiveIdx(activeIdx===i?null:i)}/>)}
                  </div>
                  <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "14px 18px" }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#2a1208", fontFamily: "Courier New,monospace", marginBottom: 4 }}>IMPACTO TOTAL</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: tclr, fontFamily: "Courier New,monospace" }}>
                      {previsoes.reduce((s,e) => s+e.impacto_anos, 0) > 0 ? "+" : ""}
                      {previsoes.reduce((s,e) => s+e.impacto_anos, 0).toFixed(1)} ANOS
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ VIOLÊNCIA ══ */}
          {page === "violencia" && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 8 }}>◈ TERMÔMETRO DA VIOLÊNCIA · BRASIL</div>
              <div style={{ fontSize: 13, color: "#5a2810", marginBottom: 20, lineHeight: 1.7 }}>Índice calculado por IA com base em notícias brasileiras. Atualizado a cada consulta ao Oráculo.</div>
              <ViolenceMeter value={violencia}/>
            </div>
          )}

          {/* ══ LOJA ══ */}
          {page === "loja" && (
            <div>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 8 }}>◈ BUNKER STORE</div>
              <div style={{ border: "1px solid #3a1808", background: "#0a0400", padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#c8341c", fontFamily: "Courier New,monospace", marginBottom: 4 }}>⚠ AVISO DO ORÁCULO</div>
                <div style={{ fontSize: 13, color: "#6a3810", lineHeight: 1.6 }}>Com o relógio a <span style={{ color: "#c8341c", fontWeight: 700 }}>{seconds} segundos</span> da meia-noite, o tempo de preparação é agora.</div>
              </div>

              <div style={{ fontSize: 12, letterSpacing: 4, color: "#4a2808", fontFamily: "Courier New,monospace", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span>E-BOOKS</span><div style={{ flex: 1, height: 1, background: "#1a0a04" }}/><span style={{ color: "#2a1208" }}>DOWNLOAD IMEDIATO</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 28 }}>
                {EBOOKS.map(b => (
                  <div key={b.id} style={{ border: "1px solid #2a1208", background: "#080400", padding: "18px", position: "relative", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8341c44"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a1208"; }}>
                    {b.badge && <div style={{ position: "absolute", top: 10, right: 10, fontSize: 9, letterSpacing: 2, padding: "2px 6px", background: "#c8341c22", border: "1px solid #c8341c", color: "#c8341c", fontFamily: "Courier New,monospace" }}>{b.badge}</div>}
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{b.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#c8a070", marginBottom: 4 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: "#5a3010", letterSpacing: 2, fontFamily: "Courier New,monospace", marginBottom: 8 }}>{b.sub}</div>
                    <div style={{ fontSize: 13, color: "#4a2810", lineHeight: 1.6, marginBottom: 14 }}>{b.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#c8341c", fontFamily: "Courier New,monospace" }}>{b.price}</div>
                      <button style={{ background: "#c8341c11", border: "1px solid #c8341c55", color: "#c8341c", fontFamily: "Courier New,monospace", fontSize: 11, letterSpacing: 2, padding: "8px 14px", cursor: "pointer" }}>ADQUIRIR</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 12, letterSpacing: 4, color: "#4a2808", fontFamily: "Courier New,monospace", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span>AFILIADOS</span><div style={{ flex: 1, height: 1, background: "#1a0a04" }}/>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
                {AFFILIATES.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#060200", border: "1px solid #1a0a04", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8341c44"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a0a04"; }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 14, color: "#8a5030" }}>{a.name}</span>
                    <span style={{ fontSize: 11, color: "#c8341c66", fontFamily: "Courier New,monospace" }}>{a.store} →</span>
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid #3a1808", background: "#0a0400", padding: "22px", textAlign: "center" }}>
                <div style={{ fontSize: 12, letterSpacing: 4, color: "#5a2808", fontFamily: "Courier New,monospace", marginBottom: 10 }}>◈ ALERTAS SEMANAIS DO ORÁCULO</div>
                <div style={{ fontSize: 13, color: "#6a3810", lineHeight: 1.7, marginBottom: 16 }}>Toda segunda-feira: análise do relógio, top ameaças e previsão atualizada.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <input type="email" placeholder="seu@email.com" style={{ background: "#060200", border: "1px solid #2a1208", color: "#c8a070", fontFamily: "Courier New,monospace", fontSize: 14, padding: "12px 16px", outline: "none", width: "100%", maxWidth: 300 }}/>
                  <button style={{ background: "#c8341c11", border: "1px solid #c8341c", color: "#c8341c", fontFamily: "Courier New,monospace", fontSize: 12, letterSpacing: 4, padding: "12px 24px", cursor: "pointer", width: "100%", maxWidth: 300 }}>ATIVAR ALERTA</button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop: "1px solid #1a0a04", padding: "16px", background: "rgba(4,1,0,0.97)", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#1e0a04", letterSpacing: 2, fontFamily: "Courier New,monospace", lineHeight: 2.2 }}>
            <div>RELÓGIO DO JUÍZO FINAL · 2026</div>
            <div>ENTRETENIMENTO BASEADO EM DADOS REAIS</div>
            <div>NÃO SOMOS RESPONSÁVEIS PELO FIM DO MUNDO</div>
          </div>
        </footer>
      </div>
    </div>
  );
}