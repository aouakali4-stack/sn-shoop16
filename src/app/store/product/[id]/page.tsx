import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, nameAr: true, description: true },
  });

  if (!product) return { title: "Produit non trouvé" };

  return {
    title: `${product.nameAr || product.name} | SN Shop16`,
    description: product.description?.slice(0, 160) || undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      category: {
        select: { id: true, name: true, nameAr: true, slug: true },
      },
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const serialized = {
    id: product.id,
    name: product.name,
    nameAr: product.nameAr,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    stock: product.stock,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    salesCount: product.salesCount,
    createdAt: product.createdAt.toISOString(),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          nameAr: product.category.nameAr,
          slug: product.category.slug,
        }
      : null,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      price: v.price,
    })),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return <ProductDetailClient product={serialized} />;
}
