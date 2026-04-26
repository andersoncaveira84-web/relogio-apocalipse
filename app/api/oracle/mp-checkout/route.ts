// ═══════════════════════════════════════════════════════════
// app/api/oracle/route.ts  —  LÓGICA ORIGINAL PRESERVADA
// ═══════════════════════════════════════════════════════════
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const reportID = `PROT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      veredicto: "ERRO: Chave API não configurada no Vercel."
    });
  }

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


// ═══════════════════════════════════════════════════════════
// app/api/mp-checkout/route.ts  —  NOVA ROTA MERCADO PAGO
// Crie este arquivo em: app/api/mp-checkout/route.ts
// ═══════════════════════════════════════════════════════════
/*
  INSTALAÇÃO:
  npm install mercadopago

  VARIÁVEIS DE AMBIENTE (.env.local):
  MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx
  NEXT_PUBLIC_URL=https://seu-dominio.com.br

  COMO USAR:
  O frontend faz POST /api/mp-checkout com { productId, title, price }
  Esta rota cria a preferência no MP e retorna { init_point }
  O frontend redireciona para init_point

  WEBHOOKS (opcional):
  Configure no painel do MP: POST /api/mp-webhook
  Para confirmar pagamentos e liberar acesso aos ebooks
*/

// Descomente e use este código em app/api/mp-checkout/route.ts:
/*
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { productId, title, price } = await req.json();

    if (!productId || !title || !price) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: productId,
            title: title,
            unit_price: price / 100,   // MP usa reais, não centavos
            quantity: 1,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL}/obrigado`,
          failure: `${process.env.NEXT_PUBLIC_URL}/loja`,
          pending: `${process.env.NEXT_PUBLIC_URL}/loja`,
        },
        auto_return: "approved",
        statement_descriptor: "RELOGIO APOCALIPSE",
        // Para sandbox, use: https://sandbox.mercadopago.com.br
        // Para produção, init_point gerado automaticamente
      },
    });

    return NextResponse.json({
      init_point: preference.init_point,    // produção
      sandbox_init_point: preference.sandbox_init_point, // testes
    });

  } catch (error) {
    console.error("Erro MP:", error);
    return NextResponse.json({ error: "Falha ao criar checkout" }, { status: 500 });
  }
}
*/