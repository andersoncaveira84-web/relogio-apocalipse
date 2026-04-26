import { NextResponse } from "next/server";

const FEEDS = [
  "https://feeds.bbci.co.uk/portuguese/rss.xml",
  "https://rss.dw.com/rdf/rss-port-all",
  "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.rss",
];

async function fetchRSS(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    const titles: string[] = [];
    const regex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1].trim();
      if (title.length > 15 && !title.toLowerCase().includes("rss") && !title.toLowerCase().includes("feed")) {
        titles.push(title);
      }
    }
    return titles.slice(0, 5);
  } catch {
    return [];
  }
}

const FALLBACK_RESPONSE = {
  success: true,
  ajuste_segundos: 6,
  veredicto: "Múltiplos vetores de risco convergem simultaneamente — a civilização opera no limiar do colapso.",
  ticker: "TENSÃO NUCLEAR EM ALTA · CLIMA FORA DE CONTROLE · IA SEM REGULAÇÃO · VIOLÊNCIA GLOBAL CRESCE",
  violencia_br: 74,
  previsoes: [
    {
      titulo: "ARSENAIS NUCLEARES EM EXPANSÃO",
      manchete_real: "Potências nucleares expandem arsenais sem tratados ativos",
      interpretacao: "Três potências expandem arsenais simultaneamente pela primeira vez desde 1983. Modelos de conflito acidental indicam 34% de probabilidade em 18 anos.",
      impacto_anos: 3.2,
      categoria: "NUCLEAR",
      probabilidade: 72,
      gravidade: 9,
    },
    {
      titulo: "TEMPERATURA GLOBAL BATE RECORDE",
      manchete_real: "2025 é o ano mais quente já registrado na história",
      interpretacao: "Terceiro ano consecutivo de recordes absolutos. Colapso agrícola global revisado para 2041, 9 anos antes da estimativa anterior do IPCC.",
      impacto_anos: 2.8,
      categoria: "CLIMA",
      probabilidade: 89,
      gravidade: 8,
    },
    {
      titulo: "IA MILITAR SEM CONTROLE HUMANO",
      manchete_real: "Sistemas autônomos operam sem aprovação humana",
      interpretacao: "Primeiro armamento autônomo com IA sem loop de aprovação humana documentado. Em conflito real, tempo de escalada cai de 72h para 11 minutos.",
      impacto_anos: 4.1,
      categoria: "IA",
      probabilidade: 61,
      gravidade: 10,
    },
  ],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "fetchNews") {
      const results = await Promise.allSettled(FEEDS.map(fetchRSS));
      const all: string[] = [];
      for (const r of results) {
        if (r.status === "fulfilled") {
          all.push(...r.value);
        }
      }
      const unique = [...new Set(all)].slice(0, 8);
      return NextResponse.json({ headlines: unique });
    }

    if (action === "analyze") {
      const headlines: string[] = body?.headlines || [];

      if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(FALLBACK_RESPONSE);
      }

      const hl = headlines.length > 0
        ? headlines.map((t, i) => `${i + 1}. ${t}`).join("\n")
        : "Tensão nuclear global, mudanças climáticas, IA sem regulação";

      let aiText = "";

      try {
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1500,
            system: `Você é o ALGORITMO CRONOS. Analise manchetes e calcule impacto no prazo de extinção humana. Responda SOMENTE com JSON válido, sem markdown, sem texto antes ou depois. O JSON deve ter exatamente esta estrutura: {"ajuste_segundos":5,"veredicto":"frase","ticker":"frase curta","violencia_br":70,"previsoes":[{"titulo":"TITULO","manchete_real":"manchete","interpretacao":"texto","impacto_anos":2.5,"categoria":"NUCLEAR","probabilidade":75,"gravidade":8}]}`,
            messages: [{
              role: "user",
              content: `Analise estas manchetes:\n${hl}\n\nResponda apenas com o JSON, sem nenhum texto adicional.`,
            }],
          }),
          signal: AbortSignal.timeout(25000),
        });

        const aiData = await aiRes.json();
        aiText = aiData?.content?.[0]?.text || "";
      } catch {
        return NextResponse.json(FALLBACK_RESPONSE);
      }

      if (!aiText) {
        return NextResponse.json(FALLBACK_RESPONSE);
      }

      try {
        const clean = aiText.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (!match) {
          return NextResponse.json(FALLBACK_RESPONSE);
        }
        const parsed = JSON.parse(match[0]);
        return NextResponse.json({ success: true, ...parsed });
      } catch {
        return NextResponse.json(FALLBACK_RESPONSE);
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch {
    return NextResponse.json(FALLBACK_RESPONSE);
  }
}