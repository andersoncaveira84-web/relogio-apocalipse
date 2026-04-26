import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) return NextResponse.json({ veredicto: "ERRO: Chave não encontrada no Vercel." });

  // TENTATIVA 1: Modelo mais compatível de todos (Gemini Pro) na v1beta
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Gere um relatório JSON dramático para o Relógio do Juízo Final 2026. Retorne APENAS o JSON puro com: success(true), ajuste_segundos(int), veredicto(string), ticker(string), previsoes(array com 3 itens)." }] }]
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return NextResponse.json(JSON.parse(cleanJson));
    }
    
    // TENTATIVA 2: Se o primeiro falhar, tenta o modelo Flash na v1beta
    const response2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Gere um relatório JSON dramático para o Relógio do Juízo Final 2026." }] }]
      }),
    });

    const data2 = await response2.json();
    if (response2.ok) {
        const text2 = data2.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanJson2 = text2.replace(/```json|```/g, "").trim();
        return NextResponse.json(JSON.parse(cleanJson2));
    }

    return NextResponse.json({ veredicto: `ERRO GOOGLE: ${data2.error?.message || "Falha total"}` });

  } catch (error) {
    return NextResponse.json({ veredicto: "ERRO CRÍTICO no servidor." });
  }
}