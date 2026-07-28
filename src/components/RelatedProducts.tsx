"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/types";
import { getProductImageUrl } from "@/lib/utils";

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string;
}

export default function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!categoryId) return;

    fetch("/api/store/products")
      .then((r) => r.json())
      .then((data) => {
        const all: Product[] = data.products || data || [];

        const sameCategory = all.filter(
          (p) => p.id !== currentProductId && p.categoryId === categoryId && p.isActive
        );

        const others = all.filter(
          (p) => p.id !== currentProductId && p.categoryId !== categoryId && p.isActive
        );

        const sortedSame = sameCategory.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const sortedOthers = others.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const result = [...sortedSame, ...sortedOthers].slice(0, 4);
        setProducts(result);
      })
      .catch(() => {});
  }, [currentProductId, categoryId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h2
        className="text-2xl font-light text-gray-900 mb-6"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Vous aimerez aussi
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.filter((rp) => rp.slug).map((rp) => {
          const rpPrice = typeof rp.price === "number" ? rp.price : 0;
          const rpImage = getProductImageUrl(rp.images);
          return (
            <Link
              key={rp.id}
              href={`/store/products/${rp.slug}`}
              className="group block"
            >
              <div className="aspect-[3/4] overflow-hidden bg-[#EFEAE4] rounded-lg mb-3">
                <img
                  src={rpImage}
                  alt={rp.nameAr || rp.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-800 group-hover:text-black transition-colors line-clamp-1">
                {rp.nameAr || rp.name}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {rpPrice.toLocaleString("ar-DZ")} DA
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
