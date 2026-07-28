import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج غير مفقود" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (error: any) {
    console.error("خطأ أثناء حذف المنتج:", error);
    return NextResponse.json({ error: "فشل حذف المنتج بسبب ارتباطه ببيانات أخرى أو خطأ في الخادم" }, { status: 500 });
  }
}
