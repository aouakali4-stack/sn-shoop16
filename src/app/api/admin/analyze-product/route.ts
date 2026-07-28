import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VISION_MODELS = ["llama-3.2-90b-vision-preview", "llama-3.2-11b-vision"];

async function callGroqVision(
  apiKey: string,
  model: string,
  prompt: string,
  imageBase64: string,
  mimeType: string
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Model ${model} failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image base64 is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    try {
      const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        console.log("Available Groq Models:", modelsData.data?.map((m: any) => m.id));
      }
    } catch (e) {
      console.warn("Could not fetch Groq models list:", e);
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true },
    });
    const categoryNames = categories.map((c) => c.name).join(", ") || "Vêtements, Robes, Accessoires";

    const prompt = `Tu es un expert en mode féminine algérienne. Analyse cette image de vêtement/accessoire et renvoie UNIQUEMENT un objet JSON valide (pas de texte avant ou après, pas de markdown).

Le JSON doit contenir exactement ces clés :
{
  "title": "Nom accrocheur du produit en arabe (max 50 caractères)",
  "titleFr": "Nom du produit en français (max 50 caractères)",
  "description": "Description marketing courte et attractive en français (1-2 phrases)",
  "color": "Couleur principale du produit en arabe",
  "suggestedCategory": "Une seule catégorie parmi : ${categoryNames}"
}

Exigences :
- Le titre doit être élégant et vendeur
- La description doit mettre en avant le style, la matière et l'occasion
- La couleur doit être simple et précise (ex: أسود, أبيض, أزرق, بيج, وردي)
- La catégorie doit être exactement l'une des options disponibles
- Ne retourne QUE le JSON, rien d'autre`;

    let text = "";
    let lastError = "";

    for (const model of VISION_MODELS) {
      try {
        text = await callGroqVision(apiKey, model, prompt, imageBase64, mimeType);
        if (text) break;
      } catch (err: any) {
        lastError = err.message;
        console.warn(`Vision model ${model} failed:`, err.message);
        continue;
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: `All vision models failed. Last error: ${lastError}` },
        { status: 502 }
      );
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI response was not valid JSON", raw: text },
        { status: 422 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result: parsed });
  } catch (error: any) {
    console.error("Analyze Product Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error during analysis" },
      { status: 500 }
    );
  }
}
