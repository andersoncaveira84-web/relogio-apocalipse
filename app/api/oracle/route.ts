import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ success: false });

  // Prompt ultra-específico para não haver erro de nomes
  const prompt = `Aja como o Oráculo do Juízo Final 2026. Retorne APENAS um JSON puro (sem markdown) com esta estrutura exata:
  {
    "success": true,
    "ajuste_segundos": 7,
    "veredicto": "Uma frase curta e apocalíptica",
    "ticker": "MANCHETES EM MAIÚSCULO SEPARADAS POR ·",
    "previsoes": [
      {
        "titulo": "TÍTULO CURTO",
        "manchete_real": "Manchete dramática de 2026",
        "categoria": "NUCLEAR",
        "interpretacao": "Análise de uma frase sobre o impacto"
      },
      {
        "titulo": "TÍTULO 2",
        "manchete_real": "Manchete 2",
        "categoria": "IA",
        "interpretacao": "Análise 2"
      },
      {
        "titulo": "TÍTULO 3",
        "manchete_real": "Manchete 3",
        "categoria": "CLIMA",
        "interpretacao": "Análise 3"
      }
    ]
  }
  Use as categorias: NUCLEAR, CLIMA, IA, BIOLÓGICO ou GEOPOLÍTICO.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}