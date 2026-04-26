import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK = {
  ajuste_segundos: 5,
  veredicto: "Erro na API do Google.",
  ticker: "SISTEMA EM MODO DE SEGURANÇA · VERIFIQUE OS LOGS",
  previsoes: [{ titulo: "ERRO DE CONEXÃO", manchete_real: "IA não respondeu.", categoria: "NUCLEAR", impacto_anos: 0 }]
};

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ veredicto: "ERRO: Chave não encontrada no Vercel." });

  try {
    // MUDANÇA: Usando a versão "v1" (estável) em vez de "v1beta"
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Gere um relatório JSON para o Relógio do Juízo Final 2026. Retorne APENAS o JSON puro com: success(true), ajuste_segundos(int), veredicto(string), ticker(string), previsoes(array com 3 itens). Seja dramático e use fatos de 2025/2026." }] }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Isso vai nos mostrar o novo erro se ele persistir
      const errorMsg = data.error?.message || "Erro desconhecido";
      return NextResponse.json({ veredicto: `ERRO GOOGLE: ${errorMsg}` });
    }

    // No v1, a resposta vem neste caminho:
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    return NextResponse.json({ veredicto: "ERRO NO SERVIDOR: Falha ao processar dados." });
  }
}