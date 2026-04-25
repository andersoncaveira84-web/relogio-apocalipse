import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// CONSTANTS & COLORS (Mantidas conforme original)
// ═══════════════════════════════════════════
const YEAR_START = 2024;
const YEAR_END = 2124;
const OFFICIAL_S = 85;
const HOUR_S = 3600;
const AGGRAVATION_DATE = new Date("2026-01-28T12:00:00Z");
const NEXT_REVIEW_DATE = new Date("2027-01-20T15:00:00Z");

const C = {
  bg: "#0a0804", bgCard: "#120e08", bgDark: "#080604", border: "#3a2a14",
  borderHi: "#6a4a20", red: "#e63020", redDim: "#c02010", gold: "#d4940a",
  goldDim: "#8a6010", white: "#f0e8d8", gray: "#b09878", grayDim: "#705840",
  grayDark: "#403020", green: "#30b060", blue: "#2890c0",
};

const CAT_COLOR = { NUCLEAR: C.red, CLIMA: "#e08020", IA: C.blue, BIOLÓGICO: C.green, GEOPOLÍTICO: "#9040c0", CÓSMICO: C.gold };
const CAT_LABEL = { NUCLEAR: "NUCLEAR", CLIMA: "CLIMÁTICO", IA: "INT. ARTIFICIAL", BIOLÓGICO: "BIOLÓGICO", GEOPOLÍTICO: "GEOPOLÍTICO", CÓSMICO: "CÓSMICO" };
const LOADING_MSGS = ["VARRENDO FREQUÊNCIAS GLOBAIS...", "CALCULANDO VETORES DE EXTINÇÃO...", "INTERCEPTANDO TRANSMISSÕES..."];

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
// NOVO COMPONENTE: MANCHETES EM DESTAQUE
// ═══════════════════════════════════════════
function HeadlinesSection({ news, onSelect }) {
  if (!news || news.length === 0) return null;

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={{ fontSize: 13, letterSpacing: 4, color: C.goldDim, fontFamily: "Courier New,monospace", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span>MANCHETES CRÍTICAS</span>
        <div style={{ flex: 1, height: 1, background: C.border }}/>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {news.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => onSelect(idx)}
            style={{ 
              background: C.bgCard, border: `1px solid ${C.border}`, padding: "14px", 
              cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" 
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.goldDim}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
          >
            <div>
              <div style={{ fontSize: 10, color: CAT_COLOR[item.categoria], fontFamily: "Courier New,monospace", marginBottom: 4 }}>{item.categoria}</div>
              <div style={{ fontSize: 14, color: C.white, fontWeight: "bold" }}>{item.manchete_real}</div>
            </div>
            <div style={{ color: C.red, fontSize: 18 }}>▶</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// UTILS & CLOCKS (Mantidos)
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

// ═══════════════════════════════════════════
// COMPONENTES DE UI (SteampunkClock, PredCard, etc - Simplificados para brevidade)
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

function PredCard({ ev, active, onToggle }) {
    const col = CAT_COLOR[ev.categoria] || C.red;
    return (
      <div onClick={onToggle} style={{ border: `1px solid ${active ? col+"88" : C.border}`, background: active ? `${col}12` : C.bgCard, cursor: "pointer", position: "relative", padding: "16px", transition: "all 0.25s", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: col, fontFamily: "Courier New,monospace" }}>{CAT_LABEL[ev.categoria]}</div>
        <div style={{ fontSize: 15, fontWeight: "bold", color: C.white }}>{ev.titulo}</div>
        {active && <div style={{ marginTop: 10, fontSize: 13, color: C.gray }}>{ev.interpretacao}</div>}
      </div>
    );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [seconds, setSeconds] = useState(OFFICIAL_S);
  const [previsoes, setPrevisoes] = useState(MOCK.previsoes); // Começa com Mock para não ficar vazio
  const [veredicto, setVeredicto] = useState(MOCK.veredicto);
  const [tickerText, setTickerText] = useState(MOCK.ticker);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);
  const [page, setPage] = useState("relogio");
  const [oracMsg, setOracMsg] = useState("");

  // Efeito para carregar notícias automaticamente ao abrir o site
  useEffect(() => {
    const autoFetch = async () => {
      setLoading(true);
      setOracMsg("SINCRONIZANDO DADOS...");
      try {
        // Simulação de chamada de API (Substituir pela sua lógica de fetch real)
        // const res = await fetch("/api/oracle", { ... });
        // const data = await res.json();
        // Se falhar ou não houver API, o MOCK já está no estado inicial
      } catch (e) {
        console.log("Usando dados locais.");
      } finally {
        setLoading(false);
      }
    };
    autoFetch();
  }, []);

  async function consult() {
    if (loading) return;
    setLoading(true);
    setOracMsg(LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)]);
    
    // Simula atraso de rede
    setTimeout(() => {
        setPrevisoes(MOCK.previsoes);
        setVeredicto(MOCK.veredicto);
        setLoading(false);
    }, 1500);
  }

  const pd = predYear(seconds);
  const yl = yearsLeft(seconds);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.gray, fontFamily: "Georgia,serif" }}>
      <NewsTicker text={tickerText}/>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
        
        {/* NAVEGAÇÃO */}
        <nav style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 30 }}>
            <button onClick={() => setPage("relogio")} style={{ background: "none", border: "none", color: page === "relogio" ? C.red : C.gray, cursor: "pointer", fontFamily: "Courier New" }}>RELÓGIO</button>
            <button onClick={() => setPage("oraculo")} style={{ background: "none", border: "none", color: page === "oraculo" ? C.red : C.gray, cursor: "pointer", fontFamily: "Courier New" }}>DETALHES</button>
        </nav>

        {page === "relogio" && (
          <>
            {/* Bloco de Previsão */}
            <div style={{ border: `1px solid ${C.red}55`, background: C.bgCard, padding: "22px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.redDim, letterSpacing: 4 }}>DATA PREVISTA DO COLAPSO</div>
                <div style={{ fontSize: 80, fontWeight: "bold", color: C.red }}>{pd.y}</div>
                <div style={{ fontSize: 14, color: C.gray }}>{yl.toFixed(1)} ANOS RESTANTES</div>
            </div>

            {/* NOVA SEÇÃO DE NOTÍCIAS NA HOME */}
            <HeadlinesSection 
                news={previsoes} 
                onSelect={(idx) => { setActiveIdx(idx); setPage("oraculo"); }} 
            />

            <button onClick={consult} disabled={loading} style={{
              width: "100%", background: C.bgDark, border: `1px solid ${C.red}`,
              color: C.red, padding: "18px", cursor: "pointer", marginTop: 20
            }}>
              {loading ? oracMsg : "◈ CONSULTAR O ORÁCULO"}
            </button>
          </>
        )}

        {page === "oraculo" && (
          <div>
            <div style={{ marginBottom: 20, color: C.gold }}>{veredicto}</div>
            {previsoes.map((ev, i) => (
              <PredCard key={i} ev={ev} active={activeIdx === i} onToggle={() => setActiveIdx(activeIdx === i ? null : i)}/>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}