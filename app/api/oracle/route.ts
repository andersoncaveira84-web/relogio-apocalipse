import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ veredicto: "ERRO: Chave não encontrada no Vercel." });

  try {
    // Usando o modelo mais básico e estável
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Responda apenas: 'IA CONECTADA'. O resto ignore." }] }]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Isso vai mostrar no seu site o erro exato que o Google está enviando
      const errorMsg = data.error?.message || "Erro desconhecido";
      const errorCode = data.error?.status || response.status;
      return NextResponse.json({ 
        veredicto: `ERRO DO GOOGLE (${errorCode}): ${errorMsg}`,
        previsoes: [{ titulo: "ERRO DE API", manchete_real: errorMsg, categoria: "NUCLEAR", impacto_anos: 0 }] 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "IA respondeu vazio";
    
    return NextResponse.json({ 
      veredicto: `SUCESSO: ${text}`,
      previsoes: [{ titulo: "CONEXÃO ATIVA", manchete_real: "O Oráculo está online!", categoria: "IA", impacto_anos: 0 }] 
    });

  } catch (error) {
    return NextResponse.json({ veredicto: "ERRO DE CÓDIGO: Falha ao processar o fetch." });
  }
}