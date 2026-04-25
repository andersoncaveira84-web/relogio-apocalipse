bash

cat > /mnt/user-data/outputs/App.jsx << 'ENDOFFILE'
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

const C = {
  bg: "#0a0804", bgCard: "#120e08", bgDark: "#080604", border: "#3a2a14",
  red: "#e63020", redDim: "#c02010", gold: "#d4940a", goldDim: "#8a6010",
  white: "#f0e8d8", gray: "#b09878", grayDim: "#705840", grayDark: "#403020",
  green: "#30b060", blue: "#2890c0",
};

const CAT_COLOR = {
  NUCLEAR: C.red, CLIMA: "#e08020", IA: C.blue,
  BIOLÓGICO: C.green, GEOPOLÍTICO: "#9040c0", CÓSMICO: C.gold,
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

// ─── Substitua pelos seus links reais ───
const HOTMART_LINKS = {
  omega:     "https://hotmart.com/seu-link-protocolo-omega",
  climatico: "https://hotmart.com/seu-link-colapso-climatico",
  singular:  "https://hotmart.com/seu-link-singularidade",
  kit:       "https://hotmart.com/seu-link-kit-bunker",
};

const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação, suprimentos.", price: "R$ 19,90", badge: "MAIS VENDIDO", link: HOTMART_LINKS.omega },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração, preparação para extremos climáticos.", price: "R$ 24,90", badge: null, link: HOTMART_LINKS.climatico },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle Humano", desc: "38 páginas. IA autônoma, cenários 2030-2050, protocolos de resposta.", price: "R$ 19,90", badge: "NOVO", link: HOTMART_LINKS.singular },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto. Download imediato após pagamento.", price: "R$ 44,90", badge: "ECONOMIA", link: HOTMART_LINKS.kit },
];

const AFFILIATES = [
  { icon: "📻", name: "Rádio Solar de Emergência", cat: "COMUNICAÇÃO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "💧", name: "Filtro de Água LifeStraw", cat: "SOBREVIVÊNCIA", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🧰", name: "Kit Primeiros Socorros Pro", cat: "MÉDICO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🔦", name: "Lanterna Tática 1000lm", cat: "EQUIPAMENTO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🥫", name: "Ração de Emergência 72h", cat: "ALIMENTAÇÃO", store: "Shopee", link: "https://shopee.com.br/seu-link" },
  { icon: "☢", name: "Dosímetro de Radiação Pessoal", cat: "NUCLEAR", store: "Amazon", link: "https://amzn.to/seu-link" },
];

// Dados de demonstração — usados quando não há chave API configurada
const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes históricos.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM SIMULTANEAMENTE · IA MILITAR SEM SUPERVISÃO · TEMPERATURA GLOBAL BATE RECORDE",
  violencia_br: 73,
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES EM EXPANSÃO", manchete_real: "Potências expandem ogivas sem tratados ativos", interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental: 34% em 18 anos. Tempo de resposta reduzido a 4 minutos.", impacto_anos: 3.2, categoria: "NUCLEAR", probabilidade: 72, gravidade: 9 },
    { titulo: "IA MILITAR SEM APROVAÇÃO HUMANA", manchete_real: "Sistemas autônomos operam sem loop humano", interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana documentado. Tempo de escalada cai de 72h para 11 minutos em conflito real.", impacto_anos: 4.7, categoria: "IA", probabilidade: 61, gravidade: 10 },
    { titulo: "RECORDE DE TEMPERATURA GLOBAL", manchete_real: "2025 é o ano mais quente da história", interpretacao: "Terceiro ano consecutivo de recordes absolutos. Colapso agrícola global revisado para 2041, 9 anos antes da estimativa anterior.", impacto_anos: 2.1, categoria: "CLIMA", probabilidade: 89, gravidade: 8 },
  ],
};

// ═══════════════════════════════════════════
// MATH HELPERS
// ═══════════════════════════════════════════
function secondsToYear(s) { return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START); }
function yearsLeft(s) { return YEAR_END - secondsToYear(s); }
function predYear(s) {
  const yr = secondsToYear(s), y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)], full: yr };
}
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
// ORACLE — chama a API da Anthropic diretamente
// -----------------------------------------------
// COMO CONFIGURAR:
//   1. Gere uma chave em https://console.anthropic.com/settings/keys
//   2. Cole a chave no campo que aparece no topo do site (ela é salva no localStorage)
//   3. Sem chave, o site usa os dados de demonstração (MOCK)
//
// PRODUÇÃO / SEGURANÇA:
//   Para deploy público, mova a chamada para um backend (ex: Next.js API Route,
//   Supabase Edge Function, Cloudflare Worker) para não expor a chave no front-end.
// ═══════════════════════════════════════════
async function callAnthropicOracle(apiKey) {
  const systemPrompt = `Você é o Oráculo do Relógio do Juízo Final. Analise o estado atual do mundo em 2026 e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura:
{
  "success": true,
  "ajuste_segundos": <inteiro entre -5 e +10>,
  "veredicto": "<frase dramática sobre o estado da civilização, máx 150 chars>",
  "ticker": "<manchetes em MAIÚSCULAS separadas por ·, máx 200 chars>",
  "violencia_br": <inteiro entre 50 e 95>,
  "previsoes": [
    {
      "titulo": "<TÍTULO EM MAIÚSCULAS>",
      "manchete_real": "<manchete plausível de 2025-2026>",
      "interpretacao": "<análise de 1-2 frases>",
      "impacto_anos": <decimal entre -5 e +10>,
      "categoria": "<NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO>",
      "probabilidade": <inteiro entre 40 e 95>,
      "gravidade": <inteiro entre 5 e 10>
    }
  ]
}
Gere exatamente 3 previsões baseadas em ameaças globais reais de 2025-2026. Seja dramático mas plausível.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // Header necessário para chamadas diretas do browser
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: "Analise o estado global em abril de 2026 e gere o relatório do Oráculo." }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ═══════════════════════════════════════════
// STEAMPUNK CLOCK
// ═══════════════════════════════════════════
function SteampunkClock({ seconds, glitch, pulse }) {
  const S = 280, cx = S/2, cy = S/2, R = S/2;
  const fraction = seconds / HOUR_S;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;
  const [gearAngle, setGearAngle] = useState(0);
  useEffect(() => { const t = setInterval(() => setGearAngle(a => a + 0.4), 50); return () => clearInterval(t); }, []);

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
      filter: glitch ? "drop-shadow(0 0 22px #e63020cc)" : pulse ? "drop-shadow(0 0 18px #d4940a88)" : "drop-shadow(0 0 8px #8b5a0a44)",
      transition: "filter 0.6s, transform 0.15s ease-out",
    }}>
      <defs>
        <radialGradient id="cFg" cx="50%" cy="40%"><stop offset="0%" stopColor="#1a1005"/><stop offset="100%" stopColor="#0a0800"/></radialGradient>
        <radialGradient id="cBg" cx="50%" cy="30%"><stop offset="0%" stopColor="#5a3a10"/><stop offset="60%" stopColor="#3d2a08"/><stop offset="100%" stopColor="#1a1005"/></radialGradient>
        <pattern id="cEng" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="8" y2="8" stroke="#2a1a05" strokeWidth="0.3"/></pattern>
      </defs>
      <circle cx={cx} cy={cy} r={R*0.99} fill="url(#cBg)" stroke="#7a5020" strokeWidth="2.5"/>
      {[0,90,180,270].map(a => { const rad=a*Math.PI/180; return <circle key={a} cx={cx+Math.cos(rad)*R*0.93} cy={cy+Math.sin(rad)*R*0.93} r={R*0.024} fill="#8b6020" stroke="#6b4a10" strokeWidth="1"/>; })}
      <circle cx={cx} cy={cy} r={R*0.95} fill="url(#cEng)" opacity="0.35"/>
      {gears.map((g, i) => <GearPath key={i} x={g.x} y={g.y} r={g.r} teeth={g.teeth} angle={gearAngle*g.speed*Math.PI/180}/>)}
      {gears.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r={g.r*0.28} fill="#5a3a10" stroke="#8b6020" strokeWidth="0.8"/>)}
      <circle cx={cx} cy={cy} r={R*0.79} fill="url(#cFg)"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="url(#cEng)" opacity="0.15"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="none" stroke="#5a3a10" strokeWidth="1.5"/>
      {Array.from({length:18},(_,i)=>{ const frac=i/60, a=-Math.PI/2+frac*Math.PI*2; return <line key={i} x1={cx+Math.cos(a)*R*0.40} y1={cy+Math.sin(a)*R*0.40} x2={cx+Math.cos(a)*R*0.79} y2={cy+Math.sin(a)*R*0.79} stroke={`rgba(230,48,32,${0.06-frac*0.003})`} strokeWidth="5"/>; })}
      {[0.64,0.50,0.36].map((r,i) => <circle key={i} cx={cx} cy={cy} r={R*r} fill="none" stroke="#2a1a06" strokeWidth="0.5"/>)}
      {markers.map((m,i) => <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.zero?"#e63020":m.major?"#6b4a1a":"#2a1a06"} strokeWidth={m.zero?2:m.major?1.5:0.5}/>)}
      <text x={cx} y={cy-R*0.64} textAnchor="middle" dominantBaseline="middle" fill={C.gold} fontSize={R*0.076} fontFamily="Georgia,serif" letterSpacing="2">XII</text>
      {[{l:"XI",a:-Math.PI/2-Math.PI/6},{l:"I",a:-Math.PI/2+Math.PI/6}].map((h,i) => <text key={i} x={cx+Math.cos(h.a)*R*0.62} y={cy+Math.sin(h.a)*R*0.62} textAnchor="middle" dominantBaseline="middle" fill={C.goldDim} fontSize={R*0.062} fontFamily="Georgia,serif">{h.l}</text>)}
      <text x={cx} y={cy-R*0.52} textAnchor="middle" dominantBaseline="middle" fill={C.grayDark} fontSize={R*0.030} fontFamily="Courier New,monospace" letterSpacing="3">MEIA-NOITE</text>
      <text x={cx} y={cy-R*0.17} textAnchor="middle" dominantBaseline="middle" fill={C.grayDark} fontSize={R*0.028} fontFamily="Courier New,monospace" letterSpacing="5">IT IS</text>
      <text x={cx} y={cy-R*0.055} textAnchor="middle" dominantBaseline="middle" fill={C.red} fontSize={R*0.082} fontFamily="Georgia,serif" fontWeight="bold" style={{transition:"all 1.5s ease"}}>{seconds}s</text>
      <text x={cx} y={cy+R*0.065} textAnchor="middle" dominantBaseline="middle" fill={C.grayDark} fontSize={R*0.028} fontFamily="Courier New,monospace" letterSpacing="3">TO MIDNIGHT</text>
      <text x={cx} y={cy+R*0.27} textAnchor="middle" dominantBaseline="middle" fill={C.grayDark} fontSize={R*0.024} fontFamily="Courier New,monospace" letterSpacing="3">BOLETIM DOS CIENTISTAS</text>
      <text x={cx} y={cy+R*0.34} textAnchor="middle" dominantBaseline="middle" fill={C.grayDark} fontSize={R*0.024} fontFamily="Courier New,monospace" letterSpacing="3">DO APOCALIPSE</text>
      <line x1={cx-Math.cos(handRad)*R*0.13+1.5} y1={cy-Math.sin(handRad)*R*0.13+1.5} x2={cx+Math.cos(handRad)*R*0.70+1.5} y2={cy+Math.sin(handRad)*R*0.70+1.5} stroke="#00000066" strokeWidth={R*0.026} strokeLinecap="round"/>
      <line x1={cx-Math.cos(handRad)*R*0.13} y1={cy-Math.sin(handRad)*R*0.13} x2={cx+Math.cos(handRad)*R*0.70} y2={cy+Math.sin(handRad)*R*0.70} stroke="#e6302044" strokeWidth={R*0.065} strokeLinecap="round"/>
      <line x1={cx-Math.cos(handRad)*R*0.13} y1={cy-Math.sin(handRad)*R*0.13} x2={cx+Math.cos(handRad)*R*0.70} y2={cy+Math.sin(handRad)*R*0.70} stroke={C.red} strokeWidth={R*0.022} strokeLinecap="round" style={{transition:"x2 2s cubic-bezier(0.4,0,0.2,1),y2 2s,x1 2s,y1 2s"}}/>
      <circle cx={cx} cy={cy} r={R*0.048} fill="#6b4a10" stroke="#8b6a20" strokeWidth="1.5"/>
      <circle cx={cx} cy={cy} r={R*0.026} fill={C.gold}/>
      <circle cx={cx} cy={cy} r={R*0.011} fill="#e8c050"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="none" stroke={C.red} strokeWidth="1" opacity={pulse?0.2:0.05} style={{transition:"opacity 0.15s"}}/>
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

  return (
    <div style={{ border: `1px solid ${urgency ? C.red+"88" : C.border}`, background: urgency ? "#150300" : C.bgCard, padding: "18px", width: "100%" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: urgency ? C.red : C.goldDim, fontFamily: "Courier New,monospace", textAlign: "center", marginBottom: 12, fontStyle: "italic" }}>
        {survived ? "✓ SOBREVIVEMOS MAIS UM DIA" : urgency ? "⚠ AS HORAS FINAIS DE HOJE..." : "HOJE AINDA ESTAREMOS AQUI?"}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 2, marginBottom: 10 }}>
        {[{v:t.h,l:"H"},{v:null},{v:t.m,l:"M"},{v:null},{v:t.s,l:"S"}].map((seg, i) => {
          if (seg.v === null) return <span key={i} style={{ fontSize: "clamp(24px,6vw,40px)", fontWeight: 700, color: urgency ? C.red : C.gold, opacity: blink?1:0.15, lineHeight: 1, margin: "0 2px", paddingBottom: 10 }}>:</span>;
          return (
            <div key={i} style={{ textAlign: "center", minWidth: "clamp(36px,8vw,56px)" }}>
              <div style={{ fontSize: "clamp(24px,6vw,40px)", fontWeight: 700, color: urgency ? C.red : C.white, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{seg.v}</div>
              <div style={{ fontSize: 10, color: C.grayDim, letterSpacing: 2, marginTop: 3, fontFamily: "Courier New,monospace" }}>{seg.l}</div>
            </div>
          );
        })}
        <div style={{ marginLeft: 4, paddingBottom: 1 }}>
          <span style={{ fontSize: 12, color: C.grayDark, fontFamily: "Courier New,monospace" }}>.{t.ms}</span>
        </div>
      </div>
      <div style={{ height: 4, background: C.bgDark, overflow: "hidden", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${urgency?C.red+"66":C.gold+"44"},${urgency?C.red:C.gold})`, transition: "width 1s linear" }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.grayDark, fontFamily: "Courier New,monospace", letterSpacing: 1, marginTop: 5 }}>
        <span>MEIA-NOITE</span>
        <span style={{ color: urgency ? C.red : C.goldDim }}>{pct.toFixed(0)}% RESTANTE</span>
        <span>00:00</span>
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
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "16px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 8 }}>◈ DESDE O ÚLTIMO AGRAVAMENTO</div>
        <div style={{ fontSize: 13, color: C.gray, marginBottom: 12, lineHeight: 1.5 }}>
          28 Jan 2026 → relógio avançou para <span style={{ color: C.red, fontWeight: 700 }}>85 segundos</span>. Perigo persiste há:
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" }}>
          {[{v:since.d,l:"DIAS"},{v:since.h,l:"H"},{v:since.m,l:"MIN"},{v:since.s,l:"SEG"}].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: i===0?"clamp(24px,5vw,34px)":"clamp(18px,4vw,24px)", fontWeight: 700, color: i===0?C.red:C.white, fontFamily: "Courier New,monospace", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{seg.v}</div>
              <div style={{ fontSize: 10, color: C.grayDim, letterSpacing: 2, fontFamily: "Courier New,monospace", marginTop: 3 }}>{seg.l}</div>
            </div>
          ))}
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: beat?C.red:C.grayDark, boxShadow: beat?`0 0 12px ${C.red}`:"none", transition: "background 0.1s, box-shadow 0.1s", alignSelf: "center", marginLeft: 4 }}/>
        </div>
      </div>
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "16px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 8 }}>◈ ATÉ A PRÓXIMA REVISÃO OFICIAL</div>
        <div style={{ fontSize: 13, color: C.gray, marginBottom: 12, lineHeight: 1.5 }}>
          Bulletin revisa em <span style={{ color: C.gold, fontWeight: 700 }}>Janeiro 2027</span>. Vai piorar ou melhorar?
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
          {[{v:until.d,l:"DIAS"},{v:until.h,l:"H"},{v:until.m,l:"MIN"},{v:until.s,l:"SEG"}].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: i===0?"clamp(24px,5vw,34px)":"clamp(18px,4vw,24px)", fontWeight: 700, color: i===0?C.gold:C.white, fontFamily: "Courier New,monospace", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{seg.v}</div>
              <div style={{ fontSize: 10, color: C.grayDim, letterSpacing: 2, fontFamily: "Courier New,monospace", marginTop: 3 }}>{seg.l}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 3, background: C.bgDark, borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${reviewPct}%`, background: `linear-gradient(90deg,${C.border},${C.gold})`, transition: "width 1s", borderRadius: 2 }}/>
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
    const t = setInterval(() => { x -= 0.8; if (x < -w) x = window.innerWidth || 400; setPos(x); }, 16);
    return () => clearInterval(t);
  }, [w]);

  return (
    <div style={{ background: "#0f0000", borderTop: `1px solid ${C.red}44`, borderBottom: `1px solid ${C.red}44`, height: 34, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", zIndex: 2 }}>
        <div style={{ background: C.red, padding: "0 14px", height: "100%", display: "flex", alignItems: "center", fontSize: 11, letterSpacing: 3, color: "#fff", fontFamily: "Courier New,monospace", fontWeight: 700, boxShadow: "4px 0 10px #00000099" }}>URGENTE</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 86, right: 0, overflow: "hidden" }}>
        <div ref={ref} style={{ position: "absolute", top: 0, whiteSpace: "nowrap", transform: `translateX(${pos}px)`, fontSize: 13, color: C.gold, fontFamily: "Courier New,monospace", letterSpacing: 2, lineHeight: "34px" }}>
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
  const col = CAT_COLOR[ev.categoria] || C.red;
  const label = CAT_LABEL[ev.categoria] || ev.categoria;
  const worsens = ev.impacto_anos > 0;

  return (
    <div onClick={onToggle} style={{ border: `1px solid ${active ? col+"88" : C.border}`, background: active ? `${col}12` : C.bgCard, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.25s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${col},transparent)` }}/>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: col, fontFamily: "Courier New,monospace", marginBottom: 5 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.3 }}>{ev.titulo}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: worsens ? C.red : C.green, fontFamily: "Courier New,monospace", lineHeight: 1 }}>{worsens ? "+" : "-"}{Math.abs(ev.impacto_anos).toFixed(1)}</div>
            <div style={{ fontSize: 10, color: C.grayDim, fontFamily: "Courier New,monospace" }}>ANOS</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.gray, fontStyle: "italic", lineHeight: 1.6, borderLeft: `3px solid ${col}44`, paddingLeft: 10, marginBottom: active ? 14 : 0 }}>"{ev.manchete_real}"</div>
        {active && (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 10 }}>
            <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.75, marginBottom: 12 }}>{ev.interpretacao}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.grayDim, fontFamily: "Courier New,monospace", marginBottom: 4 }}>PROBABILIDADE</div>
                <div style={{ fontSize: 18, color: col, fontFamily: "Courier New,monospace", fontWeight: 700 }}>{ev.probabilidade}%</div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: C.grayDim, fontFamily: "Courier New,monospace", marginBottom: 4 }}>GRAVIDADE</div>
                <div style={{ display: "flex", gap: 3 }}>{Array.from({length:10},(_,i) => <div key={i} style={{ width: 10, height: 10, background: i<(ev.gravidade||0)?col:C.bgDark, borderRadius: 1 }}/>)}</div>
              </div>
            </div>
          </div>
        )}
        {!active && <div style={{ marginTop: 8, fontSize: 11, color: C.grayDark, letterSpacing: 2, fontFamily: "Courier New,monospace" }}>CLIQUE PARA EXPANDIR ▼</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VIOLENCE METER
// ═══════════════════════════════════════════
function ViolenceMeter({ value = 73 }) {
  const color = value>=80?C.red:value>=60?"#e08020":value>=40?"#a89020":C.green;
  const label = value>=80?"CRÍTICO":value>=60?"ALTO":value>=40?"MODERADO":"BAIXO";
  const STATES = [{name:"SP",v:82},{name:"RJ",v:78},{name:"BA",v:75},{name:"PE",v:71},{name:"CE",v:68},{name:"MG",v:52},{name:"RS",v:45},{name:"PR",v:42}];

  return (
    <div>
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "24px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 16 }}>ÍNDICE NACIONAL DE VIOLÊNCIA</div>
        <div style={{ position: "relative", width: 200, height: 110, margin: "0 auto 16px" }}>
          <svg width="200" height="110" viewBox="0 0 200 110">
            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke={C.bgDark} strokeWidth="18" strokeLinecap="round"/>
            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(value/100)*267} 267`}/>
            {(() => { const a=Math.PI-(value/100)*Math.PI; const nx=100+Math.cos(a)*76, ny=100-Math.sin(a)*76; return (<><line x1="100" y1="100" x2={nx} y2={ny} stroke={C.red} strokeWidth="3" strokeLinecap="round"/><circle cx="100" cy="100" r="7" fill={C.bgCard} stroke={C.gold} strokeWidth="2"/></>); })()}
            <text x="100" y="90" textAnchor="middle" fill={color} fontSize="28" fontFamily="Georgia,serif" fontWeight="bold">{value}</text>
            <text x="15" y="108" fill={C.grayDark} fontSize="10" fontFamily="Courier New,monospace">BAIXO</text>
            <text x="152" y="108" fill={C.grayDark} fontSize="10" fontFamily="Courier New,monospace">ALTO</text>
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "Courier New,monospace", letterSpacing: 4, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 14, color: C.gray }}>+{(value/100*2.4).toFixed(1)} anos adicionados ao prazo da civilização</div>
      </div>
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", marginBottom: 16 }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 16 }}>ESTADOS EM ALERTA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {STATES.map((st, i) => {
            const c = st.v>=75?C.red:st.v>=60?"#e08020":"#a89020";
            return (
              <div key={i} style={{ border: `1px solid ${c}44`, background: C.bgDark, padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.white, fontFamily: "Courier New,monospace" }}>{st.name}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: "Courier New,monospace" }}>{st.v}</span>
                </div>
                <div style={{ height: 4, background: C.bgDark, borderRadius: 2 }}><div style={{ height: "100%", width: `${st.v}%`, background: c, borderRadius: 2 }}/></div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, color: C.grayDim, fontFamily: "Courier New,monospace", lineHeight: 1.8 }}>
          ◈ Índice calculado por IA com base em análise de notícias públicas. Não representa dado oficial. Atualizado a cada consulta ao Oráculo.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// API KEY CONFIG BANNER
// ═══════════════════════════════════════════
function ApiKeyBanner({ apiKey, onSave, onClear, error }) {
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(apiKey);

  return (
    <div style={{ border: `1px solid ${apiKey ? C.gold+"44" : C.border}`, background: C.bgCard, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: apiKey ? C.gold : C.grayDim, fontFamily: "Courier New,monospace", letterSpacing: 2, flexShrink: 0 }}>
        {apiKey ? "◈ ORÁCULO IA ATIVO" : "◈ MODO DEMONSTRAÇÃO"}
      </span>
      {!show ? (
        <button onClick={() => { setDraft(apiKey); setShow(true); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.grayDim, fontFamily: "Courier New,monospace", fontSize: 11, letterSpacing: 2, padding: "4px 10px", cursor: "pointer" }}>
          {apiKey ? "TROCAR CHAVE API" : "INSERIR CHAVE API ANTHROPIC"}
        </button>
      ) : (
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: C.bgDark, border: `1px solid ${C.border}`, color: C.white, fontFamily: "Courier New,monospace", fontSize: 12, padding: "6px 10px", outline: "none" }}
          />
          <button onClick={() => { onSave(draft); setShow(false); }} style={{ background: C.gold+"22", border: `1px solid ${C.gold}`, color: C.gold, fontFamily: "Courier New,monospace", fontSize: 11, letterSpacing: 2, padding: "6px 12px", cursor: "pointer" }}>SALVAR</button>
          <button onClick={() => { onClear(); setDraft(""); setShow(false); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.grayDim, fontFamily: "Courier New,monospace", fontSize: 11, padding: "6px 10px", cursor: "pointer" }}>LIMPAR</button>
        </div>
      )}
      {error && <div style={{ width: "100%", fontSize: 11, color: C.red, fontFamily: "Courier New,monospace", marginTop: 4 }}>{error}</div>}
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
  const [tickerText, setTickerText] = useState("RELÓGIO DO JUÍZO FINAL · 85 SEGUNDOS PARA A MEIA-NOITE · RECORDE HISTÓRICO EM 79 ANOS");
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

  // ── Chave API — salva no localStorage ──
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("doomsday_api_key") || "");
  const [apiError, setApiError] = useState("");

  function handleSaveKey(key) {
    setApiKey(key);
    localStorage.setItem("doomsday_api_key", key);
  }
  function handleClearKey() {
    setApiKey("");
    localStorage.removeItem("doomsday_api_key");
  }

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

  // ── Consulta principal ──
  async function consult() {
    if (loading) return;
    setLoading(true);
    setPhase("loading");
    setActiveIdx(null);
    setApiError("");
    setOracMsg(LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);

    let r = null;

    try {
      if (apiKey) {
        // Chama a API da Anthropic diretamente
        r = await callAnthropicOracle(apiKey);
      } else {
        // Sem chave: usa dados de demonstração
        r = MOCK;
      }
    } catch (e) {
      setApiError(`Erro na API: ${e.message}. Usando dados de demonstração.`);
      r = MOCK;
    }

    // Aplica resultado
    const newS = Math.max(10, Math.min(HOUR_S - 10, seconds + (r.ajuste_segundos || 0)));
    if (r.ticker) setTickerText(r.ticker.toUpperCase());
    if (r.violencia_br) setViolencia(r.violencia_br);
    setTimeout(() => { setSeconds(newS); setGlitch(true); }, 400);
    setTimeout(() => setGlitch(false), 1800);
    setPrevisoes(r.previsoes || []);
    setVeredicto(r.veredicto || "");
    const pd = predYear(newS);
    setConsultas(prev => [
      { ts: new Date().toLocaleTimeString("pt-BR"), seconds: newS, delta: r.ajuste_segundos || 0, year: pd.y, veredicto: r.veredicto || "" },
      ...prev,
    ].slice(0, 6));
    setPhase("reveal");
    setLoading(false);
  }

  const pd = predYear(seconds);
  const yl = yearsLeft(seconds);
  const threat = seconds <= 60 ? "CATASTRÓFICO" : seconds <= 90 ? "CRÍTICO" : seconds <= 120 ? "SEVERO" : "ALTO";

  function navBtn(id) {
    return {
      background: "transparent", border: "none",
      borderBottom: `2px solid ${page === id ? C.red : "transparent"}`,
      color: page === id ? C.gold : C.grayDim,
      fontFamily: "Courier New,monospace", fontSize: 12, letterSpacing: 3,
      padding: "11px 16px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
    };
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.gray, fontFamily: "Georgia,Times New Roman,serif", overflowX: "hidden", width: "100%" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; background: ${C.bg}; }
        ::-webkit-scrollbar { width: 4px; background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* Grain overlay */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.12, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }}/>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center,transparent 40%,rgba(2,1,0,0.85) 100%)" }}/>

      <div style={{ position: "relative", zIndex: 2, width: "100%" }}>

        {/* ── HEADER ── */}
        <header style={{ background: "rgba(10,8,4,0.98)", borderBottom: `1px solid ${C.border}`, width: "100%" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
            <div style={{ borderBottom: `1px solid ${C.bgDark}`, padding: "7px 0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
              <span style={{ fontSize: 11, letterSpacing: 3, color: C.grayDark, fontFamily: "Courier New,monospace" }}>BOLETIM DOS CIENTISTAS · EST. 1947</span>
              <span style={{ fontSize: 11, letterSpacing: 3, color: C.red, fontFamily: "Courier New,monospace" }}>{threat} · {seconds}s</span>
            </div>
            <div style={{ padding: "14px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "clamp(18px,4vw,32px)", fontWeight: 700, color: C.gold, letterSpacing: 3, fontFamily: "Georgia,serif", textShadow: glitch ? `3px 0 ${C.red},-3px 0 ${C.blue}` : `0 0 30px ${C.gold}44`, transition: "text-shadow 0.15s" }}>
                  RELÓGIO DO JUÍZO FINAL
                </div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: C.grayDark, fontFamily: "Courier New,monospace", marginTop: 4 }}>DOOMSDAY CLOCK · ANÁLISE COMPUTACIONAL · 2026</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: C.grayDim, fontFamily: "Courier New,monospace", marginBottom: 2 }}>PREVISÃO DO COLAPSO</div>
                <div style={{ fontSize: "clamp(24px,5vw,42px)", fontWeight: 700, color: C.red, fontFamily: "Courier New,monospace", transition: "all 2s ease" }}>
                  {pd.y} <span style={{ fontSize: "0.4em", color: C.redDim, letterSpacing: 4 }}>{pd.m}</span>
                </div>
              </div>
            </div>
            <nav style={{ display: "flex", gap: 0, borderTop: `1px solid ${C.bgDark}`, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              {["relogio","oraculo","violencia","loja"].map(p => (
                <button key={p} onClick={() => setPage(p)} style={navBtn(p)}>
                  {p==="relogio"?"RELÓGIO":p==="oraculo"?"ORÁCULO":p==="violencia"?"TERMÔMETRO BR":"BUNKER STORE"}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <NewsTicker text={tickerText}/>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 80px", width: "100%" }}>

          {/* ── Banner de configuração da chave API ── */}
          <ApiKeyBanner
            apiKey={apiKey}
            onSave={handleSaveKey}
            onClear={handleClearKey}
            error={apiError}
          />

          {/* ══ RELÓGIO ══ */}
          {page === "relogio" && (
            <div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                <SteampunkClock seconds={seconds} glitch={glitch} pulse={pulse}/>
              </div>

              <div style={{ border: `1px solid ${C.red}55`, background: `linear-gradient(160deg,#180a04,${C.bgCard})`, padding: "22px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: `radial-gradient(ellipse at top right,${C.red}0e,transparent 70%)`, pointerEvents: "none" }}/>
                <div style={{ fontSize: 12, letterSpacing: 4, color: C.redDim, fontFamily: "Courier New,monospace", marginBottom: 12 }}>◈ PREVISÃO COMPUTACIONAL DO COLAPSO</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 10 }}>
                  <div style={{ fontSize: "clamp(60px,16vw,96px)", fontWeight: 700, color: C.red, lineHeight: 0.9, fontFamily: "Georgia,serif", textShadow: `0 0 40px ${C.red}44`, transition: "all 2s ease" }}>{pd.y}</div>
                  <div>
                    <div style={{ fontSize: "clamp(18px,4vw,28px)", color: C.redDim, fontFamily: "Courier New,monospace", letterSpacing: 4 }}>{pd.m}</div>
                    <div style={{ fontSize: 13, color: C.grayDim, fontFamily: "Courier New,monospace", marginTop: 6 }}>{yl.toFixed(1)} ANOS RESTANTES</div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.grayDark, fontFamily: "Courier New,monospace", marginBottom: 5 }}>
                    <span>2024</span><span style={{ color: C.grayDim }}>HOJE</span><span style={{ color: C.red }}>{pd.y}</span><span>2124</span>
                  </div>
                  <div style={{ height: 12, background: C.bgDark, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden", borderRadius: 2 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((2026-2024)/100)*100}%`, background: C.border }}/>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((2026-2024)/100)*100}%`, width: `${((pd.full-2026)/100)*100}%`, background: `linear-gradient(90deg,${C.red}22,${C.red}66)` }}/>
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((pd.full-2024)/100)*100}%`, width: 3, background: C.red, boxShadow: `0 0 8px ${C.red}` }}/>
                  </div>
                </div>
                {veredicto ? (
                  <div style={{ fontSize: 14, color: C.gray, fontStyle: "italic", lineHeight: 1.7, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>"{veredicto}"</div>
                ) : (
                  <div style={{ fontSize: 14, color: C.grayDim, lineHeight: 1.7, borderTop: `1px solid ${C.bgDark}`, paddingTop: 14 }}>
                    Baseado na leitura oficial de <span style={{ color: C.red }}>85 segundos</span> (Jan 2026). Numa escala de 1 hora = 100 anos, a humanidade tem <span style={{ color: C.red }}>{yl.toFixed(1)} anos</span> antes do ponto de não-retorno.
                  </div>
                )}
              </div>

              <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "22px", textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: 4, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 10 }}>ALGORITMO CRONOS · ANÁLISE DE AMEAÇAS GLOBAIS</div>
                <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 18 }}>
                  {apiKey
                    ? "O Oráculo usará IA real para analisar ameaças globais e recalcular a data prevista do colapso."
                    : "Sem chave API, o Oráculo usa dados de demonstração. Insira sua chave Anthropic no banner acima para análise real."}
                </div>
                <button onClick={consult} disabled={loading} style={{
                  width: "100%", background: loading ? "transparent" : `linear-gradient(180deg,#1a0a02,${C.bgDark})`,
                  border: `1px solid ${loading ? C.border : C.red+"99"}`,
                  color: loading ? C.grayDark : C.red,
                  fontFamily: "Courier New,monospace", fontSize: 15, letterSpacing: 4,
                  padding: "18px 20px", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.4s",
                }}>
                  {loading ? <span style={{ animation: "blink 1.2s ease-in-out infinite" }}>◈  {oracMsg}</span> : "◈  CONSULTAR O ORÁCULO"}
                </button>
                {phase === "reveal" && previsoes.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: C.grayDim, fontFamily: "Courier New,monospace", letterSpacing: 2 }}>
                    {previsoes.length} FATORES ANALISADOS · DATA RECALCULADA
                  </div>
                )}
              </div>

              <HeartbeatCounters sinceMs={sinceMs} untilMs={untilMs}/>
              <div style={{ marginTop: 12 }}>
                <DailyClock ms={midMs}/>
              </div>

              <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "16px", marginTop: 12 }}>
                <div style={{ fontSize: 13, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 14 }}>REFERÊNCIA HISTÓRICA OFICIAL</div>
                {[
                  { y: "1991", s: "17 min", n: "Ponto mais seguro. Fim da Guerra Fria.", cur: false },
                  { y: "1947", s: "7 min", n: "Criação do relógio. Era Nuclear inicia.", cur: false },
                  { y: "1953", s: "2 min", n: "EUA e URSS testam bombas de hidrogênio.", cur: false },
                  { y: "2023", s: "90s", n: "Guerra na Ucrânia. Ameaças nucleares.", cur: false },
                  { y: "2026", s: "85s", n: "ATUAL — Recorde histórico em 79 anos.", cur: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i<4 ? `1px solid ${C.bgDark}` : "none", opacity: r.cur ? 1 : 0.5 }}>
                    <span style={{ fontSize: 12, color: C.grayDim, fontFamily: "Courier New,monospace", width: 34, flexShrink: 0 }}>{r.y}</span>
                    <span style={{ fontSize: 13, color: r.cur ? C.red : C.grayDim, fontFamily: "Courier New,monospace", fontWeight: r.cur ? 700 : 400, width: 46, flexShrink: 0 }}>{r.s}</span>
                    <span style={{ fontSize: 14, color: r.cur ? C.white : C.grayDim }}>{r.n}</span>
                  </div>
                ))}
              </div>

              {consultas.length > 0 && (
                <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "16px", marginTop: 12 }}>
                  <div style={{ fontSize: 13, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 12 }}>HISTÓRICO DE CONSULTAS</div>
                  {consultas.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i<consultas.length-1 ? `1px solid ${C.bgDark}` : "none", opacity: 1-i*0.13, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: C.grayDark, fontFamily: "Courier New,monospace" }}>{c.ts}</span>
                      <span style={{ fontSize: 16, color: C.red, fontFamily: "Courier New,monospace", fontWeight: 700 }}>{c.year}</span>
                      <span style={{ fontSize: 12, fontFamily: "Courier New,monospace", color: c.delta > 0 ? C.red : C.green }}>{c.delta > 0 ? `+${c.delta}s` : `${c.delta}s`}</span>
                      <span style={{ fontSize: 13, color: C.grayDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.veredicto}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ORÁCULO ══ */}
          {page === "oraculo" && (
            <div>
              <div style={{ fontSize: 13, letterSpacing: 5, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 20 }}>◈ PREVISÕES DO ALGORITMO CRONOS</div>
              {phase !== "reveal" ? (
                <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "32px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, color: C.gray, marginBottom: 24, lineHeight: 1.7 }}>Nenhuma análise realizada ainda. Vá na aba Relógio e consulte o Oráculo para ver as previsões.</div>
                  <button onClick={() => { setPage("relogio"); setTimeout(consult, 200); }} style={{ background: "transparent", border: `1px solid ${C.red}88`, color: C.red, fontFamily: "Courier New,monospace", fontSize: 14, letterSpacing: 4, padding: "14px 32px", cursor: "pointer" }}>◈ CONSULTAR AGORA</button>
                </div>
              ) : (
                <div>
                  {veredicto && (
                    <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "18px 22px", marginBottom: 20 }}>
                      <div style={{ fontSize: 12, letterSpacing: 3, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 8 }}>VEREDICTO DO ALGORITMO</div>
                      <div style={{ fontSize: 15, color: C.white, fontStyle: "italic", lineHeight: 1.7 }}>"{veredicto}"</div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    {previsoes.map((ev, i) => <PredCard key={i} ev={ev} active={activeIdx===i} onToggle={() => setActiveIdx(activeIdx===i ? null : i)}/>)}
                  </div>
                  <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "16px 20px" }}>
                    <div style={{ fontSize: 12, color: C.grayDim, fontFamily: "Courier New,monospace", marginBottom: 6 }}>IMPACTO TOTAL DA ANÁLISE</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: C.red, fontFamily: "Courier New,monospace" }}>
                      {previsoes.reduce((s,e) => s+e.impacto_anos, 0) > 0 ? "+" : ""}
                      {previsoes.reduce((s,e) => s+e.impacto_anos, 0).toFixed(1)} ANOS
                    </div>
                    <div style={{ fontSize: 14, color: C.grayDim, marginTop: 6 }}>
                      Esta análise {previsoes.reduce((s,e) => s+e.impacto_anos, 0) > 0 ? "aproximou" : "afastou"} o colapso da previsão anterior.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ VIOLÊNCIA ══ */}
          {page === "violencia" && (
            <div>
              <div style={{ fontSize: 13, letterSpacing: 5, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 10 }}>◈ TERMÔMETRO DA VIOLÊNCIA · BRASIL</div>
              <div style={{ fontSize: 15, color: C.gray, marginBottom: 24, lineHeight: 1.7 }}>
                Índice calculado por IA com base em análise de notícias brasileiras em tempo real. Atualizado a cada consulta ao Oráculo.
              </div>
              <ViolenceMeter value={violencia}/>
            </div>
          )}

          {/* ══ LOJA ══ */}
          {page === "loja" && (
            <div>
              <div style={{ fontSize: 13, letterSpacing: 5, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 10 }}>◈ BUNKER STORE</div>
              <div style={{ border: `1px solid ${C.red}44`, background: `linear-gradient(135deg,#150800,${C.bgCard})`, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 12, letterSpacing: 3, color: C.red, fontFamily: "Courier New,monospace", marginBottom: 6 }}>⚠ AVISO DO ORÁCULO</div>
                <div style={{ fontSize: 15, color: C.gray, lineHeight: 1.6 }}>Com o relógio a <span style={{ color: C.red, fontWeight: 700 }}>{seconds} segundos</span> da meia-noite, o tempo de preparação é <span style={{ color: C.gold }}>agora</span>. Não amanhã.</div>
              </div>
              <div style={{ fontSize: 13, letterSpacing: 4, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span>ARQUIVOS DIGITAIS</span><div style={{ flex: 1, height: 1, background: C.border }}/><span style={{ color: C.grayDark, fontSize: 11 }}>VIA HOTMART</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 32 }}>
                {EBOOKS.map(b => (
                  <a key={b.id} href={b.link} target="_blank" rel="noopener noreferrer"
                    style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", position: "relative", display: "block", transition: "border 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.red+"66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}>
                    {b.badge && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, letterSpacing: 2, padding: "3px 8px", background: C.red+"22", border: `1px solid ${C.red}`, color: C.red, fontFamily: "Courier New,monospace" }}>{b.badge}</div>}
                    <div style={{ fontSize: 34, marginBottom: 12 }}>{b.icon}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginBottom: 5 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: C.goldDim, letterSpacing: 2, fontFamily: "Courier New,monospace", marginBottom: 10 }}>{b.sub}</div>
                    <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.6, marginBottom: 16 }}>{b.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.red, fontFamily: "Courier New,monospace" }}>{b.price}</div>
                      <div style={{ background: C.red+"22", border: `1px solid ${C.red}`, color: C.red, fontFamily: "Courier New,monospace", fontSize: 12, letterSpacing: 2, padding: "8px 16px" }}>ADQUIRIR →</div>
                    </div>
                  </a>
                ))}
              </div>
              <div style={{ fontSize: 13, letterSpacing: 4, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <span>KIT DE SOBREVIVÊNCIA</span><div style={{ flex: 1, height: 1, background: C.border }}/><span style={{ color: C.grayDark, fontSize: 11 }}>AMAZON · SHOPEE</span>
              </div>
              <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "14px 18px", marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>Itens selecionados com base em protocolos reais de emergência civil. Links de afiliado — cada compra apoia este sistema de vigilância.</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 32 }}>
                {AFFILIATES.map((a, i) => (
                  <a key={i} href={a.link} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.bgCard, border: `1px solid ${C.border}`, transition: "border 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.red+"55"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, letterSpacing: 2, padding: "3px 8px", border: `1px solid ${C.border}`, color: C.grayDim, fontFamily: "Courier New,monospace", flexShrink: 0 }}>{a.cat}</span>
                    <span style={{ flex: 1, fontSize: 15, color: C.white }}>{a.name}</span>
                    <span style={{ fontSize: 12, color: C.redDim, fontFamily: "Courier New,monospace", flexShrink: 0 }}>{a.store} →</span>
                  </a>
                ))}
              </div>
              <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "26px", textAlign: "center" }}>
                <div style={{ fontSize: 14, letterSpacing: 4, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 12 }}>◈ ALERTAS SEMANAIS DO ORÁCULO</div>
                <div style={{ fontSize: 15, color: C.gray, lineHeight: 1.7, marginBottom: 20 }}>Toda segunda-feira: análise do relógio, principais ameaças e data prevista atualizada.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <input type="email" placeholder="seu@email.com" style={{ background: C.bgDark, border: `1px solid ${C.border}`, color: C.white, fontFamily: "Courier New,monospace", fontSize: 15, padding: "13px 18px", outline: "none", width: "100%", maxWidth: 320 }}/>
                  <button style={{ background: C.red+"22", border: `1px solid ${C.red}`, color: C.red, fontFamily: "Courier New,monospace", fontSize: 13, letterSpacing: 4, padding: "13px 28px", cursor: "pointer", width: "100%", maxWidth: 320 }}>ATIVAR ALERTA</button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "20px 16px", background: C.bgDark, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.grayDark, letterSpacing: 2, fontFamily: "Courier New,monospace", lineHeight: 2.5 }}>
            <div>RELÓGIO DO JUÍZO FINAL · PROTOCOLO ÔMEGA · 2026</div>
            <div>DADOS: BULLETIN OF ATOMIC SCIENTISTS · RSS GLOBAL · INTELIGÊNCIA ARTIFICIAL</div>
            <div>ENTRETENIMENTO BASEADO EM DADOS REAIS · NÃO SOMOS RESPONSÁVEIS PELO FIM DO MUNDO</div>
          </div>
        </footer>
      </div>
    </div>
  );
}