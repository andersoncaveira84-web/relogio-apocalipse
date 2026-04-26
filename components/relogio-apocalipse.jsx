import React, { useState, useEffect, useRef } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  ShoppingCart, 
  Info, 
  Skull, 
  Zap,
  Globe,
  Lock,
  Thermometer
} from "lucide-react";

// ═══════════════════════════════════════════
// CONSTANTES E CONFIGURAÇÕES
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

const EBOOKS = [
  { id: 1, icon: "☢", title: "Protocolo Ômega", sub: "Guia de Sobrevivência Nuclear", desc: "47 páginas. Zonas de segurança, bunkers, radiação, suprimentos.", price: "R$ 19,90", badge: "MAIS VENDIDO", link: "https://hotmart.com/seu-link-protocolo-omega" },
  { id: 2, icon: "🌊", title: "Colapso Climático", sub: "O que os Modelos Não Dizem", desc: "62 páginas. Dados do IPCC, rotas de migração, preparação.", price: "R$ 24,90", badge: null, link: "https://hotmart.com/seu-link-colapso-climatico" },
  { id: 3, icon: "◈", title: "Singularidade", sub: "IA e o Fim do Controle", desc: "38 páginas. IA autônoma, cenários 2030-2050, protocolos.", price: "R$ 19,90", badge: "NOVO", link: "https://hotmart.com/seu-link-singularidade" },
  { id: 4, icon: "📦", title: "Kit Bunker Digital", sub: "Coleção completa — 3 e-books", desc: "Os três títulos com 30% de desconto. Download imediato.", price: "R$ 44,90", badge: "ECONOMIA", link: "https://hotmart.com/seu-link-kit-bunker" },
];

const AFFILIATES = [
  { icon: "📻", name: "Rádio Solar de Emergência", cat: "COMUNICAÇÃO", link: "https://amzn.to/seu-link" },
  { icon: "💧", name: "Filtro de Água LifeStraw", cat: "SOBREVIVÊNCIA", link: "https://amzn.to/seu-link" },
  { icon: "🧰", name: "Kit Primeiros Socorros Pro", cat: "MÉDICO", link: "https://amzn.to/seu-link" },
  { icon: "🔦", name: "Lanterna Tática 1000lm", cat: "EQUIPAMENTO", link: "https://amzn.to/seu-link" },
];

const MOCK_DATA = {
  ajuste_segundos: 0,
  veredicto: "A civilização permanece em um estado de equilíbrio precário sob a sombra de múltiplos vetores de extinção.",
  ticker: "CONFLITOS EM ESCALADA · AVANÇOS NÃO REGULADOS EM IA · RECORDES DE CALOR NO HEMISFÉRIO NORTE",
  violencia_br: 73,
  previsoes: [
    { titulo: "ESTADO DE ALERTA NUCLEAR", manchete_real: "Tensões aumentam entre potências", interpretacao: "Risco de escalada tática em níveis recordes.", impacto_anos: 3.1, categoria: "NUCLEAR", probabilidade: 65, gravidade: 9 },
    { titulo: "SINGULARIDADE ACELERADA", manchete_real: "Modelos de IA superam testes de Turing em massa", interpretacao: "Automação militar sem supervisão humana.", impacto_anos: 4.2, categoria: "IA", probabilidade: 70, gravidade: 10 },
  ],
};

// ═══════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════

function SteampunkClock({ seconds }) {
  const S = 280, cx = S/2, cy = S/2, R = S/2;
  const fraction = seconds / HOUR_S;
  const handRad = (-(fraction * 360) - 90) * Math.PI / 180;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="drop-shadow-[0_0_15px_rgba(212,148,10,0.3)] transition-all duration-1000">
        <defs>
          <radialGradient id="clockBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1208" />
            <stop offset="100%" stopColor="#080604" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R*0.95} fill="url(#clockBg)" stroke={C.goldDim} strokeWidth="3" />
        {/* Marcadores */}
        {[...Array(12)].map((_, i) => {
          const a = (i/12) * Math.PI * 2;
          return <line key={i} x1={cx+Math.cos(a)*R*0.8} y1={cy+Math.sin(a)*R*0.8} x2={cx+Math.cos(a)*R*0.9} y2={cy+Math.sin(a)*R*0.9} stroke={C.goldDim} strokeWidth="2" />;
        })}
        {/* Ponteiro */}
        <line 
          x1={cx} y1={cy} 
          x2={cx + Math.cos(handRad) * R * 0.75} 
          y2={cy + Math.sin(handRad) * R * 0.75} 
          stroke={C.red} strokeWidth="4" strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
        <circle cx={cx} cy={cy} r={6} fill={C.gold} />
        <text x={cx} y={cy+40} textAnchor="middle" fill={C.red} fontSize="28" fontWeight="bold" fontFamily="monospace">{seconds}s</text>
        <text x={cx} y={cy+60} textAnchor="middle" fill={C.grayDim} fontSize="10" letterSpacing="2">PARA MEIA-NOITE</text>
      </svg>
    </div>
  );
}

function NewsTicker({ text }) {
  return (
    <div className="bg-red-950/20 border-y border-red-900/30 h-10 flex items-center overflow-hidden relative">
      <div className="absolute left-0 z-10 bg-red-600 px-4 h-full flex items-center text-[10px] font-bold tracking-tighter text-white">URGENTE</div>
      <div className="animate-marquee whitespace-nowrap text-gold flex items-center gap-8 text-sm font-mono tracking-widest pl-24">
        <span>{text}</span>
        <span className="opacity-50">✦</span>
        <span>{text}</span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════
// COMPONENTE PRINCIPAL (PAGE)
// ═══════════════════════════════════════════

export default function App() {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [msRemaining, setMsRemaining] = useState(0);
  const [activeTab, setActiveTab] = useState("analise");

  const getMidMs = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  const fetchOracleData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/oracle", { method: "POST" });
      if (!response.ok) throw new Error("Erro na rede");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar Oráculo, usando MOCK:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOracleData();
    const timer = setInterval(() => setMsRemaining(getMidMs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMs = (ms) => {
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0804] text-[#f0e8d8] font-sans selection:bg-red-900">
      {/* Ticker Superior */}
      <NewsTicker text={data.ticker} />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 border-b border-white/5 pb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-serif text-gold font-bold tracking-tighter mb-2">
              DOOMSDAY <span className="text-red-600">CLOCK</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-widest flex items-center gap-2 justify-center md:justify-start">
              <ShieldAlert size={14} className="text-red-500" /> STATUS DA CIVILIZAÇÃO: CRÍTICO
            </p>
          </div>

          <div className="bg-black/40 border border-gold/20 p-6 rounded-lg text-center backdrop-blur-sm min-w-[200px]">
            <div className="text-[10px] text-gray-500 font-mono tracking-widest mb-1 uppercase">Restante Hoje</div>
            <div className="text-3xl font-bold font-mono text-gold mb-1">{formatMs(msRemaining)}</div>
            <div className="text-[9px] text-red-500/70 font-mono">SOBREVIVÊNCIA DIÁRIA</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda - Relógio e Status */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#120e08] border border-[#3a2a14] p-8 rounded-xl flex justify-center items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent opacity-50"></div>
              <SteampunkClock seconds={loading ? OFFICIAL_S : OFFICIAL_S + data.ajuste_segundos} />
            </div>

            <div className="bg-[#120e08] border border-[#3a2a14] p-6 rounded-xl">
              <h3 className="text-gold text-xs font-mono tracking-widest mb-4 flex items-center gap-2">
                <Skull size={14} /> VEREDICTO DO ORÁCULO
              </h3>
              <p className="text-sm leading-relaxed text-gray-300 italic font-serif">
                "{loading ? "Consultando frequências..." : data.veredicto}"
              </p>
              <button 
                onClick={fetchOracleData}
                disabled={loading}
                className="w-full mt-6 py-2 border border-gold/40 text-gold hover:bg-gold/10 text-xs font-mono transition-all disabled:opacity-50"
              >
                {loading ? "PROCESSANDO..." : "RE-SINCRONIZAR ORÁCULO"}
              </button>
            </div>
          </div>

          {/* Coluna Direita - Conteúdo Dinâmico */}
          <div className="lg:col-span-8">
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {[
                { id: "analise", label: "ANÁLISE DE RISCO", icon: <Zap size={14} /> },
                { id: "preparacao", label: "PREPARAÇÃO", icon: <Lock size={14} /> },
                { id: "suprimentos", label: "SUPRIMENTOS", icon: <ShoppingCart size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-[10px] font-mono tracking-widest flex items-center gap-2 transition-all border ${
                    activeTab === tab.id ? "bg-gold text-black border-gold" : "border-white/10 text-gray-500 hover:border-gold/50"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Aba: Análise de Risco */}
            {activeTab === "analise" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {data.previsoes.map((prev, i) => (
                  <div key={i} className="bg-[#120e08] border-l-4 p-6 hover:bg-[#1a140b] transition-all" style={{ borderLeftColor: CAT_COLOR[prev.categoria] }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono" style={{ color: CAT_COLOR[prev.categoria] }}>{prev.categoria}</span>
                      <span className="text-red-500 font-mono font-bold text-lg">+{prev.impacto_anos}y</span>
                    </div>
                    <h4 className="text-xl font-bold mb-2">{prev.titulo}</h4>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">{prev.interpretacao}</p>
                    <div className="flex gap-6 items-center border-t border-white/5 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-mono uppercase">Probabilidade</span>
                        <span className="text-gold font-mono">{prev.probabilidade}%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-600 font-mono uppercase">Severidade</span>
                        <div className="flex gap-1 mt-1">
                          {[...Array(10)].map((_, j) => (
                            <div key={j} className={`h-2 w-2 rounded-full ${j < prev.gravidade ? 'bg-red-600' : 'bg-gray-800'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Aba: Preparação (E-books) */}
            {activeTab === "preparacao" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                {EBOOKS.map((book) => (
                  <a href={book.link} target="_blank" rel="noopener noreferrer" key={book.id} className="group bg-[#120e08] border border-white/5 p-5 rounded-lg hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-3xl group-hover:scale-110 transition-transform">{book.icon}</span>
                        {book.badge && <span className="bg-red-600 text-white text-[8px] font-bold px-2 py-1 rounded">{book.badge}</span>}
                      </div>
                      <h4 className="text-gold font-bold mb-1">{book.title}</h4>
                      <p className="text-gray-500 text-[10px] uppercase font-mono mb-3">{book.sub}</p>
                      <p className="text-xs text-gray-400 mb-4">{book.desc}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      <span className="text-lg font-bold font-mono text-white">{book.price}</span>
                      <div className="flex items-center gap-2 text-gold text-[10px] font-bold">
                        ADQUIRIR <ExternalLink size={10} />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Aba: Suprimentos (Afiliados) */}
            {activeTab === "suprimentos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                {AFFILIATES.map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-[#080604] border border-white/5 rounded-lg items-center">
                    <div className="text-2xl bg-[#120e08] h-12 w-12 flex items-center justify-center rounded border border-white/5">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-[9px] text-gold/60 font-mono tracking-widest">{item.cat}</div>
                      <h5 className="text-sm font-bold">{item.name}</h5>
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-gold">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center text-gray-600">
          <div className="flex justify-center gap-6 mb-4">
            <Globe size={16} />
            <ShieldAlert size={16} />
            <Thermometer size={16} />
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase mb-2">
            Protocolo de IA v2.5-FLASH · Baseado em dados geofísicos e geopolíticos reais
          </p>
          <p className="max-w-2xl mx-auto text-[10px] italic leading-relaxed">
            Aviso: Este projeto é uma representação artística e analítica baseada no Doomsday Clock oficial. 
            As previsões geradas pela IA são cenários hipotéticos baseados em eventos correntes.
          </p>
        </footer>
      </main>
    </div>
  );
}