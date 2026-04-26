import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  // Se não tiver chave, avisa na tela
  if (!apiKey) {
    return NextResponse.json({ 
      veredicto: "ERRO: GEMINI_API_KEY não configurada no Vercel.",
      previsoes: [] 
    });
  }

  const prompt = `Aja como o Oráculo do Relógio do Juízo Final 2026. 
  Analise ameaças reais de 2025 e 2026.
  Retorne APENAS um JSON puro, sem markdown, com estas chaves exatas:
  "success" (true), "ajuste_segundos" (número), "veredicto" (texto curto), "ticker" (texto longo em maiúsculas), "previsoes" (array com 3 itens contendo: titulo, manchete_real, categoria, interpretacao).
  Categorias permitidas: NUCLEAR, CLIMA, IA, BIOLÓGICO, GEOPOLÍTICO.`;

  try {
    // Usando o modelo 2.5-flash que seu teste confirmou existir
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.7 
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ veredicto: "ERRO GOOGLE: " + (data.error?.message || "Falha") });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Erro na Rota:", error);
    return NextResponse.json({ veredicto: "ERRO DE PROCESSAMENTO: Verifique o formato do JSON." });
  }
}