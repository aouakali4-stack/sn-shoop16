import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = await getAdminFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, name: true, createdAt: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "المدير غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAdminFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { name, username } = body;

    if (!name || !username) {
      return NextResponse.json({ error: "الاسم واسم المستخدم مطلوبان" }, { status: 400 });
    }

    if (username !== payload.username) {
      const existing = await prisma.admin.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: "اسم المستخدم موجود بالفعل" }, { status: 400 });
      }
    }

    const admin = await prisma.admin.update({
      where: { id: payload.id },
      data: { name, username },
      select: { id: true, username: true, name: true },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
