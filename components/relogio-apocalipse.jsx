"use client";

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

const HOTMART_LINKS = {
  omega:     "https://hotmart.com/seu-link-protocolo-omega",
  climatico: "https://hotmart.com/seu-link-colapso-climatico",
  singular:  "https://hotmart.com/seu-link-singularidade",
  kit:       "https://hotmart.com/seu-link-kit-bunker",
};

const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação, suprimentos.", price: "R$ 19,90", badge: "MAIS VENDIDO", link: HOTMART_LINKS.omega },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração.", price: "R$ 24,90", badge: null, link: HOTMART_LINKS.climatico },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle Humano", desc: "38 páginas. IA autônoma, cenários 2030-2050.", price: "R$ 19,90", badge: "NOVO", link: HOTMART_LINKS.singular },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto.", price: "R$ 44,90", badge: "ECONOMIA", link: HOTMART_LINKS.kit },
];

const AFFILIATES = [
  { icon: "📻", name: "Rádio Solar de Emergência", cat: "COMUNICAÇÃO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "💧", name: "Filtro de Água LifeStraw", cat: "SOBREVIVÊNCIA", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🧰", name: "Kit Primeiros Socorros Pro", cat: "MÉDICO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🔦", name: "Lanterna Tática 1000lm", cat: "EQUIPAMENTO", store: "Amazon", link: "https://amzn.to/seu-link" },
  { icon: "🥫", name: "Ração de Emergência 72h", cat: "ALIMENTAÇÃO", store: "Shopee", link: "https://shopee.com.br/seu-link" },
];

const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes históricos.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM SIMULTANEAMENTE · IA MILITAR SEM SUPERVISÃO · TEMPERATURA GLOBAL BATE RECORDE",
  violencia_br: 73,
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES EM EXPANSÃO", manchete_real: "Potências expandem ogivas sem tratados ativos", interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental: 34% em 18 anos.", impacto_anos: 3.2, categoria: "NUCLEAR", probabilidade: 72, gravidade: 9 },
    { titulo: "IA MILITAR SEM APROVAÇÃO HUMANA", manchete_real: "Sistemas autônomos operam sem loop humano", interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana documentado.", impacto_anos: 4.7, categoria: "IA", probabilidade: 61, gravidade: 10 },
    { titulo: "RECORDE DE TEMPERATURA GLOBAL", manchete_real: "2025 é o ano mais quente da história", interpretacao: "Terceiro ano consecutivo de recordes absolutos. Colapso agrícola global revisado para 2041.", impacto_anos: 2.1, categoria: "CLIMA", probabilidade: 89, gravidade: 8 },
  ],
};

// ═══════════════════════════════════════════
// MATH & HELPERS
// ═══════════════════════════════════════════
function secondsToYear(s) { return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START); }
function yearsLeft(s) { return YEAR_END - secondsToYear(s); }
function predYear(s) {
  const yr = secondsToYear(s), y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)] || "JAN", full: yr };
}
function getMidMs() { const n = new Date(), m = new Date(n); m.setHours(24,0,0,0); return m.getTime() - n.getTime(); }
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
// UI COMPONENTS (CLOCK, TICKER, METER)
// ═══════════════════════════════════════════

function SteampunkClock({ seconds, glitch, pulse }) {
  const S = 280, cx = S/2, cy = S/2, R = S/2;
  const fraction = seconds / HOUR_S;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;
  const [gearAngle, setGearAngle] = useState(0);
  useEffect(() => { const t = setInterval(() => setGearAngle(a => a + 0.4), 50); return () => clearInterval(t); }, []);

  function GearPath({ x, y, r, teeth, angle }) {
    let d = ""; const th = r * 0.32, tw = 0.55;
    for (let i = 0; i < teeth; i++) {
      const a1 = ((i-tw/2)/teeth)*Math.PI*2+angle, a2 = ((i+tw/2)/teeth)*Math.PI*2+angle;
      const a3 = ((i+0.5-tw/2)/teeth)*Math.PI*2+angle, a4 = ((i+0.5+tw/2)/teeth)*Math.PI*2+angle;
      const ro = r + th;
      if (i === 0) d += `M${x+Math.cos(a1)*r} ${y+Math.sin(a1)*r}`;
      d += ` L${x+Math.cos(a1)*r} ${y+Math.sin(a1)*r} L${x+Math.cos(a3)*ro} ${y+Math.sin(a3)*ro} L${x+Math.cos(a4)*ro} ${y+Math.sin(a4)*ro} L${x+Math.cos(a2)*r} ${y+Math.sin(a2)*r}`;
    }
    return <path d={d+"Z"} fill="#3d2a0a" stroke="#6b4a1a" strokeWidth="0.7" />;
  }

  const gears = [{ x: cx-R*0.60, y: cy-R*0.58, r: R*0.11, teeth: 11, speed: 0.8 }, { x: cx+R*0.63, y: cy-R*0.56, r: R*0.085, teeth: 9, speed: -1.2 }];
  const markers = Array.from({ length: 60 }, (_, i) => {
    const a = (i/60)*Math.PI*2 - Math.PI/2, major = i%5===0;
    return { x1: cx+Math.cos(a)*R*(major?0.76:0.82), y1: cy+Math.sin(a)*R*(major?0.76:0.82), x2: cx+Math.cos(a)*R*0.88, y2: cy+Math.sin(a)*R*0.88, major, zero: i===0 };
  });

  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: "block", maxWidth: "100%", transform: `scale(${pulse ? 1.012 : 1.0})`, filter: glitch ? "drop-shadow(0 0 22px #e63020cc)" : "drop-shadow(0 0 8px #8b5a0a44)", transition: "all 0.6s" }}>
      <circle cx={cx} cy={cy} r={R*0.99} fill="#1a1005" stroke="#7a5020" strokeWidth="2.5"/>
      {gears.map((g, i) => <GearPath key={i} x={g.x} y={g.y} r={g.r} teeth={g.teeth} angle={gearAngle*g.speed*Math.PI/180}/>)}
      <circle cx={cx} cy={cy} r={R*0.79} fill="#0a0800" stroke="#5a3a10" strokeWidth="1.5"/>
      {markers.map((m,i) => <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={m.zero?"#e63020":m.major?"#6b4a1a":"#2a1a06"} strokeWidth={m.zero?2:m.major?1.5:0.5}/>)}
      <text x={cx} y={cy-R*0.05} textAnchor="middle" fill={C.red} fontSize={R*0.12} fontFamily="Georgia" fontWeight="bold">{seconds}s</text>
      <line x1={cx} y1={cy} x2={cx+Math.cos(handRad)*R*0.7} y2={cy+Math.sin(handRad)*R*0.7} stroke={C.red} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function NewsTicker({ text }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(400);
  const [w, setW] = useState(0);
  useEffect(() => { if (ref.current) setW(ref.current.scrollWidth); }, [text]);
  useEffect(() => {
    if (!w) return; let x = window.innerWidth;
    const t = setInterval(() => { x -= 0.8; if (x < -w) x = window.innerWidth; setPos(x); }, 16);
    return () => clearInterval(t);
  }, [w]);
  return (
    <div style={{ background: "#0f0000", borderTop: `1px solid ${C.red}44`, height: 34, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, background: C.red, padding: "0 14px", height: "100%", display: "flex", alignItems: "center", color: "#fff", fontSize: 11, fontWeight: 700, zIndex: 2 }}>URGENTE</div>
      <div ref={ref} style={{ position: "absolute", whiteSpace: "nowrap", transform: `translateX(${pos}px)`, fontSize: 13, color: C.gold, fontFamily: "Courier New", lineHeight: "34px" }}>{text} ·· {text}</div>
    </div>
  );
}

function ViolenceMeter({ value }) {
  const color = value>=80?C.red:value>=60?"#e08020":C.green;
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "24px", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: C.goldDim, fontFamily: "Courier New", marginBottom: 16 }}>ÍNDICE DE VIOLÊNCIA</div>
      <div style={{ fontSize: 48, fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: 14, color: C.gray }}>NÍVEL {value>=80?"CRÍTICO":value>=60?"ALTO":"ESTÁVEL"}</div>
    </div>
  );
}

function HeadlinesSection({ news, onSelect }) {
  return (
    <div style={{ margin: "24px 0" }}>
      <div style={{ fontSize: 12, color: C.goldDim, fontFamily: "Courier New", marginBottom: 15, borderBottom: `1px solid ${C.border}`, paddingBottom: 5 }}>◈ MANCHETES CRÍTICAS</div>
      {news.map((item, idx) => (
        <div key={idx} onClick={() => onSelect(idx)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "15px", marginBottom: 10, cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: CAT_COLOR[item.categoria] }}>{item.categoria}</div>
          <div style={{ fontSize: 15, color: C.white, fontWeight: "bold" }}>{item.manchete_real}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [mounted, setMounted] = useState(false);
  const [seconds, setSeconds] = useState(OFFICIAL_S);
  const [previsoes, setPrevisoes] = useState(MOCK.previsoes);
  const [veredicto, setVeredicto] = useState(MOCK.veredicto);
  const [tickerText, setTickerText] = useState(MOCK.ticker);
  const [violencia, setViolencia] = useState(MOCK.violencia_br);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("relogio");
  const [activeIdx, setActiveIdx] = useState(null);
  const [midMs, setMidMs] = useState(0);

  useEffect(() => {
    setMounted(true); setMidMs(getMidMs());
    const t = setInterval(() => setMidMs(getMidMs()), 1000);
    return () => clearInterval(t);
  }, []);

 async function consult() {
    if (loading) return;
    setLoading(true);
    setVeredicto("CONSULTANDO O DESTINO..."); // Feedback visual imediato

    try {
      const res = await fetch("/api/oracle", { method: "POST" });
      const r = await res.json();
      
      // Se a IA respondeu com sucesso (campo success: true ou se vierem previsões)
      if (r && r.previsoes && r.previsoes.length > 0) {
        setPrevisoes(r.previsoes);
        setVeredicto(r.veredicto);
        setTickerText(r.ticker);
        setSeconds(s => s + (r.ajuste_segundos || 0));
        console.log("IA sincronizada com sucesso!");
      } else {
        // Se houver erro, mostra o veredicto de erro que a rota enviou
        setVeredicto(r.veredicto || "ERRO DESCONHECIDO");
        setPrevisoes(MOCK.previsoes); // Mantém as antigas para não sumir tudo
      }
    } catch (e) {
      setVeredicto("FALHA CRÍTICA NA CONEXÃO.");
      setPrevisoes(MOCK.previsoes);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;
  const pd = predYear(seconds);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.gray, fontFamily: "Georgia,serif" }}>
      <NewsTicker text={tickerText}/>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 80px" }}>
        
        {/* HEADER & NAV */}
        <header style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.gold, letterSpacing: 3 }}>RELÓGIO DO JUÍZO FINAL</div>
          <nav style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20 }}>
            {["relogio","oraculo","violencia","loja"].map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: "none", border: "none", color: page===p?C.red:C.gray, cursor: "pointer", fontFamily: "Courier New", fontSize: 12 }}>
                {p.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        {page === "relogio" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><SteampunkClock seconds={seconds}/></div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.red}55`, padding: "30px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: C.redDim }}>DATA PREVISTA DO COLAPSO</div>
              <div style={{ fontSize: 90, fontWeight: "bold", color: C.red }}>{pd.y}</div>
              <div style={{ fontSize: 24, color: C.redDim }}>{pd.m}</div>
            </div>
            <HeadlinesSection news={previsoes} onSelect={(i) => { setActiveIdx(i); setPage("oraculo"); }} />
            <button onClick={consult} style={{ width: "100%", padding: "20px", background: "#111", border: `1px solid ${C.red}`, color: C.red, cursor: "pointer", fontFamily: "Courier New" }}>
              {loading ? "CONSULTANDO..." : "◈ CONSULTAR ORÁCULO IA"}
            </button>
          </div>
        )}

        {page === "oraculo" && (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ color: C.gold, fontStyle: "italic", marginBottom: 30, fontSize: 18 }}>"{veredicto}"</div>
            {previsoes.map((ev, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", marginBottom: 15 }}>
                <div style={{ color: CAT_COLOR[ev.categoria], fontSize: 12 }}>{ev.categoria}</div>
                <div style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{ev.titulo}</div>
                <div style={{ fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>{ev.interpretacao}</div>
              </div>
            ))}
          </div>
        )}

        {page === "violencia" && <div style={{ maxWidth: 600, margin: "0 auto" }}><ViolenceMeter value={violencia}/></div>}

        {page === "loja" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {EBOOKS.map(b => (
              <a key={b.id} href={b.link} style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", textDecoration: "none" }}>
                <div style={{ fontSize: 40 }}>{b.icon}</div>
                <div style={{ color: C.white, fontSize: 18, fontWeight: "bold", margin: "10px 0" }}>{b.title}</div>
                <div style={{ color: C.gray, fontSize: 14 }}>{b.desc}</div>
                <div style={{ color: C.red, fontWeight: "bold", marginTop: 15 }}>{b.price}</div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}