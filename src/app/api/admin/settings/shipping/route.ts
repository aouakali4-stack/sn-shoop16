import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    console.log("[Shipping API] Admin auth:", admin ? "OK" : "FAILED");
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const rates = await prisma.shippingRate.findMany({
      orderBy: { wilayaCode: "asc" },
    });
    console.log("[Shipping API] Rates found:", rates.length);

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("[Shipping API] GET error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const rates = body.rates;

    if (!Array.isArray(rates)) {
      return NextResponse.json(
        { error: "البيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      rates.map((rate: { wilayaCode: string; wilayaName: string; homePrice: number; officePrice: number }) =>
        prisma.shippingRate.upsert({
          where: { wilayaCode: rate.wilayaCode },
          update: {
            wilayaName: rate.wilayaName,
            homePrice: rate.homePrice,
            officePrice: rate.officePrice,
          },
          create: {
            wilayaCode: rate.wilayaCode,
            wilayaName: rate.wilayaName,
            homePrice: rate.homePrice,
            officePrice: rate.officePrice,
          },
        })
      )
    );

    return NextResponse.json({ rates: results });
  } catch (error) {
    console.error("Shipping PUT error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
