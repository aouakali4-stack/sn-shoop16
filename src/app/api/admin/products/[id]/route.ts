import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    let slug = existing.slug;
    if (nameAr && nameAr !== existing.nameAr) {
      slug = slugify(nameAr);
      const slugConflict = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          name: name || nameAr,
          nameAr,
          slug,
          description: description || "",
          price: Number(price) || 0,
          comparePrice: comparePrice ? Number(comparePrice) : null,
          stock: Number(stock) || 0,
          categoryId: categoryId || null,
          isActive: Boolean(isActive),
          isFeatured: Boolean(isFeatured),
          images: images
            ? {
                create: images.map((img: any) => ({
                  url: typeof img === "string" ? img : img.url || "",
                  alt: typeof img === "string" ? nameAr : img.alt || nameAr,
                  sortOrder: typeof img === "string" ? 0 : img.sortOrder || 0,
                })),
              }
            : undefined,
          variants: variants
            ? {
                create: variants.map((v: any) => ({
                  size: v.size || "",
                  color: v.color || "",
                  colorHex: v.colorHex || null,
                  stock: Number(v.stock) || 0,
                  price: v.price ? Number(v.price) : null,
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      });
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
