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

const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes históricos.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM SIMULTANEAMENTE · IA MILITAR SEM SUPERVISÃO · TEMPERATURA GLOBAL BATE RECORDE",
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES EM EXPANSÃO", manchete_real: "Potências expandem ogivas sem tratados ativos", interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental elevada.", categoria: "NUCLEAR" },
    { titulo: "IA MILITAR SEM APROVAÇÃO HUMANA", manchete_real: "Sistemas autônomos operam sem loop humano", interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana documentado.", categoria: "IA" },
    { titulo: "RECORDE DE TEMPERATURA GLOBAL", manchete_real: "2025 é o ano mais quente da história", interpretacao: "Terceiro ano consecutivo de recordes absolutos. Colapso agrícola revisado para 2041.", categoria: "CLIMA" },
  ],
};

// ═══════════════════════════════════════════
// MATH HELPERS
// ═══════════════════════════════════════════
function secondsToYear(s) { return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START); }
function predYear(s) {
  const yr = secondsToYear(s), y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)] || "JAN", full: yr };
}
function getMidMs() { const n = new Date(), m = new Date(n); m.setHours(24,0,0,0); return m.getTime() - n.getTime(); }

// ═══════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════

function SteampunkClock({ seconds }) {
  const S = 280, cx = S/2, cy = S/2, R = S/2;
  const fraction = seconds / HOUR_S;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ display: "block", maxWidth: "100%", filter: "drop-shadow(0 0 12px #d4940a44)" }}>
      <circle cx={cx} cy={cy} r={R*0.99} fill="#1a1005" stroke="#7a5020" strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r={R*0.79} fill="#0a0800" stroke="#5a3a10" strokeWidth="1.5"/>
      <text x={cx} y={cy-R*0.05} textAnchor="middle" fill={C.red} fontSize={R*0.14} fontFamily="Georgia" fontWeight="bold">{seconds}s</text>
      <line x1={cx} y1={cy} x2={cx+Math.cos(handRad)*R*0.7} y2={cy+Math.sin(handRad)*R*0.7} stroke={C.red} strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

function NewsTicker({ text }) {
  return (
    <div style={{ background: "#0f0000", borderTop: `1px solid ${C.red}44`, height: 34, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ background: C.red, padding: "0 14px", color: "#fff", fontSize: 11, fontWeight: 700, zIndex: 2 }}>URGENTE</div>
      <marquee style={{ color: C.gold, fontFamily: "Courier New", fontSize: 13, flex: 1 }}>{text} ·· {text}</marquee>
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
  const [reportId, setReportId] = useState("SISTEMA-ESTÁTICO");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("relogio");

  useEffect(() => { setMounted(true); }, []);

  async function consult() {
    if (loading) return;
    setLoading(true);
    setVeredicto("CONSULTANDO O DESTINO...");

    try {
      const res = await fetch("/api/oracle", { method: "POST" });
      const r = await res.json();
      
      if (r && r.previsoes) {
        setPrevisoes(r.previsoes);
        setVeredicto(r.veredicto);
        setTickerText(r.ticker);
        setReportId(r.report_id || "PROT-UNICO");
        setSeconds(s => s + (r.ajuste_segundos || 0));
      }
    } catch (e) {
      setVeredicto("FALHA NA CONEXÃO COM O ORÁCULO.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;
  const pd = predYear(seconds);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.gray, fontFamily: "serif" }}>
      <NewsTicker text={tickerText}/>
      
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        <header style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700, color: C.gold, letterSpacing: 3 }}>RELÓGIO DO JUÍZO FINAL</div>
          <nav style={{ display: "flex", justifyContent: "center", gap: 15, marginTop: 20 }}>
            {["relogio","oraculo","loja"].map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: "none", border: "none", color: page===p?C.red:C.grayDim, cursor: "pointer", fontFamily: "Courier New", fontSize: 11, letterSpacing: 2 }}>
                {p.toUpperCase()}
              </button>
            ))}
          </nav>
        </header>

        {page === "relogio" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><SteampunkClock seconds={seconds}/></div>
            
            <div style={{ background: C.bgCard, border: `1px solid ${C.red}55`, padding: "30px", textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: C.redDim, letterSpacing: 3 }}>DATA PREVISTA DO COLAPSO</div>
              <div style={{ fontSize: 80, fontWeight: "bold", color: C.red, lineHeight: 1 }}>{pd.y}</div>
              <div style={{ fontSize: 20, color: C.redDim }}>{pd.m}</div>
            </div>

            {/* SELO DE AUTENTICIDADE */}
            <div style={{ border: `1px solid ${C.gold}44`, padding: "12px", marginBottom: 20, background: "rgba(212, 148, 10, 0.05)", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: C.goldDim }}>STATUS: AUTENTICADO</div>
                <div style={{ fontSize: 13, color: C.gold, fontWeight: "bold", fontFamily: "Courier New" }}>ID: {reportId}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: C.grayDim }}>SINCRONIZAÇÃO</div>
                <div style={{ fontSize: 11, color: C.white }}>{new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: C.goldDim, marginBottom: 15 }}>◈ MANCHETES CRÍTICAS</div>
            {previsoes.map((item, idx) => (
              <div key={idx} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "15px", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: CAT_COLOR[item.categoria] || C.red }}>{item.categoria}</div>
                <div style={{ fontSize: 16, color: C.white, fontWeight: "bold", margin: "4px 0" }}>{item.manchete_real}</div>
              </div>
            ))}

            <button onClick={consult} style={{ width: "100%", padding: "18px", background: "#111", border: `1px solid ${C.red}`, color: C.red, cursor: "pointer", fontFamily: "Courier New", marginTop: 10 }}>
              {loading ? "PROCESSANDO..." : "◈ CONSULTAR ORÁCULO IA"}
            </button>
          </>
        )}

        {page === "oraculo" && (
          <div>
            <div style={{ color: C.gold, fontStyle: "italic", marginBottom: 30, fontSize: 17, lineHeight: 1.6 }}>"{veredicto}"</div>
            {previsoes.map((ev, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", marginBottom: 15 }}>
                <div style={{ color: CAT_COLOR[ev.categoria] || C.red, fontSize: 11 }}>{ev.categoria}</div>
                <div style={{ color: "#fff", fontWeight: "bold", fontSize: 18, margin: "5px 0" }}>{ev.titulo}</div>
                <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.6 }}>{ev.interpretacao}</div>
              </div>
            ))}
          </div>
        )}

        {page === "loja" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 15 }}>
            {EBOOKS.map(b => (
              <a key={b.id} href={b.link} target="_blank" style={{ border: `1px solid ${C.border}`, background: C.bgCard, padding: "20px", textDecoration: "none" }}>
                <div style={{ color: C.white, fontSize: 17, fontWeight: "bold" }}>{b.icon} {b.title}</div>
                <div style={{ color: C.gray, fontSize: 13, marginTop: 5 }}>{b.desc}</div>
                <div style={{ color: C.red, fontWeight: "bold", marginTop: 12 }}>{b.price}</div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}