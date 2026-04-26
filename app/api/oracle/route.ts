import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK = {
  ajuste_segundos: 5,
  veredicto: "O Oráculo está em modo de segurança.",
  ticker: "SISTEMA EM MODO DE SEGURANÇA · AGUARDANDO IA",
  previsoes: [{ titulo: "ALERTA", manchete_real: "IA não respondeu.", categoria: "NUCLEAR", impacto_anos: 0 }]
};

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) return NextResponse.json({ veredicto: "ERRO: Chave não encontrada no Vercel." });

  try {
    // USANDO O MODELO QUE O SEU TESTE ENCONTROU: gemini-2.5-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: "Gere um relatório JSON dramático para o Relógio do Juízo Final 2026. Retorne APENAS o JSON puro (sem markdown) com: success(true), ajuste_segundos(int), veredicto(string), ticker(string), previsoes(array com 3 itens)." 
          }] 
        }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Erro desconhecido";
      return NextResponse.json({ veredicto: `ERRO GOOGLE: ${errorMsg}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Limpa possíveis marcações de markdown e converte para objeto
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    return NextResponse.json({ veredicto: "ERRO NO SERVIDOR: Verifique o formato do JSON." });
  }
}