import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    let imageBuffer: Buffer;
    let mimeType = "image/jpeg";

    if (imageUrl.startsWith("data:")) {
      const parts = imageUrl.split(",");
      mimeType = parts[0].split(";")[0].split(":")[1] || "image/jpeg";
      imageBuffer = Buffer.from(parts[1], "base64");
    } else if (imageUrl.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Image file not found on server" }, { status: 404 });
      }
      imageBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    } else {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = response.headers.get("content-type") || "image/jpeg";
    }

    const prompt = `أنت مساعد متجر ملابس نسائية فاخر في الجزائر. قم بتحليل الصورة وإخراج البيانات بصيغة JSON حصراً بدون أي كود إضافي:
{
  "title": "اسم المنتج بالعربية",
  "titleFr": "Nom du produit en français",
  "description": "وصف تسويقي راقي باللغة الفرنسية",
  "category": "Fasatin",
  "colors": ["أسود"],
  "suggestedPrice": 8500
}
الفئات: Fasatin (فساتين), Abayat (عبايات), Casual (ملابس كاجوال), Accessories (إكسسوارات)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result: parsedData });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "فشل تحليل الصورة بالذكاء الاصطناعي" },
      { status: 500 }
    );
  }
}
