import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const MOCK = {
  ajuste_segundos: 5,
  veredicto: "O Oráculo está em modo de segurança. A convergência de riscos globais permanece alta.",
  ticker: "SISTEMA EM MODO DE SEGURANÇA · AGUARDANDO CONEXÃO ESTÁVEL",
  violencia_br: 70,
  previsoes: [
    { titulo: "ALERTA DE SISTEMA", manchete_real: "Erro na conexão com a IA", interpretacao: "O Oráculo não conseguiu acessar os dados em tempo real.", impacto_anos: 1.0, categoria: "GEOPOLÍTICO", probabilidade: 50, gravidade: 5 }
  ],
};

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json(MOCK);

  const prompt = `Aja como o Oráculo do Relógio do Juízo Final. Analise o mundo em 2026. 
  Retorne APENAS um JSON puro (sem markdown) neste formato:
  {
    "success": true,
    "ajuste_segundos": 7,
    "veredicto": "frase curta dramática",
    "ticker": "MANCHETES SEPARADAS POR ·",
    "violencia_br": 75,
    "previsoes": [
      { "titulo": "TÍTULO", "manchete_real": "notícia", "interpretacao": "análise", "impacto_anos": 2.1, "categoria": "NUCLEAR", "probabilidade": 80, "gravidade": 8 }
    ]
  }`;

  try {
    // Usando o modelo 1.5-flash que é o mais compatível com contas gratuitas
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Removi o generationConfig temporariamente para evitar o erro 400 de formato
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro detalhado do Google:", JSON.stringify(data));
      return NextResponse.json(MOCK);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Limpa possíveis marcações de markdown que a IA possa ter colocado
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    console.error("Erro no Oráculo:", error);
    return NextResponse.json(MOCK);
  }
}