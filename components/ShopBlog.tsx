"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════
interface BlogPost {
  id: string;
  slug: string;
  date: string;
  category: "ANÁLISE" | "PROFECIA" | "RELATÓRIO" | "MANIFESTO";
  title: string;
  excerpt: string;
  readingTime: string;
}

interface Product {
  id: string;
  icon: string;
  title: string;
  desc: string;
  price: string;          // Ex: "R$ 27,00"
  priceValue: number;     // Valor em centavos para o MP
  affiliateLink?: string; // Link externo (opcional, para afiliados)
  mpPreferenceId?: string; // ID do Mercado Pago (gerado via backend)
}

// ═══════════════════════════════════════════
// MOCK DATA — substitua por fetch/CMS real
// ═══════════════════════════════════════════
const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "reloj-doomsday-2026",
    date: "JAN 2026",
    category: "RELATÓRIO",
    title: "Por que o Relógio avançou em 2026",
    excerpt: "Três fatores convergiram no inverno do hemisfério norte: proliferação nuclear acelerada, colapso das negociações climáticas de Dubai II e a ascensão de IA militar sem supervisão.",
    readingTime: "7 min",
  },
  {
    id: "2",
    slug: "ia-guerra-assimetrica",
    date: "FEV 2026",
    category: "ANÁLISE",
    title: "IA e a Nova Guerra Assimétrica",
    excerpt: "Quando algoritmos tomam decisões de vida e morte em milissegundos, o campo de batalha deixa de ser geográfico. A soberania humana sobre o gatilho está sob ameaça existencial.",
    readingTime: "11 min",
  },
  {
    id: "3",
    slug: "colapso-climatico-2041",
    date: "MAR 2026",
    category: "PROFECIA",
    title: "2041 — A Data Revisada do Colapso Agrícola",
    excerpt: "Modelos climáticos atualizados com dados de 2025 apontam para um colapso sistêmico da cadeia alimentar global quatro anos antes do previsto. O que fazer agora.",
    readingTime: "9 min",
  },
  {
    id: "4",
    slug: "preparacao-individual",
    date: "ABR 2026",
    category: "MANIFESTO",
    title: "Preparação Individual num Mundo em Colapso",
    excerpt: "Não se trata de paranoia, mas de lucidez. Um guia prático para os próximos cinco anos: finanças, saúde, comunidade e resiliência psicológica.",
    readingTime: "14 min",
  },
];

const PRODUCTS: Product[] = [
  {
    id: "ebook-colapso",
    icon: "📕",
    title: "Guia de Sobrevivência ao Colapso",
    desc: "O roteiro completo para os próximos 20 anos. Finanças, saúde, preparação física e mental. 180 páginas de análise e estratégia.",
    price: "R$ 27,00",
    priceValue: 2700,
  },
  {
    id: "ebook-ia-risco",
    icon: "🤖",
    title: "IA: Risco Existencial ou Salvação?",
    desc: "Uma análise imparcial dos cenários possíveis. Da superinteligência benéfica ao apocalipse algorítmico. Você decide.",
    price: "R$ 19,00",
    priceValue: 1900,
  },
  {
    id: "ebook-nuclear-atlas",
    icon: "☢️",
    title: "Atlas Nuclear 2026",
    desc: "Mapas, dados e análises dos arsenais ativos. Onde os mísseis apontam, quais cidades estão em risco e o que os tratados não dizem.",
    price: "R$ 34,00",
    priceValue: 3400,
  },
];

const CAT_COLORS: Record<string, string> = {
  ANÁLISE:   "var(--blue, #2890c0)",
  PROFECIA:  "var(--red-alarm)",
  RELATÓRIO: "var(--bronze-light)",
  MANIFESTO: "var(--green, #30b060)",
};

// ═══════════════════════════════════════════
// MERCADO PAGO INTEGRATION
// ═══════════════════════════════════════════
/*
  Para integrar com Mercado Pago:
  1. Crie uma rota /api/mp-checkout que:
     - Recebe { productId, title, price } via POST
     - Chama a API do MP para criar uma preferência
     - Retorna { init_point: "https://..." }
  2. Substitua handleBuy() abaixo para redirecionar ao init_point
  
  Exemplo de rota (app/api/mp-checkout/route.ts):
  ─────────────────────────────────────────────
  import { MercadoPagoConfig, Preference } from "mercadopago";
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  
  export async function POST(req: Request) {
    const { title, price } = await req.json();
    const pref = await new Preference(client).create({ body: {
      items: [{ title, unit_price: price / 100, quantity: 1, currency_id: "BRL" }],
      back_urls: { success: `${process.env.NEXT_PUBLIC_URL}/obrigado`, failure: `${process.env.NEXT_PUBLIC_URL}/loja` },
      auto_return: "approved",
    }});
    return Response.json({ init_point: pref.init_point });
  }
*/

async function createMPCheckout(product: Product): Promise<string | null> {
  try {
    const res = await fetch("/api/mp-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        title: product.title,
        price: product.priceValue,
      }),
    });
    const data = await res.json();
    return data.init_point || null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// BLOG SECTION
// ═══════════════════════════════════════════
export function BlogSection() {
  const [activeCategory, setActiveCategory] = useState<string>("TODOS");
  const categories = ["TODOS", "ANÁLISE", "PROFECIA", "RELATÓRIO", "MANIFESTO"];

  const filtered = activeCategory === "TODOS"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <div className="page-enter">
      {/* Cabeçalho da seção */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: 4,
            color: "var(--bronze-mid)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ✦ Arquivo de Profecias
        </div>
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(18px, 5vw, 26px)",
            color: "var(--text-primary)",
            letterSpacing: 2,
          }}
        >
          A Biblioteca do Fim
        </h2>
      </div>

      {/* Filtros por categoria */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: "none",
              border: `1px solid ${activeCategory === cat ? "var(--bronze-light)" : "var(--border-subtle)"}`,
              color: activeCategory === cat ? "var(--bronze-light)" : "var(--text-muted)",
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              transition: "all 0.3s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards do blog */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((post) => (
          <article
            key={post.id}
            className="card"
            style={{
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            // Em prod: onClick={() => router.push(`/blog/${post.slug}`)}
          >
            {/* Meta */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div
                className="badge"
                style={{
                  borderColor: CAT_COLORS[post.category] || "var(--bronze-mid)",
                  color: CAT_COLORS[post.category] || "var(--bronze-mid)",
                }}
              >
                {post.category}
              </div>
              <div
                style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  letterSpacing: 1,
                  display: "flex",
                  gap: 12,
                }}
              >
                <span>{post.date}</span>
                <span>· {post.readingTime}</span>
              </div>
            </div>

            {/* Título */}
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(14px, 3.5vw, 17px)",
                color: "var(--text-primary)",
                marginBottom: 10,
                lineHeight: 1.4,
                letterSpacing: "0.02em",
              }}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            <p
              style={{
                fontFamily: "'IM Fell English', serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              {post.excerpt}
            </p>

            {/* Ler mais */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 9,
                letterSpacing: 3,
                color: "var(--bronze-mid)",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Continuar a leitura
              <span style={{ color: "var(--red-alarm)" }}>→</span>
            </div>
          </article>
        ))}
      </div>

      {/* Divider ornamental */}
      <div className="ornament" style={{ marginTop: 32 }}>◈</div>

      {/* Call to action newsletter */}
      <div
        className="card"
        style={{
          padding: "24px",
          textAlign: "center",
          border: "1px solid var(--border-mid)",
          background: "linear-gradient(135deg, rgba(200,134,42,0.03), transparent)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 14,
            color: "var(--bronze-light)",
            marginBottom: 8,
          }}
        >
          Receba as Profecias
        </div>
        <p
          style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Análises semanais sobre os vetores de extinção. Sem filtros, sem otimismo falso.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            placeholder="seu@email.com"
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-primary)",
              fontFamily: "'Special Elite', monospace",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button className="btn-secondary" type="button">
            <span>Assinar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHOP SECTION
// ═══════════════════════════════════════════
export function ShopSection() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(product: Product) {
    if (loadingId) return;
    setLoadingId(product.id);
    setError(null);

    // Se há link de afiliado, redireciona diretamente (sem MP)
    if (product.affiliateLink) {
      window.open(product.affiliateLink, "_blank");
      setLoadingId(null);
      return;
    }

    // Caso contrário, usa Mercado Pago
    const initPoint = await createMPCheckout(product);
    if (initPoint) {
      window.location.href = initPoint;
    } else {
      setError("Falha ao iniciar checkout. Tente novamente.");
    }
    setLoadingId(null);
  }

  return (
    <div className="page-enter">
      {/* Cabeçalho */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 9,
            letterSpacing: 4,
            color: "var(--bronze-mid)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ✦ Relíquias do Apocalipse
        </div>
        <h2
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "clamp(18px, 5vw, 26px)",
            color: "var(--text-primary)",
            letterSpacing: 2,
          }}
        >
          A Vitrine do Fim
        </h2>
      </div>

      {/* Aviso discreto */}
      <div
        style={{
          fontFamily: "'IM Fell English', serif",
          fontStyle: "italic",
          fontSize: 12,
          color: "var(--text-muted)",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border-subtle)",
          lineHeight: 1.6,
        }}
      >
        Conhecimento como última linha de defesa. Cada obra foi produzida com rigor analítico
        para quem prefere ver o abismo de olhos abertos.
      </div>

      {/* Grid de produtos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="card product-card"
          >
            {/* Ícone e título */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div className="product-icon">{product.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="product-title">{product.title}</div>
              </div>
            </div>

            {/* Descrição */}
            <p className="product-desc">{product.desc}</p>

            {/* Preço e CTA */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 14,
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div className="product-price">{product.price}</div>
              <button
                className="mp-checkout-btn"
                onClick={() => handleBuy(product)}
                disabled={loadingId === product.id}
                style={{
                  width: "auto",
                  padding: "10px 20px",
                  opacity: loadingId === product.id ? 0.6 : 1,
                  cursor: loadingId === product.id ? "not-allowed" : "pointer",
                }}
              >
                {loadingId === product.id ? "AGUARDE..." : "ADQUIRIR"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Erro do checkout */}
      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            border: "1px solid var(--red-alarm)",
            color: "var(--red-alarm)",
            fontFamily: "'Special Elite', monospace",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Divider */}
      <div className="ornament" style={{ marginTop: 32 }}>◈</div>

      {/* Garantia / Confiança */}
      <div
        className="card"
        style={{
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {[
          { icon: "🔐", label: "Pagamento Seguro", desc: "Via Mercado Pago" },
          { icon: "📲", label: "Entrega Imediata", desc: "Acesso instantâneo" },
          { icon: "🔄", label: "7 Dias de Garantia", desc: "Reembolso garantido" },
          { icon: "📚", label: "Formato Digital", desc: "PDF + ePub" },
        ].map(({ icon, label, desc }) => (
          <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: 1,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                }}
              >
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN EXPORT — Layout combinado
// ═══════════════════════════════════════════
export type ShopBlogPage = "blog" | "loja";

interface ShopBlogProps {
  initialPage?: ShopBlogPage;
}

export function ShopBlogLayout({ initialPage = "blog" }: ShopBlogProps) {
  const [activePage, setActivePage] = useState<ShopBlogPage>(initialPage);

  return (
    <div>
      {/* Sub-navegação */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 28,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {(["blog", "loja"] as ShopBlogPage[]).map(p => (
          <button
            key={p}
            onClick={() => setActivePage(p)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activePage === p ? "2px solid var(--red-alarm)" : "2px solid transparent",
              color: activePage === p ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              padding: "10px 20px 12px",
              transition: "all 0.3s ease",
              marginBottom: "-1px",
            }}
          >
            {p === "blog" ? "☽ Arquivo" : "✦ Vitrine"}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activePage === "blog" ? <BlogSection /> : <ShopSection />}
    </div>
  );
}