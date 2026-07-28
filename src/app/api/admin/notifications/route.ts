import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("FETCH_NOTIFICATIONS_ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, link } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "title and message required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || "info",
        link: link || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("MARK_ALL_READ_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
