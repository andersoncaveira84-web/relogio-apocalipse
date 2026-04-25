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

// Cores principais — estilo apocalíptico mas legível
const C = {
  bg:       "#0a0804",
  bgCard:   "#120e08",
  bgDark:   "#080604",
  border:   "#3a2a14",
  borderHi: "#6a4a20",
  red:      "#e63020",
  redDim:   "#c02010",
  gold:     "#d4940a",
  goldDim:  "#8a6010",
  white:    "#f0e8d8",
  gray:     "#b09878",
  grayDim:  "#705840",
  grayDark: "#403020",
  green:    "#30b060",
  blue:     "#2890c0",
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

// ─── Links Hotmart — substitua pelos seus links reais ───
const HOTMART_LINKS = {
  omega:     "https://hotmart.com/seu-link-protocolo-omega",
  climatico: "https://hotmart.com/seu-link-colapso-climatico",
  singular:  "https://hotmart.com/seu-link-singularidade",
  kit:       "https://hotmart.com/seu-link-kit-bunker",
};

const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação, suprimentos. Protocolos reais + ficção.", price: "R$ 19,90", badge: "MAIS VENDIDO", link: HOTMART_LINKS.omega },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração, preparação para extremos climáticos.", price: "R$ 24,90", badge: null, link: HOTMART_LINKS.climatico },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle Humano", desc: "38 páginas. IA autônoma, cenários 2030-2050, protocolos de resposta.", price: "R$ 19,90", badge: "NOVO", link: HOTMART_LINKS.singular },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto. Download imediato após pagamento.", price: "R$ 44,90", badge: "ECONOMIA", link: HOTMART_LINKS.kit },
];

// ─── Links Amazon/Shopee afiliados — substitua pelos seus ───
const AFFILIATES = [
  { icon: "📻", name: "Rádio Solar de Emergência", cat: "COMUNICAÇÃO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "💧", name: "Filtro de Água LifeStraw", cat: "SOBREVIVÊNCIA", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🧰", name: "Kit Primeiros Socorros Pro", cat: "MÉDICO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🔦", name: "Lanterna Tática 1000lm", cat: "EQUIPAMENTO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🥫", name: "Ração de Emergência 72h", cat: "ALIMENTAÇÃO", store: "Shopee", link: "https://shopee.com.br/seu-link" },
  { icon: "☢", name: "Dosímetro de Radiação Pessoal", cat: "NUCLEAR", store: "Amazon", link: "https://amzn.to/seu-link" },
];

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
// FEEDS + AI — via API Route do servidor
// ═══════════════════════════════════════════
async function fetchFeeds() {
  try {
    const res = await fetch("/api/oracle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fetchNews" }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    const headlines = data.headlines || [];
    return headlines.map((t) => ({ title: t }));
  } catch {
    return [];
  }
}

async function callOracle(items) {
  try {
    const headlines = items.map((it) => it.title);
    const res = await fetch("/api/oracle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "analyze", headlines }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    if (data.success) return data;
    return null;
  } catch {
    return null;
  }
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
// NEWS FEED COMPONENT - NOVO COMPONENTE PARA EXIBIR NOTÍCIAS
// ═══════════════════════════════════════════
function NewsFeed({ headlines, loading }) {
  if (loading) {
    return (
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: C.goldDim, fontFamily: "Courier New,monospace", animation: "blink 1.2s ease-in-out infinite" }}>
          CARREGANDO MANCHETES GLOBAIS...
        </div>
      </div>
    );
  }

  if (!headlines || headlines.length === 0) {
    return (
      <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📡</