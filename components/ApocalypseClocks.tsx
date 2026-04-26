"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const HOUR_S = 3600;       // 1 hora = 100 anos
const YEAR_START = 2024;
const YEAR_END = 2124;

// ─── HELPERS ───────────────────────────────
function secondsToYear(s: number): number {
  return YEAR_START + ((HOUR_S - s) / HOUR_S) * (YEAR_END - YEAR_START);
}

function predYear(s: number) {
  const yr = secondsToYear(s);
  const y = Math.floor(yr);
  const M = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const monthIdx = Math.min(Math.floor((yr - y) * 12), 11);
  const dayFrac = ((yr - y) * 12 - monthIdx);
  const d = Math.max(1, Math.floor(dayFrac * 28) + 1);
  return { y, m: M[monthIdx], d };
}

function getMidnightMs(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const milliseconds = ms % 1000;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    ms: String(milliseconds).padStart(3, "0"),
  };
}

// ═══════════════════════════════════════════
// STEAMPUNK CLOCK SVG
// ═══════════════════════════════════════════
interface SteampunkClockProps {
  seconds: number;
  milliseconds: number;
}

export function SteampunkClock({ seconds, milliseconds }: SteampunkClockProps) {
  const SIZE = 280;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = SIZE / 2;

  // Fração total incluindo milissegundos
  const totalMs = seconds * 1000 + milliseconds;
  const totalMaxMs = HOUR_S * 1000;
  const fraction = totalMs / totalMaxMs;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;

  // Ponteiro dos milissegundos (volta completa a cada segundo)
  const msFraction = milliseconds / 1000;
  const msHandRad = (msFraction * 360 - 90) * Math.PI / 180;

  // Marcas de hora (12 posições)
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 5 === 0;
    const inner = R * (isMajor ? 0.82 : 0.88);
    const outer = R * 0.94;
    return {
      x1: cx + Math.cos(angle) * inner,
      y1: cy + Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * outer,
      y2: cy + Math.sin(angle) * outer,
      isMajor,
    };
  });

  return (
    <div style={{ position: "relative", display: "inline-flex", justifyContent: "center" }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{
          display: "block",
          maxWidth: "100%",
          filter: "drop-shadow(0 0 16px rgba(200,134,42,0.3)) drop-shadow(0 0 4px rgba(204,40,16,0.2))",
        }}
      >
        {/* Fundo externo */}
        <circle cx={cx} cy={cy} r={R * 0.99} fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="2" />

        {/* Anel decorativo externo */}
        <circle cx={cx} cy={cy} r={R * 0.93} fill="none" stroke="var(--border-mid)" strokeWidth="1" strokeDasharray="2 4" />

        {/* Mostrador principal */}
        <circle cx={cx} cy={cy} r={R * 0.86} fill="var(--bg-card)" stroke="var(--bronze-dark)" strokeWidth="1.5" />

        {/* Anel interno decorativo */}
        <circle cx={cx} cy={cy} r={R * 0.76} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />

        {/* Marcas dos minutos/horas */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? "var(--bronze-light)" : "var(--bronze-dark)"}
            strokeWidth={t.isMajor ? 1.5 : 0.8}
          />
        ))}

        {/* Parafusos decorativos nos cantos */}
        {[45, 135, 225, 315].map((deg, i) => {
          const a = (deg - 90) * Math.PI / 180;
          const bx = cx + Math.cos(a) * R * 0.88;
          const by = cy + Math.sin(a) * R * 0.88;
          return (
            <g key={i}>
              <circle cx={bx} cy={by} r={4} fill="var(--bg-secondary)" stroke="var(--bronze-mid)" strokeWidth="1" />
              <line x1={bx - 2.5} y1={by} x2={bx + 2.5} y2={by} stroke="var(--bronze-dark)" strokeWidth="0.8" />
              <line x1={bx} y1={by - 2.5} x2={bx} y2={by + 2.5} stroke="var(--bronze-dark)" strokeWidth="0.8" />
            </g>
          );
        })}

        {/* Ponteiro de milissegundos (anel exterior, fino, frenético) */}
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos(msHandRad) * R * 0.72}
          y2={cy + Math.sin(msHandRad) * R * 0.72}
          stroke="var(--bronze-mid)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Ponteiro principal */}
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos(handRad) * R * 0.64}
          y2={cy + Math.sin(handRad) * R * 0.64}
          stroke="var(--red-alarm)"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px var(--red-alarm))" }}
        />

        {/* Contrapeso do ponteiro */}
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos(handRad + Math.PI) * R * 0.18}
          y2={cy + Math.sin(handRad + Math.PI) * R * 0.18}
          stroke="var(--red-dim)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Centro */}
        <circle cx={cx} cy={cy} r={6} fill="var(--bronze-mid)" stroke="var(--bronze-light)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={2} fill="var(--bg-primary)" />

        {/* Segundos no centro */}
        <text
          x={cx}
          y={cy + R * 0.35}
          textAnchor="middle"
          fill="var(--red-alarm)"
          fontSize={R * 0.11}
          fontFamily="'Special Elite', monospace"
          letterSpacing="2"
        >
          {String(seconds).padStart(4, "0")}s
        </text>

        {/* Milissegundos abaixo */}
        <text
          x={cx}
          y={cy + R * 0.47}
          textAnchor="middle"
          fill="var(--bronze-dark)"
          fontSize={R * 0.08}
          fontFamily="'Special Elite', monospace"
          opacity="0.7"
        >
          {String(milliseconds).padStart(3, "0")}ms
        </text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════
// JUÍZO FINAL CLOCK — com milissegundos
// ═══════════════════════════════════════════
interface JudgmentClockProps {
  seconds: number;
  onSecondsChange?: (newSeconds: number) => void;
}

export function JudgmentClock({ seconds, onSecondsChange }: JudgmentClockProps) {
  const [ms, setMs] = useState(0);
  const startRef = useRef<number>(Date.now());
  const baseSecondsRef = useRef<number>(seconds);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    baseSecondsRef.current = seconds;
    startRef.current = Date.now();
  }, [seconds]);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const newMs = elapsed % 1000;
      setMs(newMs);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pd = predYear(seconds);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {/* Relógio SVG */}
      <SteampunkClock seconds={seconds} milliseconds={ms} />

      {/* Display da data prevista */}
      <div
        className="card"
        style={{
          width: "100%",
          padding: "28px 24px",
          textAlign: "center",
          border: "1px solid rgba(204,40,16,0.3)",
          background: "linear-gradient(135deg, rgba(204,40,16,0.04), transparent)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 10,
            letterSpacing: 4,
            color: "var(--red-dim)",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          ✦ Data Prevista do Colapso ✦
        </div>

        <div className="year-display">{pd.y}</div>

        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 18,
            color: "var(--red-dim)",
            letterSpacing: 4,
            marginTop: 4,
          }}
        >
          {pd.m} · {pd.d}
        </div>

        {/* Milissegundos frenéticos */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            padding: "10px 0",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: 2,
              color: "var(--bronze-dark)",
              textTransform: "uppercase",
            }}
          >
            Entropia
          </span>
          <span
            className="ms-counter ms-frenetic"
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: 22,
              color: "var(--bronze-mid)",
              letterSpacing: 1,
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {String(ms).padStart(3, "0")}
          </span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: 2,
              color: "var(--bronze-dark)",
              textTransform: "uppercase",
            }}
          >
            ms
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// FIM DO DIA — Countdown
// ═══════════════════════════════════════════
export function EndOfDayClock() {
  const [remaining, setRemaining] = useState(getMidnightMs());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      setRemaining(getMidnightMs());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const { h, m, s, ms } = formatTime(remaining);
  const fractionPassed = 1 - remaining / 86400000;
  const segmentAngle = fractionPassed * 360;

  // Arco SVG para o progresso do dia
  const R_arc = 100;
  const cx_arc = 120;
  const cy_arc = 120;
  const arcRad = ((segmentAngle - 90) * Math.PI) / 180;
  const arcX = cx_arc + Math.cos(arcRad) * R_arc;
  const arcY = cy_arc + Math.sin(arcRad) * R_arc;
  const largeArc = segmentAngle > 180 ? 1 : 0;
  const arcPath = `M ${cx_arc} ${cy_arc - R_arc} A ${R_arc} ${R_arc} 0 ${largeArc} 1 ${arcX} ${arcY}`;

  return (
    <div className="card" style={{ padding: "28px 24px", textAlign: "center" }}>
      {/* Título */}
      <div
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          letterSpacing: 4,
          color: "var(--bronze-mid)",
          textTransform: "uppercase",
          marginBottom: 20,
        }}
      >
        ✦ Fim do Dia ✦
      </div>

      {/* Arco de progresso */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <svg width={240} height={240} viewBox="0 0 240 240" style={{ overflow: "visible" }}>
          {/* Círculo de fundo */}
          <circle
            cx={cx_arc} cy={cy_arc} r={R_arc}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="2"
          />
          {/* Arco de progresso */}
          {segmentAngle > 0 && segmentAngle < 360 && (
            <path
              d={arcPath}
              fill="none"
              stroke="var(--bronze-mid)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          )}

          {/* Contagem regressiva */}
          <text x={cx_arc} y={cy_arc - 22} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="'Cinzel', serif" letterSpacing="2">RESTAM</text>
          <text x={cx_arc} y={cy_arc + 2} textAnchor="middle" fill="var(--text-primary)" fontSize="30" fontFamily="'Special Elite', monospace" letterSpacing="3">
            {h}:{m}:{s}
          </text>
          <text x={cx_arc} y={cy_arc + 20} textAnchor="middle" fill="var(--bronze-dark)" fontSize="13" fontFamily="'Special Elite', monospace" opacity="0.7">
            .{ms}
          </text>
        </svg>
      </div>

      {/* Segmentos de tempo digitais */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Horas", value: h },
          { label: "Minutos", value: m },
          { label: "Segundos", value: s },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              padding: "12px 8px",
            }}
          >
            <div
              style={{
                fontFamily: "'Special Elite', monospace",
                fontSize: 28,
                color: "var(--bronze-light)",
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 8,
                letterSpacing: 2,
                color: "var(--bronze-dark)",
                marginTop: 6,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Frase */}
      <div
        style={{
          fontFamily: "'IM Fell English', serif",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          padding: "16px 0",
          borderTop: "1px solid var(--border-subtle)",
          letterSpacing: "0.02em",
        }}
      >
        "Ainda hoje estaremos aqui?"
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// THEME TOGGLE BUTTON
// ═══════════════════════════════════════════
interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Alternar tema"
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {theme === "dark" ? "☽ NOITE" : "☀ DIA"}
    </button>
  );
}

// ═══════════════════════════════════════════
// HOOK: useTheme
// ═══════════════════════════════════════════
export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("apocalypse-theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("apocalypse-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  return { theme, toggle };
}