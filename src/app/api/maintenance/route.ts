import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "global" },
      select: { maintenanceMode: true },
    });

    return NextResponse.json({ maintenance_mode: settings?.maintenanceMode ?? false });
  } catch (error: any) {
    console.error("Maintenance GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { maintenance_mode } = await request.json();

    await prisma.siteSetting.upsert({
      where: { id: "global" },
      update: { maintenanceMode: Boolean(maintenance_mode) },
      create: { id: "global", maintenanceMode: Boolean(maintenance_mode) },
    });

    return NextResponse.json({ success: true, maintenance_mode: Boolean(maintenance_mode) });
  } catch (error: any) {
    console.error("Maintenance POST error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
