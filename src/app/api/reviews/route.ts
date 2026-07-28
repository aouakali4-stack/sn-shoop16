import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId مطلوب" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
  } catch (error) {
    return NextResponse.json({ reviews: [], avgRating: 0, count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userName, rating, comment } = body;

    if (!productId || !userName || !rating) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userName,
        rating: Number(rating),
        comment: comment || "",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "فشل إضافة التقييم" }, { status: 500 });
  }
}
