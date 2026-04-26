import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK = {
  ajuste_segundos: 5,
  veredicto: "Erro de Conexão.",
  ticker: "SISTEMA EM MODO DE SEGURANÇA · AGUARDANDO IA",
  violencia_br: 70,
  previsoes: [
    { titulo: "ALERTA DE SISTEMA", manchete_real: "Erro na conexão com a IA", interpretacao: "Verifique o log.", impacto_anos: 1.0, categoria: "GEOPOLÍTICO", probabilidade: 50, gravidade: 5 }
  ],
};

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({...MOCK, veredicto: "ERRO: Chave API não encontrada no Vercel."});

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: "Gere um relatório do Relógio do Juízo Final 2026 em JSON puro (sem markdown) com as chaves: success (true), ajuste_segundos (int), veredicto (string), ticker (string), violencia_br (int), previsoes (array)." 
          }] 
        }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // ISSO VAI MOSTRAR O ERRO REAL NO SEU SITE
      const msgErro = data.error?.message || "Erro desconhecido no Google";
      return NextResponse.json({...MOCK, veredicto: `API ERROR: ${msgErro}`});
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    return NextResponse.json({...MOCK, veredicto: "ERRO CRÍTICO: Falha ao processar resposta."});
  }
}