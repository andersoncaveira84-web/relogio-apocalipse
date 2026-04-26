"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface BlogPost {
  id: string;
  slug: string;
  date: string;
  category: "HISTÓRIA" | "ANÁLISE" | "PROFECIA" | "RELATÓRIO" | "MANIFESTO";
  title: string;
  excerpt: string;
  readingTime: string;
  pinned?: boolean;
  content?: string;
}

interface RealNews {
  title: string;
  source: string;
  url: string;
  pubDate: string;
  category: string;
}

interface Product {
  id: string;
  icon: string;
  title: string;
  desc: string;
  price: string;
  priceValue: number;
  affiliateLink?: string;
}

// ═══════════════════════════════════════════
// DOOMSDAY CLOCK HISTORY — POST FIXO
// ═══════════════════════════════════════════
const DOOMSDAY_POST: BlogPost = {
  id: "doomsday-historia",
  slug: "historia-do-relogio-do-juizo-final",
  date: "JAN 1947",
  category: "HISTÓRIA",
  title: "O Relógio do Juízo Final: 77 Anos Contando o Fim",
  excerpt: "Em 1947, cientistas que construíram a bomba atômica criaram um relógio para avisar a humanidade de sua própria extinção. Esta é a história de como chegamos a 89 segundos para meia-noite.",
  readingTime: "8 min",
  pinned: true,
  content: `**1947 — O Nascimento**
O Boletim dos Cientistas Atômicos criou o Doomsday Clock dois anos após as bombas de Hiroshima e Nagasaki. A lógica era simples: a meia-noite representa o apocalipse nuclear. O relógio nasceu marcando 7 minutos para meia-noite.

**Por que um relógio?**
Os cientistas — muitos deles ex-participantes do Projeto Manhattan — sentiam o peso moral de ter criado a arma de destruição em massa mais poderosa da história. O relógio era sua forma de dizer ao mundo: nós construímos isso, agora precisamos impedir que seja usado.

**Os momentos mais críticos**
Em 1953, após os testes de bomba de hidrogênio pelos EUA e URSS, o ponteiro chegou a 2 minutos para meia-noite. Em 1991, com o fim da Guerra Fria, recuou para 17 minutos — o mais longe que já esteve.

**A era moderna: novas ameaças**
A partir de 2007, o Bulletim incluiu as mudanças climáticas como fator. Em 2020, chegou a 100 segundos. Em 2023, avançou para 90 segundos. Em janeiro de 2025, o ponteiro marcou 89 segundos — o mais próximo da extinção em toda a história do relógio.

**Por que este site existe**
Este projeto existe para traduzir a linguagem do Doomsday Clock para o cotidiano. Os 89 segundos não são abstratos — são a soma de arsenais nucleares expandindo, IA militar sem supervisão humana, colapso climático acelerado e tensões geopolíticas sem precedentes desde 1945.

O relógio não prevê o fim. Ele mede nossa proximidade com ele. E a única forma de recuá-lo é a consciência coletiva.

*"Nós somos os guardadores do tempo. E o tempo está acabando." — Boletim dos Cientistas Atômicos, 2025*`
};

const STATIC_POSTS: BlogPost[] = [
  { id: "2", slug: "ia-guerra-assimetrica", date: "FEV 2026", category: "ANÁLISE", title: "IA e a Nova Guerra Assimétrica", excerpt: "Quando algoritmos tomam decisões de vida e morte em milissegundos, o campo de batalha deixa de ser geográfico.", readingTime: "11 min" },
  { id: "3", slug: "colapso-climatico-2041", date: "MAR 2026", category: "PROFECIA", title: "2041 — A Data Revisada do Colapso Agrícola", excerpt: "Modelos climáticos atualizados com dados de 2025 apontam para um colapso sistêmico da cadeia alimentar global quatro anos antes do previsto.", readingTime: "9 min" },
  { id: "4", slug: "preparacao-individual", date: "ABR 2026", category: "MANIFESTO", title: "Preparação Individual num Mundo em Colapso", excerpt: "Não se trata de paranoia, mas de lucidez. Um guia prático para os próximos cinco anos.", readingTime: "14 min" },
];

const CAT_COLORS: Record<string, string> = {
  HISTÓRIA: "#d4940a", ANÁLISE: "#2890c0", PROFECIA: "var(--red-alarm)",
  RELATÓRIO: "var(--bronze-light)", MANIFESTO: "#30b060", NUCLEAR: "var(--red-alarm)",
  CLIMA: "#e08020", IA: "#2890c0", GEOPOLÍTICO: "#9040c0",
};

// ═══════════════════════════════════════════
// RSS REAL NEWS
// ═══════════════════════════════════════════
const KEYWORDS = ["nuclear","climate","war","conflict","crisis","AI weapon","famine","drought","missile","geopolit","extinction","weapon"];

async function fetchRealNews(): Promise<RealNews[]> {
  const results: RealNews[] = [];
  try {
    const feedUrl = "https://feeds.bbci.co.uk/news/world/rss.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=30`;
    const res = await fetch(apiUrl, { cache: "no-store" });
    const data = await res.json();
    if (data.status !== "ok" || !data.items) return [];
    for (const item of data.items) {
      const t = (item.title || "").toLowerCase();
      if (!KEYWORDS.some(k => t.includes(k))) continue;
      const category = t.includes("nuclear") ? "NUCLEAR"
        : t.includes("climate") ? "CLIMA"
        : t.includes("ai") || t.includes("artificial") ? "IA"
        : "GEOPOLÍTICO";
      results.push({
        title: item.title,
        source: "BBC World",
        url: item.link,
        pubDate: new Date(item.pubDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        category,
      });
      if (results.length >= 6) break;
    }
  } catch { /* sem notícias */ }
  return results;
}

// ═══════════════════════════════════════════
// DOOMSDAY MODAL
// ═══════════════════════════════════════════
function DoomsdayModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9000, overflowY: "auto", padding: "20px 16px" }} onClick={onClose}>
      <div style={{ maxWidth: 600, margin: "0 auto", background: "var(--bg-card)", border: "1px solid var(--border-mid)", padding: "28px 20px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="badge" style={{ borderColor: CAT_COLORS[post.category], color: CAT_COLORS[post.category], marginBottom: 10 }}>{post.category}</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(15px, 4vw, 19px)", color: "var(--text-primary)", lineHeight: 1.4 }}>{post.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, paddingLeft: 16 }}>✕</button>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 20, padding: "14px", border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 10 }}>◈ Linha do Tempo</div>
          {[["1947","7 min","Criação do relógio — pós Hiroshima"],["1953","2 min","Testes de bomba H — EUA e URSS"],["1991","17 min","Fim da Guerra Fria — ponto mais seguro"],["2007","5 min","Clima incluído como ameaça"],["2023","90 seg","Novo recorde de proximidade"],["2025","89 seg","O mais próximo da meia-noite da história"]].map(([year, min, event]) => (
            <div key={year} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 11, color: "var(--bronze-light)", minWidth: 36 }}>{year}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: year === "2025" ? "var(--red-alarm)" : "var(--bronze-mid)", minWidth: 52 }}>{min}</div>
              <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{event}</div>
            </div>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
          {post.content?.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) return <h3 key={i} style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "var(--bronze-light)", letterSpacing: 1, margin: "18px 0 8px", textTransform: "uppercase" }}>{line.replace(/\*\*/g, "")}</h3>;
            if (line.startsWith("*") && line.endsWith("*")) return <p key={i} style={{ fontStyle: "italic", color: "var(--bronze-mid)", margin: "12px 0" }}>{line.replace(/\*/g, "")}</p>;
            if (!line.trim()) return <br key={i} />;
            return <p key={i} style={{ margin: "6px 0" }}>{line}</p>;
          })}
        </div>
        <button className="btn-primary" onClick={onClose} style={{ marginTop: 20 }}><span>✕ Fechar</span></button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BLOG SECTION
// ═══════════════════════════════════════════
export function BlogSection() {
  const [activeCategory, setActiveCategory] = useState("TODOS");
  const [realNews, setRealNews] = useState<RealNews[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const categories = ["TODOS", "HISTÓRIA", "ANÁLISE", "PROFECIA", "MANIFESTO"];

  useEffect(() => { fetchRealNews().then(n => { setRealNews(n); setLoadingNews(false); }); }, []);

  const filtered = activeCategory === "TODOS" ? STATIC_POSTS
    : activeCategory === "HISTÓRIA" ? []
    : STATIC_POSTS.filter(p => p.category === activeCategory);

  return (
    <div className="page-enter">
      {openPost && <DoomsdayModal post={openPost} onClose={() => setOpenPost(null)} />}

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 10 }}>✦ Arquivo de Profecias</div>
        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(16px, 4vw, 22px)", color: "var(--text-primary)", letterSpacing: 2 }}>A Biblioteca do Fim</h2>
      </div>

      {/* POST FIXO — História */}
      {(activeCategory === "TODOS" || activeCategory === "HISTÓRIA") && (
        <div className="card" onClick={() => setOpenPost(DOOMSDAY_POST)} style={{ padding: "20px", marginBottom: 14, cursor: "pointer", border: "1px solid var(--border-mid)", background: "linear-gradient(135deg, rgba(212,148,10,0.06), transparent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="badge" style={{ borderColor: CAT_COLORS["HISTÓRIA"], color: CAT_COLORS["HISTÓRIA"] }}>HISTÓRIA</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 8, letterSpacing: 2, color: "var(--bronze-mid)", padding: "2px 8px", border: "1px solid var(--bronze-dark)" }}>FIXO</div>
            </div>
            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 10, color: "var(--text-muted)" }}>1947 · 8 min</div>
          </div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(14px, 3.5vw, 16px)", color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{DOOMSDAY_POST.title}</h3>
          <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>{DOOMSDAY_POST.excerpt}</p>
          {/* Mini timeline */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
            {[["1947","7min"],["1953","2min"],["1991","17min"],["2023","90s"],["2025","89s"]].map(([y,m]) => (
              <div key={y} style={{ flexShrink: 0, textAlign: "center", padding: "5px 10px", border: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
                <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "var(--bronze-mid)" }}>{y}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: y === "2025" ? "var(--red-alarm)" : "var(--text-muted)" }}>{m}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: "var(--bronze-mid)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
            Ler história completa <span style={{ color: "var(--red-alarm)" }}>→</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: "none", border: `1px solid ${activeCategory === cat ? "var(--bronze-light)" : "var(--border-subtle)"}`, color: activeCategory === cat ? "var(--bronze-light)" : "var(--text-muted)", padding: "5px 12px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", transition: "all 0.3s ease" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Posts estáticos */}
      {filtered.map(post => (
        <div key={post.id} className="card" style={{ padding: "18px", marginBottom: 10, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div className="badge" style={{ borderColor: CAT_COLORS[post.category] || "var(--bronze-mid)", color: CAT_COLORS[post.category] || "var(--bronze-mid)" }}>{post.category}</div>
            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 10, color: "var(--text-muted)" }}>{post.date} · {post.readingTime}</div>
          </div>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(13px, 3.5vw, 16px)", color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{post.title}</h3>
          <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 }}>{post.excerpt}</p>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: "var(--bronze-mid)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>Continuar <span style={{ color: "var(--red-alarm)" }}>→</span></div>
        </div>
      ))}

      {/* Notícias reais */}
      {(activeCategory === "TODOS" || activeCategory === "RELATÓRIO") && (
        <>
          <div className="ornament" style={{ margin: "20px 0 14px" }}>◈</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 12 }}>✦ Notícias Reais — BBC World</div>
          {loadingNews ? (
            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 12, color: "var(--text-muted)", padding: "16px", textAlign: "center" }}>⌛ Buscando notícias...</div>
          ) : realNews.length === 0 ? (
            <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "var(--text-muted)", padding: "14px", border: "1px solid var(--border-subtle)", textAlign: "center" }}>Nenhuma notícia crítica encontrada no momento.</div>
          ) : (
            realNews.map((news, i) => (
              <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", marginBottom: 8 }}>
                <div className="card" style={{ padding: "13px 15px", borderLeft: `3px solid ${CAT_COLORS[news.category] || "var(--bronze-mid)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div className="badge" style={{ borderColor: CAT_COLORS[news.category] || "var(--bronze-mid)", color: CAT_COLORS[news.category] || "var(--bronze-mid)" }}>{news.category}</div>
                      <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "var(--bronze-mid)", letterSpacing: 1 }}>{news.source}</div>
                    </div>
                    <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 9, color: "var(--text-muted)" }}>{news.pubDate}</div>
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 6 }}>{news.title}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 2, color: "var(--bronze-dark)", display: "flex", alignItems: "center", gap: 6 }}>Fonte original <span style={{ color: "var(--red-alarm)" }}>↗</span></div>
                </div>
              </a>
            ))
          )}
        </>
      )}

      {/* Newsletter */}
      <div className="ornament" style={{ margin: "24px 0 18px" }}>◈</div>
      <div className="card" style={{ padding: "22px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 13, color: "var(--bronze-light)", marginBottom: 8 }}>Receba as Profecias</div>
        <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>Análises semanais. Sem filtros, sem otimismo falso.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="email" placeholder="seu@email.com" style={{ flex: 1, padding: "10px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-mid)", color: "var(--text-primary)", fontFamily: "'Special Elite', monospace", fontSize: 13, outline: "none" }} />
          <button className="btn-secondary">Assinar</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHOP SECTION
// ═══════════════════════════════════════════
const PRODUCTS: Product[] = [
  { id: "ebook-colapso", icon: "📕", title: "Guia de Sobrevivência ao Colapso", desc: "O roteiro completo para os próximos 20 anos. Finanças, saúde, preparação física e mental. 180 páginas.", price: "R$ 27,00", priceValue: 2700 },
  { id: "ebook-ia-risco", icon: "🤖", title: "IA: Risco Existencial ou Salvação?", desc: "Uma análise imparcial dos cenários possíveis. Da superinteligência benéfica ao apocalipse algorítmico.", price: "R$ 19,00", priceValue: 1900 },
  { id: "ebook-nuclear-atlas", icon: "☢️", title: "Atlas Nuclear 2026", desc: "Mapas, dados e análises dos arsenais ativos. Onde os mísseis apontam e o que os tratados não dizem.", price: "R$ 34,00", priceValue: 3400 },
];

async function createMPCheckout(product: Product): Promise<string | null> {
  try {
    const res = await fetch("/api/mp-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, title: product.title, price: product.priceValue }) });
    const data = await res.json();
    return data.init_point || null;
  } catch { return null; }
}

export function ShopSection() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(product: Product) {
    if (loadingId) return;
    setLoadingId(product.id); setError(null);
    if (product.affiliateLink) { window.open(product.affiliateLink, "_blank"); setLoadingId(null); return; }
    const initPoint = await createMPCheckout(product);
    if (initPoint) window.location.href = initPoint;
    else setError("Falha ao iniciar checkout. Tente novamente.");
    setLoadingId(null);
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 4, color: "var(--bronze-mid)", textTransform: "uppercase", marginBottom: 10 }}>✦ Relíquias do Apocalipse</div>
        <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "clamp(16px, 4vw, 22px)", color: "var(--text-primary)", letterSpacing: 2 }}>A Vitrine do Fim</h2>
      </div>
      <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 12, color: "var(--text-muted)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border-subtle)", lineHeight: 1.6 }}>
        Conhecimento como última linha de defesa. Cada obra foi produzida com rigor analítico para quem prefere ver o abismo de olhos abertos.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PRODUCTS.map(product => (
          <div key={product.id} className="card" style={{ padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 26 }}>{product.icon}</span>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: "var(--text-primary)", lineHeight: 1.3, flex: 1 }}>{product.title}</div>
            </div>
            <p style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{product.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: "var(--red-alarm)", fontWeight: 700 }}>{product.price}</div>
              <button className="mp-checkout-btn" onClick={() => handleBuy(product)} disabled={loadingId === product.id} style={{ width: "auto", padding: "9px 18px", opacity: loadingId === product.id ? 0.6 : 1, cursor: loadingId === product.id ? "not-allowed" : "pointer" }}>
                {loadingId === product.id ? "AGUARDE..." : "ADQUIRIR"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {error && <div style={{ marginTop: 12, padding: "10px 14px", border: "1px solid var(--red-alarm)", color: "var(--red-alarm)", fontFamily: "'Special Elite', monospace", fontSize: 12 }}>⚠ {error}</div>}
      <div className="ornament" style={{ margin: "22px 0 16px" }}>◈</div>
      <div className="card" style={{ padding: "18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["🔐","Pagamento Seguro","Via Mercado Pago"],["📲","Entrega Imediata","Acesso instantâneo"],["🔄","7 Dias de Garantia","Reembolso garantido"],["📚","Formato Digital","PDF + ePub"]].map(([icon, label, desc]) => (
          <div key={String(label)} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 15 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 1, color: "var(--text-primary)", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LAYOUT COMBINADO
// ═══════════════════════════════════════════
export type ShopBlogPage = "blog" | "loja";

export function ShopBlogLayout({ initialPage = "blog" }: { initialPage?: ShopBlogPage }) {
  const [activePage, setActivePage] = useState<ShopBlogPage>(initialPage);
  return (
    <div>
      <div style={{ display: "flex", marginBottom: 22, borderBottom: "1px solid var(--border-subtle)" }}>
        {(["blog", "loja"] as ShopBlogPage[]).map(p => (
          <button key={p} onClick={() => setActivePage(p)} style={{ background: "none", border: "none", borderBottom: activePage === p ? "2px solid var(--red-alarm)" : "2px solid transparent", color: activePage === p ? "var(--text-primary)" : "var(--text-muted)", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", padding: "10px 18px 12px", transition: "all 0.3s ease", marginBottom: "-1px" }}>
            {p === "blog" ? "☽ Arquivo" : "✦ Vitrine"}
          </button>
        ))}
      </div>
      {activePage === "blog" ? <BlogSection /> : <ShopSection />}
    </div>
  );
}