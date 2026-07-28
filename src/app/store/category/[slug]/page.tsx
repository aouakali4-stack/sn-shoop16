"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { getProductImageUrl } from "@/lib/utils";

interface ProductImage {
  url: string;
  alt?: string | null;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
  price?: number | null;
}

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: { name: string; nameAr: string; slug: string };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [selectedSize, setSelectedSize] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const uniqueSizes = Array.isArray(product?.variants)
    ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
    : [];
  const firstImage = getProductImageUrl(product?.images);

  const handleAddToCart = () => {
    const size = selectedSize || uniqueSizes[0] || "M";
    const variant = (Array.isArray(product?.variants) ? product.variants : []).find(
      (v) => v.size === size
    ) || product?.variants?.[0];
    if (!variant) return;

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: firstImage,
      size,
      color: variant.color,
      colorHex: undefined,
      stock: variant.stock,
    });
    openCart();
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-[#EFEAE4] overflow-hidden mb-3">
        <img
          src={firstImage}
          alt={product.nameAr || product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
          <Heart size={15} strokeWidth={1.5} className="text-gray-600" />
        </button>
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 left-3 right-3 bg-black text-white text-xs tracking-[0.15em] font-medium py-2.5 flex items-center justify-center gap-2 transition-all duration-300
            ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          <ShoppingBag size={14} strokeWidth={1.5} />
          AJOUTER AU PANIER
        </button>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-wider font-semibold px-2.5 py-1">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white/90 px-4 py-1.5 text-sm font-bold text-gray-700">
              ÉPUISÉ
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] tracking-[0.15em] text-gray-400 uppercase">
          {product.category?.nameAr || product.category?.name || ""}
        </p>
        <Link href={`/store/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-1">
            {product.nameAr || product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        {uniqueSizes.length > 0 && (
          <div className="flex items-center gap-1 pt-1">
            {uniqueSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-7 h-7 text-[10px] font-medium border transition-colors
                  ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<{ id: string; name: string; nameAr: string; slug: string; description?: string | null } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const fetchData = useCallback(async (s: string) => {
    if (!s) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/store/products?category=${s}`);
      const data = await res.json();
      const prods = (data.products || []).filter((p: any) => p.slug);
      setProducts(prods);
      if (prods.length > 0 && prods[0].category) {
        setCategory(prods[0].category);
      } else {
        setCategory({ id: "", name: s, nameAr: s, slug: s, description: null });
      }
    } catch {
      setCategory({ id: "", name: s, nameAr: s, slug: s, description: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) fetchData(slug);
  }, [slug, fetchData]);

  const slugLabels: Record<string, string> = {
    nouveautes: "Nouveautés",
    fasatin: "Robes",
    vetements: "Vêtements",
    casual: "Hauts",
    accessories: "Accessoires",
    chaussures: "Chaussures",
    promotions: "Promotions",
    abayat: "Abayas",
    ensembles: "Ensembles",
  };

  const displayCategoryName = category?.nameAr || category?.name || slugLabels[slug] || slug;

  return (
    <>
      {/* Category Header */}
      <section className="bg-[#EFEAE4] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-3">
            SN SHOP
          </p>
          <h1
            className="text-4xl md:text-5xl font-light text-black mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            {displayCategoryName}
          </h1>
          {category?.description && (
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p
                className="text-2xl text-gray-300 mb-2"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Aucun produit
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Pas encore de produits dans cette catégorie.
              </p>
              <Link
                href="/"
                className="inline-block bg-black text-white text-xs tracking-[0.2em] font-semibold px-8 py-3 hover:bg-gray-800 transition-colors"
              >
                RETOUR À LA BOUTIQUE
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
