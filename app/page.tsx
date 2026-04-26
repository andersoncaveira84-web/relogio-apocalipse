"use client";

import { useState, useEffect, useRef } from "react";
import { JudgmentClock, EndOfDayClock, ThemeToggle, useTheme } from '../components/ApocalypseClocks'
import { ShopBlogLayout } from '../components/ShopBlog'

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const OFFICIAL_S = 85;

const CAT_COLOR: Record<string, string> = {
  NUCLEAR:     "#cc2810",
  CLIMA:       "#e08020",
  IA:          "#2890c0",
  BIOLÓGICO:   "#30b060",
  GEOPOLÍTICO: "#9040c0",
  CÓSMICO:     "#d4940a",
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

type Page = "relogio" | "cronometros" | "oraculo" | "loja";

// ═══════════════════════════════════════════
// NEWS TICKER
// ═══════════════════════════════════════════
function NewsTicker({ text }: { text: string }) {
  return (
    <div className="ticker-bar">
      <div className="ticker-label">URGENTE</div>
      <div style={{ overflow: "hidden", flex: 1, position: "relative" }}>
        <div className="ticker-content">{text} &nbsp;·· {text}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROTOCOL SEAL
// ═══════════════════════════════════════════
function ProtocolSeal({ reportId }: { reportId: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("pt-BR"));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="protocol-seal" style={{ marginBottom: 20 }}>
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: 2, color: "var(--bronze-dark)", textTransform: "uppercase" }}>
          Status: Autenticado
        </div>
        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 13, color: "var(--bronze-light)", marginTop: 2 }}>
          ID: {reportId}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: 2, color: "var(--bronze-dark)", textTransform: "uppercase" }}>
          Sincronização
        </div>
        <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 12, color: "var(--text-primary)", marginTop: 2 }}>
          {time}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ORACLE VERDICT
// ═══════════════════════════════════════════
function OracleSection({
  veredicto,
  previsoes,
}: {
  veredicto: string;
  previsoes: typeof MOCK.previsoes;
}) {
  return (
    <div className="page-enter">
      {/* Veredicto */}
      <div
        className="card"
        style={{
          padding: "28px 24px",
          marginBottom: 20,
          borderColor: "var(--bronze-dark)",
          background: "linear-gradient(135deg, rgba(200,134,42,0.04), transparent)",
        }}
      >
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 12 }}>
          ✦ Veredicto do Oráculo
        </div>
        <p
          style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: "italic",
            fontSize: "clamp(15px, 3.5vw, 18px)",
            color: "var(--bronze-light)",
            lineHeight: 1.7,
          }}
        >
          "{veredicto}"
        </p>
      </div>

      {/* Previsões */}
      {previsoes.map((ev, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: "20px",
            marginBottom: 12,
            borderLeft: `3px solid ${CAT_COLOR[ev.categoria] || "var(--red-alarm)"}`,
          }}
        >
          <div
            className="badge"
            style={{
              borderColor: CAT_COLOR[ev.categoria] || "var(--red-alarm)",
              color: CAT_COLOR[ev.categoria] || "var(--red-alarm)",
              marginBottom: 10,
            }}
          >
            {ev.categoria}
          </div>
          <h3
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(14px, 3.5vw, 17px)",
              color: "var(--text-primary)",
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            {ev.titulo}
          </h3>
          <div
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: 12,
              color: "var(--bronze-mid)",
              marginBottom: 10,
              letterSpacing: 1,
            }}
          >
            ↳ {ev.manchete_real}
          </div>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: "italic",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            {ev.interpretacao}
          </p>
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
  const [reportId, setReportId] = useState("SISTEMA-ESTÁTICO");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<Page>("relogio");
  const { theme, toggle } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  async function consult() {
    if (loading) return;
    setLoading(true);
    setVeredicto("CONSULTANDO O DESTINO...");
    try {
      const res = await fetch("/api/oracle", { method: "POST" });
      const r = await res.json();
      if (r?.previsoes) {
        setPrevisoes(r.previsoes);
        setVeredicto(r.veredicto);
        setTickerText(r.ticker);
        setReportId(r.report_id || "PROT-ÚNICO");
        setSeconds(s => s + (r.ajuste_segundos || 0));
      }
    } catch {
      setVeredicto("FALHA NA CONEXÃO COM O ORÁCULO.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const NAV_ITEMS: { id: Page; label: string }[] = [
    { id: "relogio",    label: "⌚ Relógio" },
    { id: "cronometros",label: "⏱ Cronômetros" },
    { id: "oraculo",    label: "☽ Oráculo" },
    { id: "loja",       label: "✦ Arquivo" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Ticker */}
      <NewsTicker text={tickerText} />

      {/* Theme toggle */}
      <ThemeToggle theme={theme} onToggle={toggle} />

      <main style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 60px" }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(18px, 5vw, 28px)",
              fontWeight: 900,
              color: "var(--bronze-light)",
              letterSpacing: "0.05em",
              textShadow: "0 0 30px rgba(200,134,42,0.3)",
            }}
          >
            Relógio do Juízo Final
          </div>
          <div
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: "italic",
              fontSize: 12,
              color: "var(--bronze-dark)",
              letterSpacing: 2,
              marginTop: 6,
            }}
          >
            Anno Domini MMXXVI
          </div>

          {/* Ornamento */}
          <div className="ornament" style={{ margin: "16px 0 20px" }}>✦</div>

          {/* Navegação */}
          <nav style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 4px" }}>
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                className={`nav-link ${page === id ? "active" : ""}`}
                onClick={() => setPage(id)}
                style={{
                  color: page === id ? "var(--text-primary)" : "var(--text-muted)",
                  padding: "8px 12px",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        {/* ── Relógio Principal ── */}
        {page === "relogio" && (
          <div className="page-enter">
            <JudgmentClock seconds={seconds} />

            <div style={{ marginTop: 20 }}>
              <ProtocolSeal reportId={reportId} />
            </div>

            {/* Manchetes */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: 4,
                color: "var(--bronze-dark)",
                textTransform: "uppercase",
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              ◈ Manchetes Críticas
            </div>
            {previsoes.map((item, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: "14px 16px",
                  marginBottom: 10,
                  borderLeft: `3px solid ${CAT_COLOR[item.categoria] || "var(--red-alarm)"}`,
                }}
              >
                <div
                  className="badge"
                  style={{
                    borderColor: CAT_COLOR[item.categoria] || "var(--red-alarm)",
                    color: CAT_COLOR[item.categoria] || "var(--red-alarm)",
                    marginBottom: 8,
                  }}
                >
                  {item.categoria}
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "clamp(13px, 3vw, 15px)",
                    color: "var(--text-primary)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.manchete_real}
                </div>
              </div>
            ))}

            {/* Botão consultar */}
            <button className="btn-primary" onClick={consult} disabled={loading} style={{ marginTop: 16 }}>
              <span>{loading ? "⌛ Processando..." : "◈ Consultar Oráculo IA"}</span>
            </button>
          </div>
        )}

        {/* ── Cronômetros ── */}
        {page === "cronometros" && (
          <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9,
                  letterSpacing: 4,
                  color: "var(--bronze-mid)",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                ✦ Cronômetro do Juízo Final
              </div>
              <div
                style={{
                  fontFamily: "'IM Fell English', serif",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                Escala: 1 hora = 100 anos · {OFFICIAL_S}s restantes = {OFFICIAL_S} segundos para o colapso
              </div>
              <JudgmentClock seconds={seconds} />
            </div>

            <div className="ornament">◈</div>

            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9,
                  letterSpacing: 4,
                  color: "var(--bronze-mid)",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                ✦ Fim do Dia
              </div>
              <EndOfDayClock />
            </div>
          </div>
        )}

        {/* ── Oráculo ── */}
        {page === "oraculo" && (
          <>
            <OracleSection veredicto={veredicto} previsoes={previsoes} />
            <button className="btn-primary" onClick={consult} disabled={loading} style={{ marginTop: 20 }}>
              <span>{loading ? "⌛ Processando..." : "◈ Nova Consulta"}</span>
            </button>
          </>
        )}

        {/* ── Loja + Blog ── */}
        {page === "loja" && <ShopBlogLayout />}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          borderTop: "1px solid var(--border-subtle)",
          fontFamily: "'Special Elite', monospace",
          fontSize: 11,
          color: "var(--text-muted)",
          letterSpacing: 1,
        }}
      >
        MMXXVI · Relógio do Juízo Final · Todos os direitos reservados
      </footer>
    </div>
  );
}