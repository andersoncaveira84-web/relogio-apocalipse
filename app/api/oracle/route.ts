import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK = {
  ajuste_segundos: 5,
  veredicto: "Modo de Segurança Ativado.",
  ticker: "SISTEMA AGUARDANDO IA · VERIFIQUE A CHAVE",
  previsoes: [{ titulo: "ERRO", manchete_real: "IA não respondeu corretamente.", categoria: "NUCLEAR", impacto_anos: 0 }]
};

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ veredicto: "ERRO: GEMINI_API_KEY não configurada no Vercel." });

  try {
    // MUDANÇA AQUI: Removi o "-latest" que estava causando o erro 404
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Gere um relatório JSON para o Relógio do Juízo Final 2026. Retorne APENAS o JSON puro com: success(true), ajuste_segundos(int), veredicto(string), ticker(string), previsoes(array com 3 itens)." }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Se der erro, vamos mostrar a mensagem exata do Google na tela
      const googleError = data.error?.message || "Erro desconhecido";
      return NextResponse.json({ veredicto: `ERRO DO GOOGLE: ${googleError}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    return NextResponse.json({ veredicto: "ERRO NO SERVIDOR: Verifique o formato do JSON." });
  }
}