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
  "PROCESSANDO SINAIS DE COLAPSO...",
];
const PAGES = ["relogio", "oraculo", "violencia", "loja"];
const PAGE_LABELS = {
  relogio: "RELÓGIO",
  oraculo: "ORÁCULO",
  violencia: "TERMÔMETRO BR",
  loja: "BUNKER STORE",
};
const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM SIMULTANEAMENTE · IA MILITAR SEM SUPERVISÃO DETECTADA · TEMPERATURA GLOBAL BATE RECORDE",
  violencia_br: 73,
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES EM EXPANSÃO GLOBAL", manchete_real: "Potências expandem ogivas sem tratados ativos", interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental: 34% em 18 anos. Tempo de resposta reduzido a 4 minutos.", impacto_anos: 3.2, categoria: "NUCLEAR", probabilidade: 72, gravidade: 9 },
    { titulo: "IA MILITAR SEM APROVAÇÃO HUMANA", manchete_real: "Sistemas autônomos operam sem loop humano", interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana documentado. Tempo de escalada cai de 72h para 11 minutos em conflito.", impacto_anos: 4.7, categoria: "IA", probabilidade: 61, gravidade: 10 },
    { titulo: "RECORDE DE TEMPERATURA GLOBAL", manchete_real: "2025 é o ano mais quente da história", interpretacao: "Terceiro ano consecutivo de recordes. Colapso agrícola global revisado para 2041, 9 anos antes da estimativa anterior.", impacto_anos: 2.1, categoria: "CLIMA", probabilidade: 89, gravidade: 8 },
  ],
};
const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação, suprimentos.", price: "R$ 19,90", badge: "MAIS VENDIDO" },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração, preparação para extremos.", price: "R$ 24,90", badge: null },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle Humano", desc: "38 páginas. IA autônoma, cenários 2030-2050, protocolos de resposta.", price: "R$ 19,90", badge: "NOVO" },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto. Download imediato.", price: "R$ 44,90", badge: "ECONOMIA" },
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
// MATH UTILS
// ═══════════════════════════════════════════
function secondsToYear(s) {
  return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START);
}
function yearsLeft(s) {
  return YEAR_END - secondsToYear(s);
}
function predYear(s) {
  const yr = secondsToYear(s);
  const y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)], full: yr };
}
function dangerPct(s) {
  return ((HOUR_S - s) / HOUR_S) * 100;
}
function getMidMs() {
  const n = new Date();
  const m = new Date(n);
  m.setHours(24, 0, 0, 0);
  return m - n;
}
function padZ(n, l = 2) {
  return String(n).padStart(l, "0");
}
function fmtMs(ms) {
  const s = Math.floor(ms / 1000);
  return {
    h: padZ(Math.floor(s / 3600)),
    m: padZ(Math.floor((s % 3600) / 60)),
    s: padZ(s % 60),
    ms: padZ(Math.floor(ms % 1000), 3),
  };
}
function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return { d, h: padZ(h), m: padZ(m), s: padZ(s % 60) };
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
    return Array.from(doc.querySelectorAll("item"))
      .slice(0, 7)
      .map(i => ({ title: i.querySelector("title")?.textContent || "" }))
      .filter(i => i.title);
  } catch {
    return [];
  }
}

async function fetchFeeds() {
  const all = [];
  for (const u of FEEDS) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(6000) });
      all.push(...parseRSS(await r.text()));
    } catch {}
  }
  return all.slice(0, 8);
}

async function callOracle(items) {
  const hl = items.map((it, i) => `${i + 1}. ${it.title}`).join("\n");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1600,
      system: `Você é o ALGORITMO CRONOS. Analise manchetes e calcule impacto no prazo de extinção humana.
Responda SOMENTE JSON válido sem markdown.
{"ajuste_segundos":inteiro -20 a 30,"veredicto":"frase sombria precisa","ticker":"manchete dramática máx 15 palavras","violencia_br":0-100,"previsoes":[{"titulo":"MAIÚSCULAS máx 7 palavras","manchete_real":"resumida","interpretacao":"2-3 frases apocalípticas","impacto_anos":decimal,"categoria":"NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO","probabilidade":1-99,"gravidade":1-10}]}`,
      messages: [{ role: "user", content: `Analise:\n${hl}` }],
    }),
  });
  const d = await res.json();
  const t = d.content?.map(c => c.text || "").join("") || "{}";
  try {
    return JSON.parse(t.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// STEAMPUNK CLOCK
// ═══════════════════════════════════════════
function SteampunkClock({ seconds, glitch, animating, pulse }) {
  const S = 300;
  const cx = S / 2;
  const cy = S / 2;
  const R = S / 2;
  const fraction = seconds / HOUR_S;
  const handDeg = -(fraction * 360);
  const handRad = (handDeg - 90) * Math.PI / 180;
  const [gearAngle, setGearAngle] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setGearAngle(a => a + 0.4), 50);
    return () => clearInterval(t);
  }, []);

  function GearPath({ x, y, r, teeth, angle }) {
    let d = "";
    const th = r * 0.32;
    const tw = 0.55;
    for (let i = 0; i < teeth; i++) {
      const a1 = ((i - tw / 2) / teeth) * Math.PI * 2 + angle;
      const a2 = ((i + tw / 2) / teeth) * Math.PI * 2 + angle;
      const a3 = ((i + 0.5 - tw / 2) / teeth) * Math.PI * 2 + angle;
      const a4 = ((i + 0.5 + tw / 2) / teeth) * Math.PI * 2 + angle;
      const ro = r + th;
      if (i === 0) d += `M${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`;
      d += ` L${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`;
      d += ` L${x + Math.cos(a3) * ro} ${y + Math.sin(a3) * ro}`;
      d += ` L${x + Math.cos(a4) * ro} ${y + Math.sin(a4) * ro}`;
      d += ` L${x + Math.cos(a2) * r} ${y + Math.sin(a2) * r}`;
    }
    return <path d={d + "Z"} fill="#3d2a0a" stroke="#6b4a1a" strokeWidth="0.7" />;
  }

  const gears = [
    { x: cx - R * 0.60, y: cy - R * 0.58, r: R * 0.11, teeth: 11, speed: 0.8 },
    { x: cx + R * 0.63, y: cy - R * 0.56, r: R * 0.085, teeth: 9, speed: -1.2 },
    { x: cx - R * 0.65, y: cy + R * 0.53, r: R * 0.09, teeth: 10, speed: 1.0 },
    { x: cx + R * 0.60, y: cy + R * 0.58, r: R * 0.075, teeth: 8, speed: -0.9 },
  ];

  const markers = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    return {
      x1: cx + Math.cos(a) * R * (major ? 0.76 : 0.82),
      y1: cy + Math.sin(a) * R * (major ? 0.76 : 0.82),
      x2: cx + Math.cos(a) * R * 0.88,
      y2: cy + Math.sin(a) * R * 0.88,
      major,
      zero: i === 0,
    };
  });

  const scale = pulse ? 1.012 : 1.0;
  const filterStr = glitch
    ? "drop-shadow(0 0 22px #c8341ccc) drop-shadow(0 0 50px #c8341c66)"
    : pulse
    ? "drop-shadow(0 0 18px #c8901a99) drop-shadow(0 0 40px #c8341c55)"
    : "drop-shadow(0 0 8px #8b5a0a55) drop-shadow(0 0 20px #c8341c1a)";

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      style={{
        display: "block",
        transform: `scale(${scale})`,
        filter: filterStr,
        transition: "filter 0.6s, transform 0.15s ease-out",
      }}
    >
      <defs>
        <radialGradient id="fg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#1a1005" />
          <stop offset="100%" stopColor="#0a0800" />
        </radialGradient>
        <radialGradient id="bg" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#5a3a10" />
          <stop offset="60%" stopColor="#3d2a08" />
          <stop offset="100%" stopColor="#1a1005" />
        </radialGradient>
        <pattern id="eng" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#2a1a05" strokeWidth="0.3" />
        </pattern>
      </defs>

      {/* Outer bezel */}
      <circle cx={cx} cy={cy} r={R * 0.99} fill="url(#bg)" stroke="#7a5020" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={R * 0.97} fill="none" stroke="#4a3010" strokeWidth="1" />

      {/* Rivets */}
      {[0, 90, 180, 270].map(a => {
        const rad = a * Math.PI / 180;
        return (
          <circle
            key={a}
            cx={cx + Math.cos(rad) * R * 0.93}
            cy={cy + Math.sin(rad) * R * 0.93}
            r={R * 0.024}
            fill="#8b6020"
            stroke="#6b4a10"
            strokeWidth="1"
          />
        );
      })}

      {/* Engraving */}
      <circle cx={cx} cy={cy} r={R * 0.95} fill="url(#eng)" opacity="0.35" />
      <circle cx={cx} cy={cy} r={R * 0.95} fill="none" stroke="#4a3010" strokeWidth="0.5" />

      {/* Gears */}
      {gears.map((g, i) => (
        <GearPath key={i} x={g.x} y={g.y} r={g.r} teeth={g.teeth} angle={gearAngle * g.speed * Math.PI / 180} />
      ))}
      {gears.map((g, i) => (
        <circle key={i} cx={g.x} cy={g.y} r={g.r * 0.28} fill="#5a3a10" stroke="#8b6020" strokeWidth="0.8" />
      ))}

      {/* Clock face */}
      <circle cx={cx} cy={cy} r={R * 0.79} fill="url(#fg)" />
      <circle cx={cx} cy={cy} r={R * 0.79} fill="url(#eng)" opacity="0.15" />
      <circle cx={cx} cy={cy} r={R * 0.79} fill="none" stroke="#5a3a10" strokeWidth="1.5" />

      {/* Danger glow near midnight */}
      {Array.from({ length: 18 }, (_, i) => {
        const frac = i / 60;
        const a = -Math.PI / 2 + frac * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * R * 0.40}
            y1={cy + Math.sin(a) * R * 0.40}
            x2={cx + Math.cos(a) * R * 0.79}
            y2={cy + Math.sin(a) * R * 0.79}
            stroke={`rgba(200,52,28,${0.055 - frac * 0.003})`}
            strokeWidth="5"
          />
        );
      })}

      {/* Inner rings */}
      {[0.64, 0.50, 0.36].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * r} fill="none" stroke="#2a1a06" strokeWidth="0.5" />
      ))}

      {/* Minute markers */}
      {markers.map((m, i) => (
        <line
          key={i}
          x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke={m.zero ? "#c8341c" : m.major ? "#6b4a1a" : "#2a1a06"}
          strokeWidth={m.zero ? 2 : m.major ? 1.5 : 0.5}
        />
      ))}

      {/* XII */}
      <text x={cx} y={cy - R * 0.64} textAnchor="middle" dominantBaseline="middle"
        fill="#c8901a" fontSize={R * 0.076} fontFamily="Georgia,serif" letterSpacing="2">XII</text>

      {/* XI and I */}
      {[{ l: "XI", a: -Math.PI / 2 - Math.PI / 6 }, { l: "I", a: -Math.PI / 2 + Math.PI / 6 }].map((h, i) => (
        <text key={i}
          x={cx + Math.cos(h.a) * R * 0.62}
          y={cy + Math.sin(h.a) * R * 0.62}
          textAnchor="middle" dominantBaseline="middle"
          fill="#5a3a10" fontSize={R * 0.062} fontFamily="Georgia,serif">{h.l}</text>
      ))}

      {/* Labels */}
      <text x={cx} y={cy - R * 0.52} textAnchor="middle" dominantBaseline="middle"
        fill="#4a2a08" fontSize={R * 0.029} fontFamily="Courier New,monospace" letterSpacing="3">MEIA-NOITE</text>
      <text x={cx} y={cy - R * 0.17} textAnchor="middle" dominantBaseline="middle"
        fill="#4a2a08" fontSize={R * 0.027} fontFamily="Courier New,monospace" letterSpacing="5">IT IS</text>
      <text x={cx} y={cy - R * 0.055} textAnchor="middle" dominantBaseline="middle"
        fill="#c8341c" fontSize={R * 0.082} fontFamily="Georgia,serif" fontWeight="bold"
        style={{ transition: "all 1.5s ease" }}>{seconds}s</text>
      <text x={cx} y={cy + R * 0.065} textAnchor="middle" dominantBaseline="middle"
        fill="#4a2a08" fontSize={R * 0.027} fontFamily="Courier New,monospace" letterSpacing="3">TO MIDNIGHT</text>
      <text x={cx} y={cy + R * 0.27} textAnchor="middle" dominantBaseline="middle"
        fill="#2a1a05" fontSize={R * 0.024} fontFamily="Courier New,monospace" letterSpacing="3">BOLETIM DOS CIENTISTAS</text>
      <text x={cx} y={cy + R * 0.34} textAnchor="middle" dominantBaseline="middle"
        fill="#2a1a05" fontSize={R * 0.024} fontFamily="Courier New,monospace" letterSpacing="3">DO APOCALIPSE</text>

      {/* Hand shadow */}
      <line
        x1={cx - Math.cos(handRad) * R * 0.13 + 1.5}
        y1={cy - Math.sin(handRad) * R * 0.13 + 1.5}
        x2={cx + Math.cos(handRad) * R * 0.70 + 1.5}
        y2={cy + Math.sin(handRad) * R * 0.70 + 1.5}
        stroke="#00000066" strokeWidth={R * 0.026} strokeLinecap="round"
      />
      {/* Hand glow */}
      <line
        x1={cx - Math.cos(handRad) * R * 0.13}
        y1={cy - Math.sin(handRad) * R * 0.13}
        x2={cx + Math.cos(handRad) * R * 0.70}
        y2={cy + Math.sin(handRad) * R * 0.70}
        stroke="#c8341c44" strokeWidth={R * 0.065} strokeLinecap="round"
      />
      {/* Hand */}
      <line
        x1={cx - Math.cos(handRad) * R * 0.13}
        y1={cy - Math.sin(handRad) * R * 0.13}
        x2={cx + Math.cos(handRad) * R * 0.70}
        y2={cy + Math.sin(handRad) * R * 0.70}
        stroke="#c8341c" strokeWidth={R * 0.022} strokeLinecap="round"
        style={{ transition: "x2 2s cubic-bezier(0.4,0,0.2,1), y2 2s, x1 2s, y1 2s" }}
      />

      {/* Center boss */}
      <circle cx={cx} cy={cy} r={R * 0.048} fill="#6b4a10" stroke="#8b6a20" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={R * 0.026} fill="#c8901a" />
      <circle cx={cx} cy={cy} r={R * 0.011} fill="#e8c050" />

      {/* Outer ring glow */}
      <circle cx={cx} cy={cy} r={R * 0.79} fill="none" stroke="#c8341c" strokeWidth="1"
        opacity={pulse ? 0.18 : 0.06} style={{ transition: "opacity 0.15s" }} />
    </svg>
  );
}

// ═══════════════════════════════════════════
// DAILY SURVIVAL CLOCK
// ═══════════════════════════════════════════
function DailyClock({ ms }) {
  const t = fmtMs(ms);
  const [blink, setBlink] = useState(true);
  const pct = (ms / 86400000) * 100;
  const urgency = pct < 10;
  const barColor = urgency ? "#c8341c" : pct < 30 ? "#c87820" : "#6b4a1a";
  const survived = ms <= 500;

  useEffect(() => {
    const i = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{
      border: `1px solid ${urgency ? "#c8341c88" : "#3a2008"}`,
      background: urgency ? "linear-gradient(135deg,#0f0300,#080100)" : "#060200",
      padding: "18px",
      position: "relative",
      overflow: "hidden",
      transition: "border 2s, background 2s",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${urgency ? "#c8341c" : "#6b4a1a"}, transparent)`,
        opacity: blink ? 1 : 0.3,
        transition: "opacity 0.5s",
      }} />

      <div style={{
        fontSize: 9, letterSpacing: 5,
        color: urgency ? "#c87060" : "#5a3010",
        fontFamily: "Courier New, monospace",
        textAlign: "center", marginBottom: 12,
        fontStyle: "italic",
      }}>
        {survived
          ? "✓ SOBREVIVEMOS MAIS UM DIA"
          : urgency
          ? "⚠ AS HORAS FINAIS DE HOJE..."
          : "HOJE AINDA ESTAREMOS AQUI?"}
      </div>

      {survived ? (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 26, color: "#289850", fontFamily: "Courier New, monospace", letterSpacing: 4 }}>
            00:00:00
          </div>
          <div style={{ fontSize: 9, color: "#289850", letterSpacing: 4, fontFamily: "Courier New, monospace", marginTop: 6 }}>
            A HUMANIDADE PERSISTE. POR ENQUANTO.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 2, marginBottom: 8 }}>
            {[{ v: t.h, l: "H" }, { v: null }, { v: t.m, l: "M" }, { v: null }, { v: t.s, l: "S" }].map((seg, i) => {
              if (seg.v === null) {
                return (
                  <span key={i} style={{
                    fontSize: "clamp(20px,4vw,32px)", fontWeight: 700,
                    color: urgency ? "#c8341c" : "#8b6020",
                    opacity: blink ? 1 : 0.15,
                    lineHeight: 1, margin: "0 1px", paddingBottom: 8,
                    transition: "opacity 0.1s, color 2s",
                  }}>:</span>
                );
              }
              return (
                <div key={i} style={{ textAlign: "center", minWidth: "clamp(30px,5vw,46px)" }}>
                  <div style={{
                    fontSize: "clamp(20px,4vw,32px)", fontWeight: 700,
                    color: urgency ? "#c8341c" : "#c8901a",
                    lineHeight: 1, fontVariantNumeric: "tabular-nums",
                    transition: "color 2s",
                  }}>{seg.v}</div>
                  <div style={{ fontSize: 7, color: "#3a1808", letterSpacing: 3, marginTop: 2, fontFamily: "Courier New, monospace" }}>{seg.l}</div>
                </div>
              );
            })}
            <div style={{ marginLeft: 4, paddingBottom: 1 }}>
              <span style={{ fontSize: 10, color: urgency ? "#c8341c88" : "#8b602088", fontFamily: "Courier New, monospace" }}>
                .{t.ms}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 6 }}>
            <div style={{ height: 3, background: "#0a0400", overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${barColor}44, ${barColor})`,
                boxShadow: `0 0 6px ${barColor}`,
                transition: "width 1s linear, background 3s",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#2a1208", fontFamily: "Courier New, monospace", letterSpacing: 2, marginTop: 3 }}>
              <span>MEIA-NOITE</span>
              <span style={{ color: barColor }}>{pct.toFixed(1)}% DO DIA RESTANTE</span>
              <span>00:00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// HEARTBEAT COUNTERS
// ═══════════════════════════════════════════
function HeartbeatCounters({ sinceMs, untilMs }) {
  const since = fmtDuration(sinceMs);
  const until = fmtDuration(untilMs);
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 180);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  const totalSpan = NEXT_REVIEW_DATE.getTime() - AGGRAVATION_DATE.getTime();
  const elapsed = totalSpan - untilMs;
  const reviewPct = Math.min(100, (elapsed / totalSpan) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Since aggravation */}
      <div style={{ border: "1px solid #3a2008", background: "#060200", padding: "14px 16px" }}>
        <div style={{ fontSize: 8, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 6 }}>
          ◈ DESDE O ÚLTIMO AGRAVAMENTO
        </div>
        <div style={{ fontSize: 9, color: "#5a3010", fontFamily: "Courier New, monospace", marginBottom: 10, lineHeight: 1.6 }}>
          Em 28 Jan 2026, o relógio avançou para{" "}
          <span style={{ color: "#c8341c", fontWeight: 700 }}>85 segundos</span>.
          O perigo persiste há:
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          {[{ v: since.d, l: "DIAS" }, { v: since.h, l: "H" }, { v: since.m, l: "MIN" }, { v: since.s, l: "SEG" }].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: i === 0 ? "clamp(20px,3.5vw,28px)" : "clamp(14px,2.5vw,20px)",
                fontWeight: 700,
                color: i === 0 ? "#c8341c" : "#8b5a20",
                fontFamily: "Courier New, monospace",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}>{seg.v}</div>
              <div style={{ fontSize: 7, color: "#3a1808", letterSpacing: 3, fontFamily: "Courier New, monospace", marginTop: 2 }}>{seg.l}</div>
            </div>
          ))}
          {/* Heartbeat dot */}
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: beat ? "#c8341c" : "#2a0808",
            boxShadow: beat ? "0 0 10px #c8341c" : "none",
            transition: "background 0.1s, box-shadow 0.1s",
            alignSelf: "center", marginLeft: 4,
          }} />
        </div>
      </div>

      {/* Until next review */}
      <div style={{ border: "1px solid #3a2008", background: "#060200", padding: "14px 16px" }}>
        <div style={{ fontSize: 8, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 6 }}>
          ◈ ATÉ A PRÓXIMA REVISÃO OFICIAL
        </div>
        <div style={{ fontSize: 9, color: "#5a3010", fontFamily: "Courier New, monospace", marginBottom: 10, lineHeight: 1.6 }}>
          O Bulletin revisa o relógio em{" "}
          <span style={{ color: "#c8901a" }}>Janeiro de 2027</span>.
          Vai piorar ou melhorar?
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
          {[{ v: until.d, l: "DIAS" }, { v: until.h, l: "H" }, { v: until.m, l: "MIN" }, { v: until.s, l: "SEG" }].map((seg, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: i === 0 ? "clamp(20px,3.5vw,28px)" : "clamp(14px,2.5vw,20px)",
                fontWeight: 700,
                color: i === 0 ? "#c8901a" : "#8b5a20",
                fontFamily: "Courier New, monospace",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}>{seg.v}</div>
              <div style={{ fontSize: 7, color: "#3a1808", letterSpacing: 3, fontFamily: "Courier New, monospace", marginTop: 2 }}>{seg.l}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: "#0a0400" }}>
          <div style={{ height: "100%", width: `${reviewPct}%`, background: "linear-gradient(90deg,#3a1808,#c8901a)", transition: "width 1s" }} />
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
  const [pos, setPos] = useState(800);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (ref.current) setW(ref.current.scrollWidth);
  }, [text]);

  useEffect(() => {
    if (!w) return;
    let x = window.innerWidth || 800;
    const t = setInterval(() => {
      x -= 0.7;
      if (x < -w) x = window.innerWidth || 800;
      setPos(x);
    }, 16);
    return () => clearInterval(t);
  }, [w]);

  const full = `${text} ·· ${text} ·· ${text}`;

  return (
    <div style={{
      background: "#080300",
      borderTop: "1px solid #2a1208",
      borderBottom: "1px solid #2a1208",
      padding: "6px 0",
      overflow: "hidden",
      position: "relative",
      height: 30,
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", zIndex: 2 }}>
        <div style={{
          background: "#c8341c",
          padding: "0 12px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          fontSize: 8,
          letterSpacing: 4,
          color: "#fff",
          fontFamily: "Courier New, monospace",
          fontWeight: 700,
          boxShadow: "4px 0 8px #00000088",
        }}>URGENTE</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 76, right: 0, overflow: "hidden" }}>
        <div ref={ref} style={{
          position: "absolute",
          top: 0,
          whiteSpace: "nowrap",
          transform: `translateX(${pos}px)`,
          fontSize: 10,
          color: "#c8901a",
          fontFamily: "Courier New, monospace",
          letterSpacing: 2,
          lineHeight: "30px",
        }}>{full}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PREDICTION CARD
// ═══════════════════════════════════════════
function PredCard({ ev, active, onToggle, delay = 0 }) {
  const col = CAT_COLOR[ev.categoria] || "#c8341c";
  const label = CAT_LABEL[ev.categoria] || ev.categoria;
  const worsens = ev.impacto_anos > 0;

  return (
    <div
      onClick={onToggle}
      style={{
        border: `1px solid ${active ? col + "55" : "#2a1208"}`,
        background: active ? `${col}09` : "#060200",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${col}${Math.round((ev.gravidade || 5) / 10 * 255).toString(16).padStart(2, "0")}, transparent)`,
      }} />
      <div style={{ padding: "15px 17px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: col, fontFamily: "Courier New, monospace", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c8a070", lineHeight: 1.4 }}>{ev.titulo}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: worsens ? "#c8341c" : "#289850", fontFamily: "Courier New, monospace", lineHeight: 1 }}>
              {worsens ? "+" : "-"}{Math.abs(ev.impacto_anos).toFixed(1)}
            </div>
            <div style={{ fontSize: 7, letterSpacing: 2, color: "#3a1808", fontFamily: "Courier New, monospace" }}>ANOS</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#5a3020", fontStyle: "italic", lineHeight: 1.5, borderLeft: "2px solid #2a1208", paddingLeft: 8, marginBottom: active ? 12 : 0 }}>
          "{ev.manchete_real}"
        </div>
        {active && (
          <div style={{ borderTop: "1px solid #1a0a04", paddingTop: 10, marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#7a5030", lineHeight: 1.75, marginBottom: 10 }}>{ev.interpretacao}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 7, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 3 }}>PROBABILIDADE</div>
                <div style={{ fontSize: 13, color: col, fontFamily: "Courier New, monospace", fontWeight: 700 }}>{ev.probabilidade}%</div>
              </div>
              <div>
                <div style={{ fontSize: 7, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 3 }}>GRAVIDADE</div>
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} style={{ width: 7, height: 7, background: i < (ev.gravidade || 0) ? col : "#1a0a04" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {!active && (
          <div style={{ marginTop: 5, fontSize: 8, color: "#1a0a04", letterSpacing: 3, fontFamily: "Courier New, monospace" }}>
            EXPANDIR ▼
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VIOLENCE METER
// ═══════════════════════════════════════════
function ViolenceMeter({ value = 73 }) {
  const color = value >= 80 ? "#c8341c" : value >= 60 ? "#c87820" : value >= 40 ? "#a89020" : "#289850";
  const label = value >= 80 ? "CRÍTICO" : value >= 60 ? "ALTO" : value >= 40 ? "MODERADO" : "BAIXO";
  const STATES = [
    { name: "SP", v: 82 }, { name: "RJ", v: 78 }, { name: "BA", v: 75 }, { name: "PE", v: 71 },
    { name: "CE", v: 68 }, { name: "MG", v: 52 }, { name: "RS", v: 45 }, { name: "PR", v: 42 },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Gauge */}
        <div style={{ border: "1px solid #3a2008", background: "#080400", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 8, letterSpacing: 5, color: "#4a2a08", fontFamily: "Courier New, monospace", marginBottom: 14 }}>ÍNDICE NACIONAL</div>
          <div style={{ position: "relative", width: 150, height: 85, margin: "0 auto 14px" }}>
            <svg width="150" height="85" viewBox="0 0 150 85">
              <path d="M 8 76 A 67 67 0 0 1 142 76" fill="none" stroke="#1a0a04" strokeWidth="14" strokeLinecap="round" />
              <path d="M 8 76 A 67 67 0 0 1 142 76" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(value / 100) * 210} 210`} />
              {(() => {
                const a = Math.PI - (value / 100) * Math.PI;
                const nx = 75 + Math.cos(a) * 58;
                const ny = 76 - Math.sin(a) * 58;
                return (
                  <>
                    <line x1="75" y1="76" x2={nx} y2={ny} stroke="#c8341c" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="75" cy="76" r="5" fill="#5a3a10" stroke="#c8901a" strokeWidth="1.5" />
                  </>
                );
              })()}
              <text x="75" y="68" textAnchor="middle" fill={color} fontSize="20" fontFamily="Georgia,serif" fontWeight="bold">{value}</text>
              <text x="8" y="83" fill="#3a1a08" fontSize="7" fontFamily="Courier New,monospace">BAIXO</text>
              <text x="116" y="83" fill="#3a1a08" fontSize="7" fontFamily="Courier New,monospace">ALTO</text>
            </svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "Courier New, monospace", letterSpacing: 3 }}>{label}</div>
        </div>

        {/* Impact */}
        <div style={{ border: "1px solid #3a2008", background: "#080400", padding: "20px" }}>
          <div style={{ fontSize: 8, letterSpacing: 5, color: "#4a2a08", fontFamily: "Courier New, monospace", marginBottom: 12 }}>IMPACTO NO RELÓGIO</div>
          <div style={{ fontSize: 11, color: "#6a4020", lineHeight: 1.8, marginBottom: 14 }}>
            Alta instabilidade social acelera colapsos regionais e contribui para o componente geopolítico global.
          </div>
          <div style={{ height: 4, background: "#0f0600", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg,#3a1008,${color})`, boxShadow: `0 0 6px ${color}55`, transition: "width 1s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#3a1808", fontFamily: "Courier New, monospace", letterSpacing: 2, marginBottom: 14 }}>
            <span>0%</span><span style={{ color }}>{value}%</span><span>100%</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "Courier New, monospace" }}>
            +{(value / 100 * 2.4).toFixed(1)} <span style={{ fontSize: 9, color: "#5a3020" }}>ANOS ADICIONADOS</span>
          </div>
        </div>
      </div>

      {/* States */}
      <div style={{ border: "1px solid #3a2008", background: "#080400", padding: "18px", marginBottom: 16 }}>
        <div style={{ fontSize: 8, letterSpacing: 5, color: "#4a2a08", fontFamily: "Courier New, monospace", marginBottom: 14 }}>ESTADOS EM ALERTA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
          {STATES.map((st, i) => {
            const c = st.v >= 75 ? "#c8341c" : st.v >= 60 ? "#c87820" : "#a89020";
            return (
              <div key={i} style={{ border: `1px solid ${c}33`, background: "#060200", padding: "9px 11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#c8901a", fontFamily: "Courier New, monospace" }}>{st.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: "Courier New, monospace" }}>{st.v}</span>
                </div>
                <div style={{ height: 2, background: "#0f0600" }}>
                  <div style={{ height: "100%", width: `${st.v}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "12px 16px" }}>
        <div style={{ fontSize: 9, color: "#3a1808", fontFamily: "Courier New, monospace", lineHeight: 1.8 }}>
          ◈ Índice calculado por IA com base em análise de notícias públicas. Não representa dado oficial. Atualizado a cada consulta ao Oráculo.
        </div>
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
  const [tickerText, setTickerText] = useState("RELÓGIO DO JUÍZO FINAL · 85 SEGUNDOS PARA A MEIA-NOITE · RECORDE HISTÓRICO EM 79 ANOS");
  const [violencia, setViolencia] = useState(73);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const [midMs, setMidMs] = useState(getMidMs());
  const [sinceMs, setSinceMs] = useState(Date.now() - AGGRAVATION_DATE.getTime());
  const [untilMs, setUntilMs] = useState(NEXT_REVIEW_DATE.getTime() - Date.now());
  const [consultas, setConsultas] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [oracMsg, setOracMsg] = useState("");
  const [page, setPage] = useState("relogio");

  // Timers
  useEffect(() => {
    const t = setInterval(() => {
      setMidMs(getMidMs());
      setSinceMs(Date.now() - AGGRAVATION_DATE.getTime());
      setUntilMs(NEXT_REVIEW_DATE.getTime() - Date.now());
    }, 40);
    return () => clearInterval(t);
  }, []);

  // Heartbeat
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 180);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  async function consult() {
    if (loading) return;
    setLoading(true);
    setPhase("loading");
    setActiveIdx(null);
    setOracMsg(LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);
    try {
      const items = await fetchFeeds();
      const r = (await callOracle(items.length ? items : [])) || MOCK;
      const newS = Math.max(10, Math.min(HOUR_S - 10, seconds + (r.ajuste_segundos || 0)));
      if (r.ticker) setTickerText(r.ticker.toUpperCase());
      if (r.violencia_br) setViolencia(r.violencia_br);
      setAnimating(true);
      setTimeout(() => { setSeconds(newS); setGlitch(true); }, 400);
      setTimeout(() => { setGlitch(false); setAnimating(false); }, 1800);
      setPrevisoes(r.previsoes || []);
      setVeredicto(r.veredicto || "");
      const pd = predYear(newS);
      setConsultas(prev => [{
        ts: new Date().toLocaleTimeString("pt-BR"),
        seconds: newS,
        delta: r.ajuste_segundos || 0,
        year: pd.y,
        veredicto: r.veredicto || "",
      }, ...prev].slice(0, 6));
      setPhase("reveal");
    } catch {
      setPrevisoes(MOCK.previsoes);
      setVeredicto(MOCK.veredicto);
      setPhase("reveal");
    }
    setLoading(false);
  }

  const pd = predYear(seconds);
  const yl = yearsLeft(seconds);
  const dp = dangerPct(seconds);
  const tclr = seconds <= 60 ? "#e83030" : seconds <= 90 ? "#c8341c" : seconds <= 120 ? "#c87020" : "#c89020";
  const threat = seconds <= 60 ? "CATASTRÓFICO" : seconds <= 90 ? "CRÍTICO" : seconds <= 120 ? "SEVERO" : "ALTO";

  function navBtn(id) {
    return {
      background: "transparent",
      border: "none",
      borderBottom: `2px solid ${page === id ? "#c8341c" : "transparent"}`,
      color: page === id ? "#c8901a" : "#4a2a08",
      fontFamily: "Courier New, monospace",
      fontSize: 9,
      letterSpacing: 4,
      padding: "10px 12px",
      cursor: "pointer",
      transition: "all 0.2s",
    };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060200", color: "#c0a070", fontFamily: "Georgia, Times New Roman, serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; background: #060200; }
        ::-webkit-scrollbar-thumb { background: #3a2008; }
      `}</style>

      {/* Grain */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.18,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />
      {/* Vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 30%, rgba(3,1,0,0.95) 100%)" }} />

      <div style={{ position: "relative", zIndex: 2 }}>

        {/* MASTHEAD */}
        <header style={{ background: "rgba(6,2,0,0.98)", borderBottom: "1px solid #2a1208" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
            <div style={{ borderBottom: "1px solid #1a0a04", padding: "6px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 8, letterSpacing: 4, color: "#2a1208", fontFamily: "Courier New, monospace", flexWrap: "wrap", gap: 4 }}>
              <span>BOLETIM DOS CIENTISTAS DO APOCALIPSE · EST. 1947</span>
              <span style={{ color: tclr }}>{threat} · {seconds}s · {dp.toFixed(1)}% CONSUMIDO</span>
            </div>
            <div style={{ padding: "14px 0 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "clamp(15px,3vw,26px)", fontWeight: 700, color: "#c8901a", letterSpacing: 5, fontFamily: "Georgia, serif", textShadow: glitch ? "3px 0 #c8341c, -3px 0 #2890a8" : "0 0 20px #c8901a22", transition: "text-shadow 0.15s" }}>
                  RELÓGIO DO JUÍZO FINAL
                </div>
                <div style={{ fontSize: 8, letterSpacing: 5, color: "#3a1808", fontFamily: "Courier New, monospace", marginTop: 4 }}>
                  DOOMSDAY CLOCK · ANÁLISE COMPUTACIONAL CONTÍNUA
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 2 }}>PREVISÃO ATUAL</div>
                <div style={{ fontSize: "clamp(20px,4vw,36px)", fontWeight: 700, color: tclr, letterSpacing: 2, fontFamily: "Courier New, monospace", textShadow: `0 0 20px ${tclr}44`, transition: "all 2s ease" }}>
                  {pd.y} <span style={{ fontSize: "0.42em", color: "#7a4020", letterSpacing: 4 }}>{pd.m}</span>
                </div>
              </div>
            </div>
            <nav style={{ display: "flex", gap: 0, borderTop: "1px solid #1a0a04" }}>
              {PAGES.map(p => (
                <button key={p} onClick={() => setPage(p)} style={navBtn(p)}>{PAGE_LABELS[p]}</button>
              ))}
            </nav>
          </div>
        </header>

        <NewsTicker text={tickerText} />

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>

          {/* ══ RELÓGIO ══ */}
          {page === "relogio" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,360px) 1fr", gap: 32, alignItems: "start" }}>

              {/* LEFT — Clock column */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <SteampunkClock seconds={seconds} glitch={glitch} animating={animating} pulse={pulse} />
                <HeartbeatCounters sinceMs={sinceMs} untilMs={untilMs} />
                <DailyClock ms={midMs} />
              </div>

              {/* RIGHT */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Predicted year */}
                <div style={{ border: `1px solid ${tclr}44`, background: "linear-gradient(160deg,#0e0600,#080400)", padding: "24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: `radial-gradient(ellipse at top right,${tclr}0c,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontSize: 8, letterSpacing: 5, color: "#5a2808", fontFamily: "Courier New, monospace", marginBottom: 10 }}>
                    ◈ PREVISÃO COMPUTACIONAL DO COLAPSO CIVILIZACIONAL
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
                    <div style={{ fontSize: "clamp(48px,8vw,72px)", fontWeight: 700, color: tclr, lineHeight: 0.9, fontFamily: "Georgia, serif", textShadow: `0 0 40px ${tclr}44`, transition: "all 2s ease" }}>
                      {pd.y}
                    </div>
                    <div>
                      <div style={{ fontSize: "clamp(13px,2.5vw,19px)", color: "#c87040", fontFamily: "Courier New, monospace", letterSpacing: 4 }}>{pd.m}</div>
                      <div style={{ fontSize: 8, color: "#5a2808", fontFamily: "Courier New, monospace", letterSpacing: 3, marginTop: 4 }}>{yl.toFixed(1)} ANOS RESTANTES</div>
                    </div>
                  </div>

                  {/* Timeline bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: "#2a1208", fontFamily: "Courier New, monospace", letterSpacing: 2, marginBottom: 4 }}>
                      <span>2024</span><span>HOJE</span><span style={{ color: tclr + "99" }}>{pd.y}</span><span>2124</span>
                    </div>
                    <div style={{ height: 10, background: "#0a0400", border: "1px solid #1a0a04", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${((2026 - 2024) / 100) * 100}%`, background: "#1a0804" }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((2026 - 2024) / 100) * 100}%`, width: `${((pd.full - 2026) / 100) * 100}%`, background: `linear-gradient(90deg,#3a1008,${tclr}33)` }} />
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${((pd.full - 2024) / 100) * 100}%`, width: 2, background: tclr, boxShadow: `0 0 6px ${tclr}` }} />
                    </div>
                  </div>

                  {veredicto ? (
                    <div style={{ fontSize: 12, color: "#7a4030", fontStyle: "italic", lineHeight: 1.7, borderTop: "1px solid #1a0a04", paddingTop: 12 }}>
                      "{veredicto}"
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "#3a1808", lineHeight: 1.7, borderTop: "1px solid #0f0600", paddingTop: 12 }}>
                      Baseado na leitura oficial de <span style={{ color: "#c8341c" }}>85 segundos</span> (Jan 2026).
                      Escala: 1 hora = 100 anos. A data é recalculada a cada consulta ao Oráculo.
                    </div>
                  )}
                </div>

                {/* Oracle button */}
                <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, letterSpacing: 5, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 8 }}>
                    ALGORITMO CRONOS · ANÁLISE DE AMEAÇAS GLOBAIS
                  </div>
                  <div style={{ fontSize: 11, color: "#5a3010", lineHeight: 1.7, marginBottom: 16 }}>
                    O Oráculo analisa o estado atual do mundo e recalcula a data prevista do colapso.
                    A cada consulta, o relógio pode avançar ou recuar.
                  </div>
                  <button
                    onClick={consult}
                    disabled={loading}
                    style={{
                      width: "100%",
                      background: loading ? "transparent" : "linear-gradient(180deg,#180800,#0f0500)",
                      border: `1px solid ${loading ? "#2a1208" : tclr + "88"}`,
                      color: loading ? "#3a1808" : tclr,
                      fontFamily: "Courier New, monospace",
                      fontSize: 11,
                      letterSpacing: 5,
                      padding: "14px 24px",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.4s",
                    }}
                  >
                    {loading
                      ? <span style={{ animation: "blink 1.2s ease-in-out infinite" }}>◈  {oracMsg}</span>
                      : "◈  CONSULTAR O ORÁCULO"}
                  </button>
                  {phase === "reveal" && previsoes.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 8, color: "#3a1808", fontFamily: "Courier New, monospace", letterSpacing: 3 }}>
                      {previsoes.length} FATORES ANALISADOS · DATA RECALCULADA
                    </div>
                  )}
                </div>

                {/* Historical reference */}
                <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "14px 16px" }}>
                  <div style={{ fontSize: 8, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 10 }}>REFERÊNCIA HISTÓRICA OFICIAL</div>
                  {[
                    { y: "1991", s: "17 min", n: "Mais seguro. Fim da Guerra Fria.", cur: false },
                    { y: "1947", s: "7 min", n: "Criação. Era Nuclear.", cur: false },
                    { y: "1953", s: "2 min", n: "Bombas de hidrogênio.", cur: false },
                    { y: "2023", s: "90s", n: "Guerra na Ucrânia.", cur: false },
                    { y: "2026", s: "85s", n: "Atual. Recorde histórico.", cur: true },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: i < 4 ? "1px solid #0f0600" : "none", opacity: r.cur ? 1 : 0.45 }}>
                      <span style={{ fontSize: 8, color: "#3a1808", fontFamily: "Courier New, monospace", width: 28, flexShrink: 0 }}>{r.y}</span>
                      <span style={{ fontSize: 9, color: r.cur ? tclr : "#5a3010", fontFamily: "Courier New, monospace", fontWeight: r.cur ? 700 : 400, width: 36, flexShrink: 0 }}>{r.s}</span>
                      <span style={{ fontSize: 10, color: r.cur ? "#c87060" : "#3a1808" }}>{r.n}</span>
                    </div>
                  ))}
                </div>

                {/* Consulta history */}
                {consultas.length > 0 && (
                  <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "13px 15px" }}>
                    <div style={{ fontSize: 8, letterSpacing: 5, color: "#2a1208", fontFamily: "Courier New, monospace", marginBottom: 10 }}>HISTÓRICO DE CONSULTAS</div>
                    {consultas.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: i < consultas.length - 1 ? "1px solid #0a0400" : "none", opacity: 1 - i * 0.13 }}>
                        <span style={{ fontSize: 8, color: "#2a1208", fontFamily: "Courier New, monospace", flexShrink: 0 }}>{c.ts}</span>
                        <span style={{ fontSize: 10, color: "#c8341c", fontFamily: "Courier New, monospace", fontWeight: 700, flexShrink: 0 }}>{c.year}</span>
                        <span style={{ fontSize: 8, fontFamily: "Courier New, monospace", flexShrink: 0, color: c.delta > 0 ? "#c8341c" : "#289850" }}>{c.delta > 0 ? `+${c.delta}s` : `${c.delta}s`}</span>
                        <span style={{ fontSize: 10, color: "#3a1808", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.veredicto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ORÁCULO ══ */}
          {page === "oraculo" && (
            <div>
              <div style={{ fontSize: 8, letterSpacing: 6, color: "#5a2808", fontFamily: "Courier New, monospace", marginBottom: 16 }}>◈ PREVISÕES DO ALGORITMO CRONOS</div>
              {phase !== "reveal" ? (
                <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "28px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#5a3010", marginBottom: 20, lineHeight: 1.7 }}>Nenhuma análise realizada. Consulte o Oráculo na aba Relógio.</div>
                  <button
                    onClick={() => { setPage("relogio"); setTimeout(consult, 100); }}
                    style={{ background: "transparent", border: `1px solid ${tclr}88`, color: tclr, fontFamily: "Courier New, monospace", fontSize: 10, letterSpacing: 4, padding: "12px 28px", cursor: "pointer" }}
                  >
                    ◈ CONSULTAR AGORA
                  </button>
                </div>
              ) : (
                <div>
                  {veredicto && (
                    <div style={{ border: "1px solid #2a1208", background: "#0a0400", padding: "15px 19px", marginBottom: 18 }}>
                      <div style={{ fontSize: 8, letterSpacing: 4, color: "#3a1808", fontFamily: "Courier New, monospace", marginBottom: 5 }}>VEREDICTO</div>
                      <div style={{ fontSize: 13, color: "#8a5030", fontStyle: "italic", lineHeight: 1.7 }}>"{veredicto}"</div>
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 18 }}>
                    {previsoes.map((ev, i) => (
                      <PredCard key={i} ev={ev} active={activeIdx === i} onToggle={() => setActiveIdx(activeIdx === i ? null : i)} delay={i * 80} />
                    ))}
                  </div>
                  <div style={{ border: "1px solid #1a0a04", background: "#060200", padding: "14px 18px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 7, letterSpacing: 3, color: "#2a1208", fontFamily: "Courier New, monospace", marginBottom: 3 }}>IMPACTO TOTAL</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: tclr, fontFamily: "Courier New, monospace" }}>
                        {previsoes.reduce((s, e) => s + e.impacto_anos, 0) > 0 ? "+" : ""}
                        {previsoes.reduce((s, e) => s + e.impacto_anos, 0).toFixed(1)} ANOS
                      </div>
                    </div>
                    <div style={{ flex: 1, height: 1, background: "#120608" }} />
                    <div style={{ fontSize: 10, color: "#5a3010", fontStyle: "italic", maxWidth: 260 }}>
                      Esta análise {previsoes.reduce((s, e) => s + e.impacto_anos, 0) > 0 ? "aproximou" : "afastou"} o colapso da previsão anterior.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ VIOLÊNCIA ══ */}
          {page === "violencia" && (
            <div>
              <div style={{ fontSize: 8, letterSpacing: 6, color: "#5a2808", fontFamily: "Courier New, monospace", marginBottom: 6 }}>◈ TERMÔMETRO DA VIOLÊNCIA · BRASIL</div>
              <div style={{ fontSize: 11, color: "#4a2810", marginBottom: 20, lineHeight: 1.7 }}>
                Índice calculado por IA com base em análise de notícias brasileiras. Atualizado a cada consulta ao Oráculo.
              </div>
              <ViolenceMeter value={violencia} />
            </div>
          )}

          {/* ══ LOJA ══ */}
          {page === "loja" && (
            <div>
              <div style={{ fontSize: 8, letterSpacing: 6, color: "#5a2808", fontFamily: "Courier New, monospace", marginBottom: 6 }}>◈ BUNKER STORE</div>
              <div style={{ border: "1px solid #3a1808", background: "linear-gradient(135deg,#0a0400,#060200)", padding: "12px 18px", marginBottom: 22 }}>
                <div style={{ fontSize: 8, letterSpacing: 4, color: "#c8341c", fontFamily: "Courier New, monospace", marginBottom: 3 }}>⚠ AVISO DO ORÁCULO</div>
                <div style={{ fontSize: 11, color: "#5a3010", lineHeight: 1.6 }}>
                  Com o relógio a <span style={{ color: "#c8341c", fontWeight: 700 }}>{seconds} segundos</span> da meia-noite, o tempo de preparação é agora.
                </div>
              </div>

              <div style={{ fontSize: 9, letterSpacing: 5, color: "#4a2808", fontFamily: "Courier New, monospace", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <span>ARQUIVOS DIGITAIS</span>
                <div style={{ flex: 1, height: 1, background: "#1a0a04" }} />
                <span style={{ color: "#2a1208" }}>DOWNLOAD IMEDIATO</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginBottom: 28 }}>
                {EBOOKS.map(b => (
                  <div
                    key={b.id}
                    style={{ border: "1px solid #2a1208", background: "#080400", padding: "18px", position: "relative", cursor: "pointer", transition: "border 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8341c44"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a1208"; }}
                  >
                    {b.badge && (
                      <div style={{ position: "absolute", top: 10, right: 10, fontSize: 7, letterSpacing: 2, padding: "2px 5px", background: "#c8341c22", border: "1px solid #c8341c", color: "#c8341c", fontFamily: "Courier New, monospace" }}>
                        {b.badge}
                      </div>
                    )}
                    <div style={{ fontSize: 26, marginBottom: 8 }}>{b.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c8a070", marginBottom: 2 }}>{b.title}</div>
                    <div style={{ fontSize: 8, color: "#5a3010", letterSpacing: 2, fontFamily: "Courier New, monospace", marginBottom: 8 }}>{b.sub}</div>
                    <div style={{ fontSize: 11, color: "#4a2810", lineHeight: 1.6, marginBottom: 12 }}>{b.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#c8341c", fontFamily: "Courier New, monospace" }}>{b.price}</div>
                      <button style={{ background: "#c8341c11", border: "1px solid #c8341c55", color: "#c8341c", fontFamily: "Courier New, monospace", fontSize: 8, letterSpacing: 3, padding: "6px 10px", cursor: "pointer" }}>ADQUIRIR</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 9, letterSpacing: 5, color: "#4a2808", fontFamily: "Courier New, monospace", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span>KIT DE SOBREVIVÊNCIA</span>
                <div style={{ flex: 1, height: 1, background: "#1a0a04" }} />
                <span style={{ color: "#2a1208" }}>AFILIADOS</span>
              </div>
              <div style={{ border: "1px solid #2a1208", background: "#080400", padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#4a2810", lineHeight: 1.7 }}>
                  Itens selecionados com base em protocolos reais de emergência civil. Links de afiliado — cada compra apoia este sistema de vigilância.
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 24 }}>
                {AFFILIATES.map((a, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: "#060200", border: "1px solid #1a0a04", cursor: "pointer", transition: "border 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c8341c44"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a0a04"; }}
                  >
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ fontSize: 8, letterSpacing: 2, padding: "1px 5px", border: "1px solid #2a1208", color: "#5a3010", fontFamily: "Courier New, monospace", flexShrink: 0 }}>{a.cat}</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#7a5030" }}>{a.name}</span>
                    <span style={{ fontSize: 8, color: "#c8341c66", letterSpacing: 2, fontFamily: "Courier New, monospace", flexShrink: 0 }}>{a.store} →</span>
                  </div>
                ))}
              </div>

              <div style={{ border: "1px solid #3a1808", background: "#0a0400", padding: "22px", textAlign: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#5a2808", fontFamily: "Courier New, monospace", marginBottom: 8 }}>◈ RECEBA ALERTAS DO ORÁCULO</div>
                <div style={{ fontSize: 11, color: "#5a3010", lineHeight: 1.7, marginBottom: 16 }}>
                  Toda segunda-feira: análise do relógio, top ameaças e previsão atualizada.
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    style={{ background: "#060200", border: "1px solid #2a1208", color: "#c8a070", fontFamily: "Courier New, monospace", fontSize: 11, padding: "9px 13px", outline: "none", width: 230 }}
                  />
                  <button style={{ background: "#c8341c11", border: "1px solid #c8341c", color: "#c8341c", fontFamily: "Courier New, monospace", fontSize: 9, letterSpacing: 4, padding: "9px 16px", cursor: "pointer" }}>
                    ATIVAR ALERTA
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        <footer style={{ borderTop: "1px solid #1a0a04", padding: "18px 24px", background: "rgba(4,1,0,0.97)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 7, color: "#1e0a04", letterSpacing: 3, fontFamily: "Courier New, monospace", lineHeight: 2.2 }}>
              <div>RELÓGIO DO JUÍZO FINAL · PROTOCOLO ÔMEGA · 2026</div>
              <div>DADOS: BULLETIN OF ATOMIC SCIENTISTS · RSS GLOBAL · IA</div>
            </div>
            <div style={{ fontSize: 7, color: "#1e0a04", letterSpacing: 3, fontFamily: "Courier New, monospace", textAlign: "right", lineHeight: 2.2 }}>
              <div>ENTRETENIMENTO BASEADO EM DADOS REAIS</div>
              <div>NÃO SOMOS RESPONSÁVEIS PELO FIM DO MUNDO</div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
