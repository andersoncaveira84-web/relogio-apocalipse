import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  if (!apiKey) {
    return NextResponse.json({ 
      success: false,
      veredicto: "ERRO: Chave GEMINI_API_KEY não encontrada no Vercel." 
    });
  }

  const prompt = `Aja como o Oráculo do Relógio do Juízo Final 2026. 
  Retorne APENAS um JSON puro (sem markdown) com esta estrutura:
  {
    "success": true,
    "ajuste_segundos": 7,
    "veredicto": "Uma frase curta dramática",
    "ticker": "MANCHETES EM MAIÚSCULAS SEPARADAS POR ·",
    "previsoes": [
      { "titulo": "TÍTULO", "manchete_real": "notícia", "categoria": "NUCLEAR", "interpretacao": "análise" },
      { "titulo": "TÍTULO 2", "manchete_real": "notícia 2", "categoria": "IA", "interpretacao": "análise 2" },
      { "titulo": "TÍTULO 3", "manchete_real": "notícia 3", "categoria": "CLIMA", "interpretacao": "análise 3" }
    ]
  }`;

  try {
    // Usando v1beta que é mais flexível para o modelo 2.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        veredicto: "ERRO GOOGLE: " + (data.error?.message || "Falha na API") 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      veredicto: "ERRO DE PROCESSAMENTO: O Google enviou um formato inválido." 
    });
  }
}