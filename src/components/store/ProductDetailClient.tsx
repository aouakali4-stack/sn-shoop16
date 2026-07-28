"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import RelatedProducts from "@/components/RelatedProducts";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
  price?: number | null;
}

interface ProductCategory {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SerializedProduct {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  salesCount: number;
  createdAt: string;
  category?: ProductCategory | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
}

export default function ProductDetailClient({ product }: { product: SerializedProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews || []);

  const validImages = (product.images || []).filter(
    (img) => img?.url && typeof img.url === "string" && img.url.startsWith("http")
  );

  const variants = product.variants || [];

  const uniqueSizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  const uniqueColorsMap = new Map<string, { name: string; hex?: string }>();
  variants.forEach((v) => {
    if (v.color && !uniqueColorsMap.has(v.color)) {
      uniqueColorsMap.set(v.color, { name: v.color, hex: v.colorHex || undefined });
    }
  });
  const uniqueColors = [...uniqueColorsMap.values()];

  const availableColorsForSize = selectedSize
    ? [...new Map(
        variants
          .filter((v) => v.size === selectedSize)
          .map((v) => [v.color, { name: v.color, hex: v.colorHex }])
      ).values()]
    : uniqueColors;

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const price = product.price;
  const rawCompare = product.comparePrice ?? 0;
  const hasDiscount = rawCompare > price;
  const discountPct = hasDiscount ? Math.round(((rawCompare - price) / rawCompare) * 100) : 0;

  const hasVariants = uniqueSizes.length > 0 || uniqueColors.length > 0;
  const canAddToCart = hasVariants ? !!selectedSize && !!selectedColor && availableStock > 0 : availableStock > 0;

  const avgRating = localReviews.length > 0
    ? localReviews.reduce((sum, r) => sum + r.rating, 0) / localReviews.length
    : 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price,
      image: validImages[0]?.url || "/placeholder.svg",
      size: selectedSize || "ONE_SIZE",
      color: selectedColor || "default",
      colorHex: selectedVariant?.colorHex || undefined,
      quantity,
      stock: availableStock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    openCart();
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewName("");
        setReviewRating(5);
        setReviewComment("");
        const data = await fetch(`/api/reviews?productId=${product.id}`).then((r) => r.json());
        setLocalReviews(data.reviews || []);
      }
    } catch {}
    setReviewSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-400 overflow-x-auto">
        <Link href="/" className="hover:text-black transition-colors whitespace-nowrap">Accueil</Link>
        <ChevronLeft className="w-3 h-3 flex-shrink-0" />
        {product.category && (
          <>
            <Link
              href={`/store/category/${product.category.slug}`}
              className="hover:text-black transition-colors whitespace-nowrap"
            >
              {product.category.name}
            </Link>
            <ChevronLeft className="w-3 h-3 flex-shrink-0" />
          </>
        )}
        <span className="text-gray-600 font-medium truncate">{product.nameAr || product.name}</span>
      </nav>

      <div className="grid gap-6 lg:gap-10 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#EFEAE4] group">
            {validImages.length > 0 ? (
              <>
                <img
                  src={validImages[activeImage]?.url || validImages[0].url}
                  alt={validImages[activeImage]?.alt || product.nameAr || product.name}
                  className="h-full w-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </>
            ) : (
              <div className="flex flex-col h-full items-center justify-center bg-[#EFEAE4]">
                <span
                  className="text-5xl sm:text-6xl font-light text-black/10"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  SN
                </span>
                <p className="text-gray-300 text-xs mt-1">Pas d&apos;image</p>
              </div>
            )}

            {hasDiscount && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 tracking-wide z-10">
                -{discountPct}%
              </div>
            )}

            {validImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + validImages.length) % validImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95 z-10"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % validImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95 z-10"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {validImages.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {validImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl border-2 transition-all ${
                    activeImage === idx
                      ? "border-black"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={img.alt || ""} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div>
            {product.category && (
              <span className="inline-block text-[10px] tracking-[0.15em] text-gray-400 uppercase mb-2 sm:mb-3">
                {product.category.name}
              </span>
            )}
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-900"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              {product.nameAr || product.name}
            </h1>
          </div>

          {/* Rating */}
          {localReviews.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">({localReviews.length})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-3 sm:mt-4 flex items-baseline gap-2 sm:gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-light text-black">
              {formatPrice(price)}
            </span>
            {hasDiscount && (
              <span className="text-base sm:text-lg text-gray-400 line-through">
                {formatPrice(rawCompare)}
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="mt-2">
              <span className="text-[10px] sm:text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 sm:px-3 sm:py-1">
                Économisez {(rawCompare - price).toLocaleString("fr-DZ")} DA ({discountPct}%)
              </span>
            </div>
          )}

          {/* Size Selector */}
          <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
            {uniqueSizes.length > 0 && (
              <div>
                <label className="mb-2.5 block text-[10px] sm:text-xs tracking-[0.1em] font-semibold text-gray-700 uppercase">
                  Taille
                  {selectedSize && (
                    <span className="ml-2 text-black font-normal normal-case">({selectedSize})</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    const hasStockForSize = variants.some((v) => v.size === size && v.stock > 0);
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSelectedColor("");
                        }}
                        disabled={!hasStockForSize}
                        className={`relative h-10 sm:h-12 min-w-[40px] sm:min-w-[48px] px-4 sm:px-5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? "bg-black text-white"
                            : hasStockForSize
                            ? "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                            : "border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {uniqueColors.length > 0 && (
              <div>
                <label className="mb-2.5 block text-[10px] sm:text-xs tracking-[0.1em] font-semibold text-gray-700 uppercase">
                  Couleur
                  {selectedColor && (
                    <span className="ml-2 text-black font-normal normal-case">({selectedColor})</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColorsForSize.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`group/swatch flex flex-col items-center gap-1 transition-all duration-200 ${
                          isSelected ? "scale-110" : "hover:scale-105"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-black ring-2 ring-gray-200"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color.hex || "#ccc" }}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[10px] font-medium transition-colors ${
                            isSelected ? "text-black" : "text-gray-400 group-hover/swatch:text-gray-600"
                          }`}
                        >
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Status */}
            {hasVariants && selectedSize && selectedColor && (
              <div className="border border-gray-100 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50">
                {availableStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                      En stock <span className="text-gray-400">({availableStock})</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <p className="text-xs sm:text-sm text-red-500 font-medium">Épuisé</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mt-5 sm:mt-7 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center overflow-hidden border border-gray-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center text-sm sm:text-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex h-10 w-12 sm:h-12 sm:w-14 items-center justify-center border-x border-gray-200 text-sm sm:text-base font-medium text-gray-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center text-sm sm:text-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`flex-1 h-10 sm:h-12 flex items-center justify-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] font-semibold transition-all duration-300 ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  AJOUTÉ AU PANIER
                </>
              ) : availableStock <= 0 && hasVariants && selectedSize && selectedColor ? (
                "ÉPUISÉ"
              ) : !selectedSize || !selectedColor ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  SÉLECTIONNEZ
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  AJOUTER AU PANIER
                </>
              )}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: Truck, text: "Livraison 58 wilayas" },
              { icon: ShieldCheck, text: "Paiement à la livraison" },
              { icon: RotateCcw, text: "Retour sous 7 jours" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 sm:gap-1.5 bg-[#EFEAE4] py-2.5 sm:py-3 px-1.5 sm:px-2 text-center rounded-lg">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-[9px] sm:text-[10px] font-medium text-gray-500 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 sm:mt-16 border-t border-gray-100 pt-8 sm:pt-10">
        <div className="flex gap-0.5 sm:gap-1 border-b border-gray-200 mb-5 sm:mb-6">
          {([
            { key: "description" as const, label: "Description" },
            { key: "details" as const, label: "Détails" },
            { key: "shipping" as const, label: "Livraison" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab.key ? "text-black" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-black" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[100px] sm:min-h-[120px]">
          {activeTab === "description" && (
            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">
              {product.description || "Aucune description disponible."}
            </p>
          )}
          {activeTab === "details" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-[#F5F1EC] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg">
                <span className="text-gray-400">Marque:</span>
                <span className="font-medium text-gray-700">SN SHOP</span>
              </div>
              {uniqueSizes.length > 0 && (
                <div className="flex items-center gap-2 bg-[#F5F1EC] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg">
                  <span className="text-gray-400">Tailles:</span>
                  <span className="font-medium text-gray-700">{uniqueSizes.join(" - ")}</span>
                </div>
              )}
              {uniqueColors.length > 0 && (
                <div className="flex items-center gap-2 bg-[#F5F1EC] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg">
                  <span className="text-gray-400">Couleurs:</span>
                  <span className="font-medium text-gray-700">{uniqueColors.map((c) => c.name).join(" - ")}</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center gap-2 bg-[#F5F1EC] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg">
                  <span className="text-gray-400">Catégorie:</span>
                  <span className="font-medium text-gray-700">{product.category.name}</span>
                </div>
              )}
            </div>
          )}
          {activeTab === "shipping" && (
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-start gap-3 bg-[#F5F1EC] p-3 sm:p-4 rounded-lg">
                <Truck className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Livraison dans toute l&apos;Algérie</p>
                  <p className="text-gray-500 leading-relaxed">
                    Livraison dans les 58 wilayas. Frais variables selon la wilaya et le type de livraison.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#F5F1EC] p-3 sm:p-4 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Paiement à la livraison</p>
                  <p className="text-gray-500 leading-relaxed">
                    Payez à la réception de votre commande. Pas de carte bancaire requise.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 sm:mt-16 border-t border-gray-100 pt-8 sm:pt-10">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <h2
            className="text-xl sm:text-2xl font-light text-gray-900"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Avis clients
          </h2>
          {localReviews.length > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs sm:text-sm text-gray-500 ml-1">({localReviews.length})</span>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          <div className="space-y-3 sm:space-y-4">
            {localReviews.length === 0 ? (
              <p className="text-gray-400 text-xs sm:text-sm">Aucun avis pour le moment. Soyez le premier !</p>
            ) : (
              localReviews.map((review) => (
                <div key={review.id} className="bg-[#F5F1EC] p-3 sm:p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] sm:text-xs font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">{review.userName}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                              s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs sm:text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-[#EFEAE4] p-4 sm:p-6 rounded-xl">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Laisser un avis</h3>
            <div className="space-y-2.5 sm:space-y-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 bg-white text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star
                      className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer transition-colors ${
                        s <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs sm:text-sm text-gray-500 ml-2">{reviewRating}/5</span>
              </div>
              <textarea
                placeholder="Votre avis (optionnel)"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 bg-white text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || !reviewName.trim()}
                className="bg-black text-white px-5 sm:px-6 py-2.5 text-[10px] sm:text-xs tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 rounded-lg"
              >
                {reviewSubmitting ? "Envoi..." : "SOUMETTRE"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Selling */}
      <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
    </div>
  );
}
