import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ coupon });
  } catch {
    return Response.json({ coupon: null });
  }
}
