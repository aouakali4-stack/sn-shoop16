import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ coupons: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discount, isPercentage } = body;

    if (!code || !discount) {
      return NextResponse.json({ error: "الكود وقيمة الخصم مطلوبان" }, { status: 400 });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "هذا الكود موجود مسبقاً" }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: Number(discount),
        isPercentage: Boolean(isPercentage),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "فشل إنشاء الكوبون" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الكوبون مطلوب" }, { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "فشل حذف الكوبون" }, { status: 500 });
  }
}
