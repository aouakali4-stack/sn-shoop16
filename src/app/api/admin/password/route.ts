import { prisma } from "@/lib/prisma";
import { getAdminFromCookie, verifyPassword, hashPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAdminFromCookie();
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "كلمة المرور الحالية والجديدة مطلوبتان" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) {
      return NextResponse.json({ error: "المدير غير موجود" }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
