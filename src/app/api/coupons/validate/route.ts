import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, orderTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "كود غير صالح" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "هذا الكوبون معطّل" }, { status: 400 });
    }

    const discount = coupon.isPercentage
      ? (Number(orderTotal) * coupon.discount) / 100
      : coupon.discount;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        isPercentage: coupon.isPercentage,
        discountAmount: Math.round(discount),
      },
    });
  } catch (error: any) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ error: "خطأ في التحقق" }, { status: 500 });
  }
}
