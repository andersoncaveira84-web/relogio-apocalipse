import { NextResponse } from "next/server";

const MOCK = {
  ajuste_segundos: 7,
  veredicto: "A convergência de ameaças nucleares, colapso climático e IA não regulada cria vetor de extinção sem precedentes históricos.",
  ticker: "ARSENAIS NUCLEARES EXPANDEM SIMULTANEAMENTE · IA MILITAR SEM SUPERVISÃO · TEMPERATURA GLOBAL BATE RECORDE",
  violencia_br: 73,
  previsoes: [
    {
      titulo: "ARSENAIS NUCLEARES EM EXPANSÃO",
      manchete_real: "Potências expandem ogivas sem tratados ativos",
      interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental: 34% em 18 anos.",
      impacto_anos: 3.2,
      categoria: "NUCLEAR",
      probabilidade: 72,
      gravidade: 9,
    },
    {
      titulo: "IA MILITAR SEM APROVAÇÃO HUMANA",
      manchete_real: "Sistemas autônomos operam sem loop humano",
      interpretacao: "Primeiro armamento autônomo com IA sem aprovação humana documentado. Tempo de escalada cai de 72h para 11 minutos.",
      impacto_anos: 4.7,
      categoria: "IA",
      probabilidade: 61,
      gravidade: 10,
    },
    {
      titulo: "RECORDE DE TEMPERATURA GLOBAL",
      manchete_real: "2025 é o ano mais quente da história",
      interpretacao: "Terceiro ano consecutivo de recordes absolutos. Colapso agrícola global revisado para 2041.",
      impacto_anos: 2.1,
      categoria: "CLIMA",
      probabilidade: 89,
      gravidade: 8,
    },
  ],
};

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(MOCK);
  }

  const systemPrompt = `Você é o Oráculo do Relógio do Juízo Final. Analise o estado atual do mundo em 2026 e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura:
{
  "success": true,
  "ajuste_segundos": <inteiro entre -5 e +10>,
  "veredicto": "<frase dramática sobre o estado da civilização, máx 150 chars>",
  "ticker": "<manchetes em MAIÚSCULAS separadas por ·, máx 200 chars>",
  "violencia_br": <inteiro entre 50 e 95>,
  "previsoes": [
    {
      "titulo": "<TÍTULO EM MAIÚSCULAS>",
      "manchete_real": "<manchete plausível de 2025-2026>",
      "interpretacao": "<análise de 1-2 frases>",
      "impacto_anos": <decimal entre -5 e +10>,
      "categoria": "<NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO>",
      "probabilidade": <inteiro entre 40 e 95>,
      "gravidade": <inteiro entre 5 e 10>
    }
  ]
}
Gere exatamente 3 previsões baseadas em ameaças globais reais de 2025-2026. Seja dramático mas plausível.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: "Analise o estado global em abril de 2026 e gere o relatório do Oráculo.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      return NextResponse.json(MOCK);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Oracle error:", error);
    return NextResponse.json(MOCK);
  }
}