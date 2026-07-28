import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured") || "";
    const search = searchParams.get("search") || "";

    let products: any[] = [];

    try {
      if (category) {
        const cat = await prisma.category.findFirst({ where: { slug: category } });
        if (cat) {
          products = await prisma.product.findMany({
            where: {
              isActive: true,
              categoryId: cat.id,
              ...(featured === "true" ? { isFeatured: true } : {}),
              ...(search ? {
                OR: [
                  { name: { contains: search } },
                  { nameAr: { contains: search } },
                ],
              } : {}),
            },
            include: {
              category: true,
              images: { orderBy: { sortOrder: "asc" } },
              variants: true,
            },
            orderBy: { createdAt: "desc" },
          });
        }
      } else {
        products = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(featured === "true" ? { isFeatured: true } : {}),
            ...(search ? {
              OR: [
                { name: { contains: search } },
                { nameAr: { contains: search } },
              ],
            } : {}),
          },
          include: {
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            variants: true,
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } catch (dbError) {
      console.error("FAILED_TO_FETCH_PRODUCTS:", dbError);
      products = [];
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("STORE_PRODUCTS_ERROR:", error);
    return NextResponse.json({ products: [] });
  }
}
