import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { name: "NOUVEAUTÉS", nameAr: "جديد", sortOrder: 0 },
  { name: "VÊTEMENTS", nameAr: "ملابس", sortOrder: 1 },
  { name: "ROBES", nameAr: "فساتين", sortOrder: 2 },
  { name: "ENSEMBLES", nameAr: "أطقم", sortOrder: 3 },
  { name: "ACCESSOIRES", nameAr: "إكسسوارات", sortOrder: 4 },
  { name: "CHAUSSURES", nameAr: "أحذية", sortOrder: 5 },
  { name: "PROMOTIONS", nameAr: "تخفيضات", sortOrder: 6 },
];

export async function GET() {
  try {
    const results = [];

    for (const cat of CATEGORIES) {
      const slug = cat.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existing = await prisma.category.findFirst({
        where: { slug },
      });

      if (existing) {
        const updated = await prisma.category.update({
          where: { id: existing.id },
          data: { name: cat.name, nameAr: cat.nameAr, sortOrder: cat.sortOrder, isActive: true },
        });
        results.push({ action: "updated", name: cat.name, id: updated.id });
      } else {
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            nameAr: cat.nameAr,
            slug,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        results.push({ action: "created", name: cat.name, id: created.id });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} catégories synchronisées avec succès!`,
      results,
    });
  } catch (error: any) {
    console.error("Categories seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
