import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAdminFromCookie();

    if (!payload) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, name: true, createdAt: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "المدير غير موجود" },
        { status: 401 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
