import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  // 1. Gera o ID único do Protocolo
  const reportID = `PROT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      veredicto: "ERRO: Chave API não configurada no Vercel." 
    });
  }

  // 2. Define o prompt com a estrutura exata que o site espera
  const prompt = `Aja como o Oráculo do Relógio do Juízo Final 2026. 
  Analise ameaças reais de 2025/2026.
  Retorne APENAS um JSON puro (sem markdown) com esta estrutura exata:
  {
    "success": true,
    "report_id": "${reportID}",
    "ajuste_segundos": 7,
    "veredicto": "Uma frase curta e dramática",
    "ticker": "MANCHETES EM MAIÚSCULAS SEPARADAS POR ·",
    "previsoes": [
      { "titulo": "TÍTULO 1", "manchete_real": "notícia 1", "categoria": "NUCLEAR", "interpretacao": "análise 1" },
      { "titulo": "TÍTULO 2", "manchete_real": "notícia 2", "categoria": "IA", "interpretacao": "análise 2" },
      { "titulo": "TÍTULO 3", "manchete_real": "notícia 3", "categoria": "CLIMA", "interpretacao": "análise 3" }
    ]
  }
  Use as categorias: NUCLEAR, CLIMA, IA, BIOLÓGICO ou GEOPOLÍTICO.`;

  try {
    // 3. Faz a chamada para o modelo gemini-2.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.8
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        veredicto: "ERRO GOOGLE: " + (data.error?.message || "Falha na conexão") 
      });
    }

    // 4. Extrai o texto e converte em JSON para o site
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Erro no processamento:", error);
    return NextResponse.json({ 
      success: false, 
      veredicto: "ERRO DE PROCESSAMENTO: O Oráculo enviou um formato inválido." 
    });
  }
}