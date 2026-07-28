import { prisma } from "@/lib/prisma";

export default async function AnnouncementBar() {
  const coupon = await prisma.coupon.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!coupon) return null;

  const message = coupon.isPercentage
    ? `✨ OFFRE SPÉCIALE : Profitez de -${coupon.discount}% avec le code ${coupon.code} ✨`
    : `✨ OFFRE SPÉCIALE : Profitez de -${coupon.discount} DA avec le code ${coupon.code} ✨`;

  return (
    <div className="bg-black text-white" dir="ltr">
      <p className="text-center text-xs sm:text-sm tracking-wide font-medium py-1.5 sm:py-2 px-4">
        {message}
      </p>
    </div>
  );
}
