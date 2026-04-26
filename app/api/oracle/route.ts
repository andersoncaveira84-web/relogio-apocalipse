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
      interpretacao: "Três potências expandem arsenais simultaneamente. Probabilidade de conflito acidental elevada.",
      impacto_anos: 3.2,
      categoria: "NUCLEAR",
      probabilidade: 72,
      gravidade: 9,
    },
    {
      titulo: "IA MILITAR SEM APROVAÇÃO HUMANA",
      manchete_real: "Sistemas autônomos operam sem loop humano",
      interpretacao: "Tempo de escalada reduzido drasticamente por algoritmos de combate.",
      impacto_anos: 4.7,
      categoria: "IA",
      probabilidade: 61,
      gravidade: 10,
    },
    {
      titulo: "RECORDE DE TEMPERATURA GLOBAL",
      manchete_real: "2025 é o ano mais quente da história",
      interpretacao: "Colapso agrícola global revisado para períodos mais próximos.",
      impacto_anos: 2.1,
      categoria: "CLIMA",
      probabilidade: 89,
      gravidade: 8,
    },
  ],
};

export async function POST() {
  // Agora usamos a chave do Gemini
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(MOCK);
  }

  const prompt = `Você é o Oráculo do Relógio do Juízo Final. Analise o estado atual do mundo em abril de 2026 e retorne APENAS um JSON válido com esta estrutura:
{
  "success": true,
  "ajuste_segundos": <inteiro entre -5 e +10>,
  "veredicto": "<frase dramática, máx 150 chars>",
  "ticker": "<manchetes em MAIÚSCULAS separadas por ·>",
  "violencia_br": <inteiro entre 50 e 95>,
  "previsoes": [
    {
      "titulo": "<TÍTULO EM MAIÚSCULAS>",
      "manchete_real": "<manchete plausível de 2025-2026>",
      "interpretacao": "<análise de 1-2 frases>",
      "impacto_anos": <decimal>,
      "categoria": "NUCLEAR|CLIMA|IA|BIOLÓGICO|GEOPOLÍTICO|CÓSMICO",
      "probabilidade": <inteiro>,
      "gravidade": <inteiro>
    }
  ]
}
Gere exatamente 3 previsões. Não use markdown nem blocos de código.`;

  try {
    // Endpoint do Gemini 1.5 Flash (rápido e eficiente para JSON)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json", // Força o Gemini a responder JSON puro
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini API error:", err);
      return NextResponse.json(MOCK);
    }

    const data = await response.json();
    
    // O Gemini retorna o texto dentro de uma estrutura específica
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Oracle error:", error);
    return NextResponse.json(MOCK);
  }
}