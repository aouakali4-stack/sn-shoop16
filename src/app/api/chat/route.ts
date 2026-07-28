import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ reply: "كيف يمكنني مساعدتك اليوم؟" });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: "تنبيه: لم يتم العثور على GROQ_API_KEY في ملف .env",
      });
    }

    let productCatalog = "";
    try {
      const products = await prisma.product.findMany({
        take: 10,
        select: { name: true, price: true },
      });
      if (products && products.length > 0) {
        productCatalog = products.map((p) => `- ${p.name}: ${p.price} د.ج`).join("\n");
      }
    } catch (e) {
      console.log("DB Fetch Skipped");
    }

    const systemPrompt = `أنت المساعد الذكي الخاص بمتجر "Sn Shop16" للملابس النسائية والعبايات في الجزائر.
أجب عن سؤال الزبون بذكاء وبنفس لغته (عربية/فرنسية/دارجة).
التوصيل متوفر لـ 58 ولاية والدفع عند الاستلام (COD).
المنتجات المتوفرة:
${productCatalog || "فساتين وعبايات وأطقم نسائية فاخرة"}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq Error Detail:", data);
      return NextResponse.json({
        reply: `خطأ Groq API: ${data.error?.message || "تحقق من المفتاح"}`,
      });
    }

    const aiReply = data.choices?.[0]?.message?.content?.trim();

    try {
      await prisma.message.create({
        data: {
          userMessage: message,
          botReply: aiReply || "بدون رد",
        },
      });
    } catch (dbErr) {
      console.error("لم يتم حفظ الرسالة:", dbErr);
    }

    return NextResponse.json({
      reply: aiReply || "أهلاً بك في Sn Shop16! كيف يمكنني مساعدتك؟",
    });
  } catch (error: any) {
    console.error("Catch Error:", error);
    return NextResponse.json({
      reply: `خطأ اتصال: ${error.message}`,
    });
  }
}
