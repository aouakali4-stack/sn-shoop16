import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
