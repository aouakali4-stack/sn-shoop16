import { prisma } from "@/lib/prisma";
import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/layout/StoreFooter";
import ChatWidget from "@/components/ChatWidget";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.siteSetting.findUnique({
      where: { id: "global" },
      select: { siteName: true },
    }),
  ]);

  const navLinks = [
    { href: "/", label: "ACCUEIL" },
    ...categories.map((cat) => ({
      href: `/store/category/${cat.slug}`,
      label: cat.name.toUpperCase(),
    })),
    { href: "/contact", label: "CONTACT" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader navLinks={navLinks} siteName={settings?.siteName || "SN SHOP"} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <ChatWidget />
    </div>
  );
}
