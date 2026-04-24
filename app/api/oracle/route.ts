import { NextResponse } from "next/server";

// ═══════════════════════════════════════════
// RSS FEEDS — buscados pelo servidor
// ═══════════════════════════════════════════
const FEEDS = [
  "https://feeds.bbci.co.uk/portuguese/rss.xml",
  "https://rss.dw.com/rdf/rss-port-all",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.rss",
];

async function fetchRSS(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DoomsdayClock/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g) || [];
    return matches
      .map(m => m.replace(/<title><!\[CDATA\[|\]\]><\/title>|<title>|<\/title>/g, "").trim())
      .filter(t => t.length > 10 && !t.toLowerCase().includes("rss") && !t.toLowerCase().includes("feed"))
      .slice(0, 5);
  } catch {
    return [];
  }
}

async function getAllNews(): Promise<string[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchRSS));
  const all: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return [...new Set(all)].slice(0, 8);
}

// ═══════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════
export async function GET() {
  try {
    const headlines = await getAllNews();
    return NextResponse.json({ headlines });
  } catch (e) {
    return NextResponse.json({ headlines: [], error: String(e) });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── Buscar notícias ──
    if (action === "fetchNews") {
      const headlines = await getAllNews();
      return NextResponse.json({ headlines });
    }

    // ── Chamar IA com as manchetes ──
    if (action === "analyze") {
      const { headlines } = body;
      const hl = (headlines as string[]).map((t, i) => `${i + 1}. ${t}`).join("\n");

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1600,
          system: `Você é o ALGORITMO CRONOS — sistema de análise de risco e vigilância global.
Analise manchetes reais de notícias e calcule impacto no prazo de sobrevivência da civilização humana.
Responda SOMENTE JSON válido sem markdown, sem backticks, sem texto extra.
Formato exato:
{
  "ajuste_segundos": número inteiro entre -20 e 30,
  "veredicto": "1 frase sombria e precisa sobre o estado atual da humanidade",
  "ticker": "resumo dramático das principais ameaças em até 20 palavras",
  "violencia_br": número de 0 a 100 estimando nível de violência noticiada no Brasil,
  "previsoes": [
    {
      "titulo": "TÍTULO EM MAIÚSCULAS com máx 7 palavras",
      "manchete_real": "manchete original resumida em até 15 palavras",
      "interpretacao": "2-3 frases conectando a notícia ao risco global de forma científica e sombria",
      "impacto_anos": número decimal positivo ou negativo,
      "categoria": "NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO",
      "probabilidade": número inteiro de 1 a 99,
      "gravidade": número inteiro de 1 a 10
    }
  ]
}
ajuste_segundos positivo = relógio avança (mais perigoso).
impacto_anos positivo = aproxima o apocalipse, negativo = afasta.
Seja científico, sombrio e preciso. Terror plausível baseado nos fatos reais.`,
          messages: [{
            role: "user",
            content: `Analise estas manchetes reais de hoje para o Relógio do Juízo Final:\n\n${hl}`,
          }],
        }),
      });

      const aiData = await aiRes.json();
      const text = aiData.content?.map((c: { text?: string }) => c.text || "").join("") || "{}";

      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        return NextResponse.json({ success: true, ...parsed });
      } catch {
        return NextResponse.json({ success: false, error: "parse_error", raw: text });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}