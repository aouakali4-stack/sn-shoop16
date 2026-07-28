import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let categories: any[] = [];

  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("FAILED_TO_FETCH_CATEGORIES:", error);
    categories = [];
  }

  return NextResponse.json({ categories });
}
