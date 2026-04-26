"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface MarketItem {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  category: "BOLSA" | "COMMODITY" | "CRYPTO";
  unit: string;
  apocalypseWeight: number; // peso no índice 0-1
}

interface HistoryPoint {
  time: string;
  value: number;
}

// ═══════════════════════════════════════════
// SYMBOLS — Yahoo Finance via proxy gratuito
// ═══════════════════════════════════════════
const MARKET_SYMBOLS: MarketItem[] = [
  // Bolsas
  { symbol: "^BVSP",  name: "Ibovespa",     price: null, change: null, changePercent: null, category: "BOLSA",     unit: "pts", apocalypseWeight: 0.12 },
  { symbol: "^GSPC",  name: "S&P 500",      price: null, change: null, changePercent: null, category: "BOLSA",     unit: "pts", apocalypseWeight: 0.15 },
  { symbol: "^DJI",   name: "Dow Jones",    price: null, change: null, changePercent: null, category: "BOLSA",     unit: "pts", apocalypseWeight: 0.10 },
  // Commodities estratégicas
  { symbol: "GC=F",   name: "Ouro",         price: null, change: null, changePercent: null, category: "COMMODITY", unit: "USD/oz", apocalypseWeight: 0.20 },
  { symbol: "CL=F",   name: "Petróleo WTI", price: null, change: null, changePercent: null, category: "COMMODITY", unit: "USD/bbl", apocalypseWeight: 0.18 },
  { symbol: "ZW=F",   name: "Trigo",        price: null, change: null, changePercent: null, category: "COMMODITY", unit: "USD/bu", apocalypseWeight: 0.15 },
  { symbol: "SI=F",   name: "Prata",        price: null, change: null, changePercent: null, category: "COMMODITY", unit: "USD/oz", apocalypseWeight: 0.10 },
];

// ═══════════════════════════════════════════
// FETCH — Yahoo Finance via allorigins proxy
// ═══════════════════════════════════════════
async function fetchQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { cache: "no-store" });
    const data = await res.json();
    const parsed = JSON.parse(data.contents);
    const meta = parsed?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice ?? meta.previousClose;
    const prev = meta.previousClose ?? price;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
    return { price, change, changePercent };
  } catch {
    return null;
  }
}

async function fetchHistory(symbol: string): Promise<HistoryPoint[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy, { cache: "no-store" });
    const data = await res.json();
    const parsed = JSON.parse(data.contents);
    const result = parsed?.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = result.timestamp || [];
    const closes: number[] = result.indicators?.quote?.[0]?.close || [];
    return timestamps.map((t, i) => ({
      time: new Date(t * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: closes[i] ?? 0,
    })).filter(p => p.value > 0).slice(-20);
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════
// APOCALYPSE INDEX CALCULATOR
// ═══════════════════════════════════════════
function calcApocalypseIndex(markets: MarketItem[]): number {
  let score = 50; // base neutra
  let totalWeight = 0;

  for (const m of markets) {
    if (m.changePercent === null) continue;
    totalWeight += m.apocalypseWeight;

    if (m.category === "BOLSA") {
      // Queda de bolsa = mais apocalipse
      if (m.changePercent < -2) score += m.apocalypseWeight * 30;
      else if (m.changePercent < 0) score += m.apocalypseWeight * 10;
      else score -= m.apocalypseWeight * 5;
    }

    if (m.symbol === "GC=F") {
      // Ouro subindo = fuga para segurança = mais apocalipse
      if (m.changePercent > 1) score += m.apocalypseWeight * 25;
      else if (m.changePercent > 0) score += m.apocalypseWeight * 8;
    }

    if (m.symbol === "CL=F") {
      // Petróleo: queda drástica ou alta extrema = alarme
      if (Math.abs(m.changePercent) > 3) score += m.apocalypseWeight * 20;
    }

    if (m.symbol === "ZW=F") {
      // Trigo subindo = crise alimentar
      if (m.changePercent > 2) score += m.apocalypseWeight * 25;
      else if (m.changePercent > 0.5) score += m.apocalypseWeight * 10;
    }
  }

  return Math.min(99, Math.max(1, Math.round(score)));
}

function getIndexLabel(score: number): { label: string; color: string; desc: string } {
  if (score >= 80) return { label: "CRÍTICO", color: "var(--red-alarm)", desc: "Mercados sinalizam colapso iminente" };
  if (score >= 65) return { label: "ELEVADO", color: "#e08020", desc: "Tensão sistêmica acima do normal" };
  if (score >= 50) return { label: "MODERADO", color: "#d4940a", desc: "Sinais de instabilidade detectados" };
  if (score >= 35) return { label: "BAIXO", color: "#30b060", desc: "Mercados relativamente estáveis" };
  return { label: "CALMO", color: "#2890c0", desc: "Nenhum sinal de colapso imediato" };
}

// ═══════════════════════════════════════════
// MINI SPARKLINE CHART (SVG puro)
// ═══════════════════════════════════════════
function Sparkline({ data, color }: { data: HistoryPoint[]; color: string }) {
  if (data.length < 2) return <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 10 }}>sem dados</div>;

  const W = 200, H = 48;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  const lastVal = vals[vals.length - 1];
  const firstVal = vals[0];
  const trend = lastVal >= firstVal ? color : "var(--red-alarm)";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trend} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trend} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Área preenchida */}
      <polygon
        points={`0,${H} ${points} ${W},${H}`}
        fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, "")})`}
      />
      {/* Linha */}
      <polyline
        points={points}
        fill="none"
        stroke={trend}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Ponto atual */}
      {(() => {
        const lastX = W;
        const lastY = H - ((lastVal - min) / range) * (H - 8) - 4;
        return <circle cx={lastX} cy={lastY} r={3} fill={trend} />;
      })()}
    </svg>
  );
}

// ═══════════════════════════════════════════
// APOCALYPSE INDEX GAUGE (SVG)
// ═══════════════════════════════════════════
function ApocalypseGauge({ score }: { score: number }) {
  const { label, color, desc } = getIndexLabel(score);
  const R = 70, cx = 90, cy = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * totalAngle;

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
  }

  function arcPath(r: number, start: number, end: number) {
    const s = polarToXY(start, r);
    const e = polarToXY(end, r);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const needleEnd = polarToXY(scoreAngle, R * 0.75);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={180} height={120} viewBox="0 0 180 120">
        {/* Arco de fundo */}
        <path d={arcPath(R, startAngle, endAngle)} fill="none" stroke="var(--border-subtle)" strokeWidth="8" strokeLinecap="round" />
        {/* Arco colorido */}
        <path d={arcPath(R, startAngle, scoreAngle)} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        {/* Agulha */}
        <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill="var(--bg-card)" stroke={color} strokeWidth="1.5" />
        {/* Score */}
        <text x={cx} y={cy + 22} textAnchor="middle" fill={color} fontSize="24" fontFamily="'Cinzel Decorative', serif" fontWeight="bold">{score}</text>
      </svg>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, color, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MARKET CARD
// ═══════════════════════════════════════════
function MarketCard({ item, history, onClick, selected }: {
  item: MarketItem;
  history: HistoryPoint[];
  onClick: () => void;
  selected: boolean;
}) {
  const isPositive = (item.changePercent ?? 0) >= 0;
  const changeColor = isPositive ? "#30b060" : "var(--red-alarm)";
  const catColor = item.category === "BOLSA" ? "var(--bronze-light)" : item.category === "COMMODITY" ? "#e08020" : "#2890c0";

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: "16px",
        cursor: "pointer",
        borderColor: selected ? "var(--border-strong)" : undefined,
        boxShadow: selected ? "var(--shadow-glow-bronze)" : undefined,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div className="badge" style={{ borderColor: catColor, color: catColor, marginBottom: 6 }}>{item.category}</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: "var(--text-primary)", letterSpacing: 1 }}>{item.name}</div>
          <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{item.symbol}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {item.price !== null ? (
            <>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 16, color: "var(--text-primary)" }}>
                {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 11, color: changeColor, marginTop: 2 }}>
                {isPositive ? "▲" : "▼"} {Math.abs(item.changePercent ?? 0).toFixed(2)}%
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 12, color: "var(--text-muted)" }}>carregando...</div>
          )}
        </div>
      </div>
      {/* Sparkline */}
      <div style={{ marginTop: 8, opacity: 0.85 }}>
        <Sparkline data={history} color={catColor} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN MARKETS COMPONENT
// ═══════════════════════════════════════════
export function MarketsSection() {
  const [markets, setMarkets] = useState<MarketItem[]>(MARKET_SYMBOLS);
  const [histories, setHistories] = useState<Record<string, HistoryPoint[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [apocIndex, setApocIndex] = useState(50);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const updated = await Promise.all(
      MARKET_SYMBOLS.map(async (m) => {
        const q = await fetchQuote(m.symbol);
        return q ? { ...m, ...q } : m;
      })
    );
    setMarkets(updated);
    setApocIndex(calcApocalypseIndex(updated));
    setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    setLoading(false);

    // Busca histórico em paralelo (sem bloquear)
    updated.forEach(async (m) => {
      const h = await fetchHistory(m.symbol);
      if (h.length > 0) {
        setHistories(prev => ({ ...prev, [m.symbol]: h }));
      }
    });
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000); // atualiza a cada 5 min
    return () => clearInterval(interval);
  }, [fetchAll]);

  const { label: idxLabel, color: idxColor } = getIndexLabel(apocIndex);
  const bolsas = markets.filter(m => m.category === "BOLSA");
  const commodities = markets.filter(m => m.category === "COMMODITY");

  return (
    <div className="page-enter">
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 10 }}>
          ✦ Termômetro do Colapso
        </div>
        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(16px, 4vw, 22px)", color: "var(--text-primary)", letterSpacing: 2 }}>
          Mercados & Apocalipse
        </h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 10, color: "var(--text-muted)" }}>
            {loading ? "⌛ Atualizando..." : `✓ Atualizado às ${lastUpdate}`}
          </div>
          <button className="btn-secondary" onClick={fetchAll} style={{ fontSize: 9, padding: "4px 12px" }}>
            ↻ Atualizar
          </button>
        </div>
      </div>

      {/* Gauge do Índice Apocalipse */}
      <div className="card" style={{ padding: "24px", marginBottom: 20, textAlign: "center", border: `1px solid ${idxColor}44` }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 16 }}>
          ◈ Índice do Apocalipse Financeiro
        </div>
        <ApocalypseGauge score={apocIndex} />
        <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 11, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
          Calculado com base em queda de bolsas, fuga para ouro, volatilidade do petróleo e crise alimentar (trigo)
        </div>
      </div>

      {/* Alertas de colapso */}
      {markets.filter(m => m.changePercent !== null && Math.abs(m.changePercent) > 2).map(m => (
        <div key={m.symbol} style={{
          padding: "10px 14px", marginBottom: 8,
          border: `1px solid ${(m.changePercent ?? 0) < 0 ? "var(--red-alarm)" : "#30b060"}44`,
          background: `${(m.changePercent ?? 0) < 0 ? "rgba(204,40,16,0.05)" : "rgba(48,176,96,0.05)"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: (m.changePercent ?? 0) < 0 ? "var(--red-alarm)" : "#30b060", letterSpacing: 1 }}>
            {(m.changePercent ?? 0) < 0 ? "⚠ ALERTA" : "▲ ALTA"} — {m.name}
          </div>
          <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 12, color: (m.changePercent ?? 0) < 0 ? "var(--red-alarm)" : "#30b060" }}>
            {(m.changePercent ?? 0) > 0 ? "+" : ""}{(m.changePercent ?? 0).toFixed(2)}%
          </div>
        </div>
      ))}

      {/* Seção Bolsas */}
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 12, marginTop: 8 }}>
        ◈ Bolsas Globais
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {bolsas.map(m => (
          <MarketCard
            key={m.symbol}
            item={m}
            history={histories[m.symbol] || []}
            onClick={() => setSelected(selected === m.symbol ? null : m.symbol)}
            selected={selected === m.symbol}
          />
        ))}
      </div>

      {/* Seção Commodities */}
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 12 }}>
        ◈ Commodities Estratégicas
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {commodities.map(m => (
          <MarketCard
            key={m.symbol}
            item={m}
            history={histories[m.symbol] || []}
            onClick={() => setSelected(selected === m.symbol ? null : m.symbol)}
            selected={selected === m.symbol}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, padding: "14px", border: "1px solid var(--border-subtle)", marginTop: 8 }}>
        ⚠ Dados via Yahoo Finance (gratuito). Podem ter atraso de 15 min. Não constituem recomendação de investimento. O Índice do Apocalipse é uma interpretação simbólica para fins editoriais.
      </div>
    </div>
  );
}