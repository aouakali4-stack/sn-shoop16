import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ products: [], query: "" });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { nameAr: { contains: q } },
          { description: { contains: q } },
          { category: { name: { contains: q } } },
          { category: { nameAr: { contains: q } } },
        ],
      },
      include: {
        category: { select: { id: true, name: true, nameAr: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ products, query: q });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [], query: "", error: error.message }, { status: 500 });
  }
}
