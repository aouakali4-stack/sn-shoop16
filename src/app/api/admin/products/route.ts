import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const products = await prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { nameAr: { contains: search } },
            ],
          }
        : undefined,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("FETCH_PRODUCTS_ERROR:", error);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("CREATE_PRODUCT_BODY:", JSON.stringify(body, null, 2));

    const {
      name,
      nameAr,
      description,
      price,
      comparePrice,
      categoryId,
      stock,
      isActive,
      isFeatured,
      images,
      variants,
    } = body;

    if (!nameAr || !price) {
      return NextResponse.json(
        { error: "اسم المنتج بالعربية والسعر مطلوبان" },
        { status: 400 }
      );
    }

    let slug = nameAr ? slugify(nameAr) : slugify(name || "product");
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name: name || nameAr,
        nameAr,
        slug,
        description: description || "",
        price: Number(price) || 0,
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock) || 0,
        categoryId: categoryId || undefined,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        images: {
          create: (images || []).map((img: any) => ({
            url: typeof img === "string" ? img : img.url || "",
            alt: typeof img === "string" ? nameAr : img.alt || nameAr,
            sortOrder: typeof img === "string" ? 0 : img.sortOrder || 0,
          })),
        },
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size || "",
            color: v.color || "",
            colorHex: v.colorHex || null,
            stock: Number(v.stock) || 0,
            price: v.price ? Number(v.price) : null,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE_PRODUCT_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
