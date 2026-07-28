import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.siteSetting.create({ data: { id: "global" } });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const settings = await prisma.siteSetting.upsert({
      where: { id: "global" },
      update: {
        siteName: body.siteName || "Sn Shop16",
        siteDescription: body.siteDescription || null,
        announcementText: body.announcementText || null,
        heroTitle: body.heroTitle || null,
        heroSubtitle: body.heroSubtitle || null,
        heroImageUrl: body.heroImageUrl || null,
        phone: body.phone || null,
        email: body.email || null,
        whatsappNumber: body.whatsappNumber || null,
        instagramUrl: body.instagramUrl || null,
        facebookUrl: body.facebookUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        metaPixelId: body.metaPixelId || null,
        tiktokPixelId: body.tiktokPixelId || null,
        maintenanceMode: body.maintenanceMode === "true" || body.maintenanceMode === true,
      },
      create: {
        id: "global",
        siteName: body.siteName || "Sn Shop16",
        siteDescription: body.siteDescription || null,
        announcementText: body.announcementText || null,
        heroTitle: body.heroTitle || null,
        heroSubtitle: body.heroSubtitle || null,
        heroImageUrl: body.heroImageUrl || null,
        phone: body.phone || null,
        email: body.email || null,
        whatsappNumber: body.whatsappNumber || null,
        instagramUrl: body.instagramUrl || null,
        facebookUrl: body.facebookUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        metaPixelId: body.metaPixelId || null,
        tiktokPixelId: body.tiktokPixelId || null,
        maintenanceMode: body.maintenanceMode === "true" || body.maintenanceMode === true,
      },
    });

    return NextResponse.json({ settings, message: "Settings saved" });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
