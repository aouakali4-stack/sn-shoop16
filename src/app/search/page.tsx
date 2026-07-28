"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
}

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  category?: { name: string; slug: string } | null;
  images: { url: string }[];
  variants: { size: string; color: string; stock: number }[];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q]);

  const handleQuickAdd = (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;
    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.images[0]?.url || "/placeholder.png",
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    });
    openCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <h1
        className="text-2xl sm:text-3xl font-light text-gray-900 mb-2"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Résultats pour &laquo; {q} &raquo;
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {loading ? "Recherche..." : `${products.length} produit${products.length !== 1 ? "s" : ""} trouvé${products.length !== 1 ? "s" : ""}`}
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-4">Aucun produit ne correspond à votre recherche.</p>
          <Link
            href="/"
            className="inline-block bg-black text-white text-[10px] tracking-[0.2em] font-semibold px-6 py-2.5 hover:bg-gray-800 transition-colors"
          >
            RETOUR À LA BOUTIQUE
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const hasDiscount = product.comparePrice && product.comparePrice > product.price;
            return (
              <div key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE4] rounded-lg sm:rounded-xl mb-3">
                  <Link href={`/store/products/${product.slug}`}>
                    <img
                      src={product.images[0]?.url || "/placeholder.png"}
                      alt={product.nameAr || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5">
                      -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                    </span>
                  )}
                  {product.variants.length > 0 && (
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md"
                    >
                      <ShoppingBag size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {product.category && (
                    <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">
                      {product.category.name}
                    </p>
                  )}
                  <Link href={`/store/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
                      {product.nameAr || product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{formatPrice(product.price)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice!)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
