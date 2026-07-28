import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  let settings = null;

  try {
    settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: "global" } });
    }
  } catch (error) {
    console.error("FAILED_TO_FETCH_SETTINGS:", error);
    settings = null;
  }

  return NextResponse.json({ settings });
}
