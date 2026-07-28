import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, phone, subject, message } = body;

    if (!customerName || !phone || !message) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const newComplaint = await prisma.complaint.create({
      data: { customerName, phone, subject: subject || "", message },
    });

    return NextResponse.json({ success: true, complaint: newComplaint }, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال الشكوى" }, { status: 500 });
  }
}
