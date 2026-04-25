import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// CONSTANTES (Igual ao original)
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
  white: "#f0e8d8", gray: "#b09878", grayDim: "#705840", grayDark: "#403020"
};

const CAT_COLOR = { NUCLEAR: "#e63020", CLIMA: "#e08020", IA: "#2890c0", BIOLÓGICO: "#30b060" };
const LOADING_MSGS = ["VARRENDO FREQUÊNCIAS...", "ANALISANDO AMEAÇAS..."];

const MOCK = {
  ticker: "RELÓGIO DO JUÍZO FINAL · 85 SEGUNDOS PARA A MEIA-NOITE · RECORDE HISTÓRICO",
  veredicto: "A convergência de ameaças nucleares e IA cria vetor de extinção sem precedentes.",
  previsoes: [
    { titulo: "ARSENAIS NUCLEARES", manchete_real: "Potências expandem ogivas em 2026", categoria: "NUCLEAR", impacto_anos: 3.2, interpretacao: "Risco de conflito elevado.", probabilidade: 72, gravidade: 9 },
    { titulo: "IA MILITAR", manchete_real: "Sistemas autônomos operam sem supervisão", categoria: "IA", impacto_anos: 4.7, interpretacao: "Escalada de conflitos em minutos.", probabilidade: 61, gravidade: 10 }
  ]
};

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function secondsToYear(s) { return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START); }
function predYear(s) {
  const yr = secondsToYear(s), y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  return { y, m: M[Math.floor((yr - y) * 12)] || "JAN" };
}

// ═══════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════
function NewsTicker({ text }) {
  return (
    <div style={{ background: "#0f0000", borderBottom: `1px solid ${C.red}44`, height: 34, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ background: C.red, padding: "0 10px", color: "#fff", fontSize: 11, fontWeight: "bold" }}>URGENTE</div>
      <marquee style={{ color: C.gold, fontFamily: "Courier New", fontSize: 13 }}>{text}</marquee>
    </div>
  );
}

function HeadlinesSection({ news, onSelect }) {
  return (
    <div style={{ margin: "24px 0" }}>
      <div style={{ fontSize: 12, color: C.goldDim, fontFamily: "Courier New", marginBottom: 10, borderBottom: `1px solid ${C.border}`, paddingBottom: 5 }}>◈ MANCHETES CRÍTICAS</div>
      {news.map((item, idx) => (
        <div key={idx} onClick={() => onSelect(idx)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: "12px", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: CAT_COLOR[item.categoria] }}>{item.categoria}</div>
          <div style={{ fontSize: 14, color: C.white, fontWeight: "bold" }}>{item.manchete_real}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP (À PROVA DE ERROS)
// ═══════════════════════════════════════════
export default function App() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState("relogio");
  const [loading, setLoading] = useState(false);
  const [previsoes, setPrevisoes] = useState(MOCK.previsoes);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ background: "#000", minHeight: "100vh" }} />;

  const pd = predYear(OFFICIAL_S);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.gray, fontFamily: "serif" }}>
      <NewsTicker text={MOCK.ticker} />
      
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        <nav style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 30 }}>
          <button onClick={() => setPage("relogio")} style={{ background: "none", border: "none", color: page === "relogio" ? C.red : C.gray, cursor: "pointer" }}>RELÓGIO</button>
          <button onClick={() => setPage("oraculo")} style={{ background: "none", border: "none", color: page === "oraculo" ? C.red : C.gray, cursor: "pointer" }}>DETALHES</button>
        </nav>

        {page === "relogio" ? (
          <>
            <div style={{ border: `1px solid ${C.red}55`, background: C.bgCard, padding: "30px", textAlign: "center" }}>
              <div style={{ fontSize: 12, color: C.redDim }}>DATA PREVISTA DO COLAPSO</div>
              <div style={{ fontSize: 80, fontWeight: "bold", color: C.red }}>{pd.y}</div>
              <div style={{ fontSize: 20, color: C.redDim }}>{pd.m}</div>
            </div>

            <HeadlinesSection news={previsoes} onSelect={(i) => { setActiveIdx(i); setPage("oraculo"); }} />

            <button style={{ width: "100%", padding: "15px", background: "#111", border: `1px solid ${C.red}`, color: C.red, cursor: "pointer" }}>
              ◈ CONSULTAR O ORÁCULO
            </button>
          </>
        ) : (
          <div>
            {previsoes.map((ev, i) => (
              <div key={i} style={{ border: `1px solid ${C.border}`, padding: "15px", marginBottom: 10, background: C.bgCard }}>
                <div style={{ color: CAT_COLOR[ev.categoria], fontSize: 12 }}>{ev.categoria}</div>
                <div style={{ color: "#fff", fontWeight: "bold" }}>{ev.titulo}</div>
                <div style={{ fontSize: 13, marginTop: 5 }}>{ev.interpretacao}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 