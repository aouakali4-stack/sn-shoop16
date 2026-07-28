"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, ChevronLeft, ChevronRight, ZoomIn, Star } from "lucide-react";
import RelatedProducts from "@/components/RelatedProducts";
import type { Product } from "@/types";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/store/products/${slug}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setProduct(data?.product || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const validImages = (product?.images || []).filter(
    (img: any) => img?.url && typeof img.url === "string" && img.url.startsWith("http")
  );

  useEffect(() => {
    if (!product?.id) return;
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.count || 0);
      })
      .catch(() => {});
  }, [product?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          <p className="mt-4 text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <p className="text-xl font-light text-gray-700" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            Produit non trouvé
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white text-xs tracking-[0.2em] font-semibold px-8 py-3 hover:bg-gray-800 transition-colors"
          >
            RETOUR À LA BOUTIQUE
          </Link>
        </div>
      </div>
    );
  }

  const variants = product?.variants || [];

  const extraSizes = (product as unknown as Record<string, unknown>)?.sizes;
  const extraColors = (product as unknown as Record<string, unknown>)?.colors;

  const sizeArray: string[] = Array.isArray(extraSizes)
    ? extraSizes as string[]
    : variants.map((v) => v.size);

  const colorArray: { name: string; hex?: string }[] = Array.isArray(extraColors)
    ? (extraColors as { name: string; hex?: string }[])
    : variants.map((v) => ({ name: v.color, hex: v.colorHex || undefined }));

  const uniqueSizes = [...new Set(sizeArray.filter(Boolean))];
  const uniqueColors = [
    ...new Map(
      colorArray.filter((c) => c.name).map((c) => [c.name, { name: c.name, hex: c.hex }])
    ).values(),
  ];

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const availableColorsForSize = selectedSize
    ? [
        ...new Map(
          variants
            .filter((v) => v.size === selectedSize)
            .map((v) => [v.color, { name: v.color, hex: v.colorHex }])
        ).values(),
      ]
    : uniqueColors;

  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const price = typeof product?.price === "number" && product.price > 0 ? product.price : 0;
  const formattedPrice = price > 0 ? price.toLocaleString("ar-DZ") : "N/A";

  const rawCompare = typeof product?.comparePrice === "number" && !isNaN(product.comparePrice) ? product.comparePrice : 0;
  const hasDiscount = rawCompare > price;

  const handleQuantityChange = (newQty: number) => {
    if (isNaN(newQty) || newQty < 1) {
      setQuantity(1);
    } else {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    if (availableStock <= 0) return;

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: price,
      image: product?.images && product.images.length > 0 ? product.images[0].url : "/placeholder.png",
      size: selectedSize,
      color: selectedColor,
      colorHex: selectedVariant?.colorHex || undefined,
      quantity,
      stock: availableStock,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
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
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.count || 0);
      }
    } catch {}
    setReviewSubmitting(false);
  };

  const hasVariants = uniqueSizes.length > 0 || uniqueColors.length > 0;
  const canAddToCart = hasVariants ? selectedSize && selectedColor && availableStock > 0 : availableStock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-black transition-colors">Boutique</Link>
        <ChevronLeft className="w-3 h-3" />
        {product.category && (
          <>
            <Link href={`/store/category/${product.category.slug}`} className="hover:text-black transition-colors">
              {product.category.nameAr || product.category.name}
            </Link>
            <ChevronLeft className="w-3 h-3" />
          </>
        )}
        <span className="text-gray-600 font-medium">{product.nameAr}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#EFEAE4] group">
            {validImages.length > 0 ? (
              <>
                <img
                  src={validImages[activeImage]?.url || validImages[0].url}
                  alt={validImages[activeImage]?.alt || product.nameAr || product.name || ""}
                  className="h-full w-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <ZoomIn className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-full items-center justify-center bg-[#EFEAE4]">
                <span
                  className="text-6xl font-light text-black/10"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
                >
                  SN
                </span>
                <p className="text-gray-300 text-xs mt-1">Pas d&apos;image</p>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 right-4 bg-black text-white text-xs font-semibold px-3 py-1.5 tracking-wide z-10">
                -{Math.round(((rawCompare - price) / rawCompare) * 100)}%
              </div>
            )}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + validImages.length) % validImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm opacity-90 transition-all hover:bg-white hover:scale-110 active:scale-95 z-10"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % validImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm opacity-90 transition-all hover:bg-white hover:scale-110 active:scale-95 z-10"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {validImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {validImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === idx
                      ? "border-black scale-95"
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
              <span className="inline-block text-[10px] tracking-[0.15em] text-gray-500 uppercase mb-3">
                {product.category.nameAr || product.category.name}
              </span>
            )}
            <h1 className="text-2xl font-light text-gray-900 sm:text-3xl" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
              {product?.nameAr || product?.name || "Produit"}
            </h1>
          </div>

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl font-light text-black">
              {formattedPrice}{price > 0 && " DA"}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {rawCompare.toLocaleString("ar-DZ")} DA
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="mt-2">
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1">
                Économisez {(rawCompare - price).toLocaleString("ar-DZ")} DA
              </span>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {uniqueSizes.length > 0 && (
              <div>
                <label className="mb-3 block text-xs tracking-[0.1em] font-semibold text-gray-700 uppercase">
                  Taille
                  {selectedSize && <span className="ml-2 text-black font-normal normal-case">({selectedSize})</span>}
                </label>
                <div className="flex flex-wrap gap-2.5">
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
                        className={`relative h-12 min-w-[48px] px-5 text-sm font-medium transition-all duration-200 ${
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

            <div>
              <label className="mb-3 block text-xs tracking-[0.1em] font-semibold text-gray-700 uppercase">
                Couleur
                {selectedColor && <span className="ml-2 text-black font-normal normal-case">({selectedColor})</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {availableColorsForSize.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`group/swatch flex flex-col items-center gap-1.5 transition-all duration-200 ${
                        isSelected ? "scale-110" : "hover:scale-105"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-black ring-2 ring-gray-200"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.hex || "#ccc" }}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium transition-colors ${
                        isSelected ? "text-black" : "text-gray-400 group-hover/swatch:text-gray-600"
                      }`}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSize && selectedColor && (
              <div className="border px-4 py-3 animate-fade-in">
                {availableStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm text-gray-700 font-medium">
                      En stock <span className="text-gray-400">({availableStock})</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <p className="text-sm text-red-500 font-medium">Épuisé</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center overflow-hidden border border-gray-200">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="flex h-12 w-12 items-center justify-center text-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="flex h-12 w-14 items-center justify-center border-x border-gray-200 text-base font-medium text-gray-800">
                {Number.isNaN(quantity) || !quantity ? 1 : quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="flex h-12 w-12 items-center justify-center text-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs tracking-[0.2em] font-semibold transition-all duration-300 ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ShoppingBag className="w-4 h-4" />
              {addedToCart
                ? "AJOUTÉ ✓"
                : availableStock <= 0 && selectedSize && selectedColor
                ? "ÉPUISÉ"
                : !selectedSize || !selectedColor
                ? "SÉLECTIONNEZ"
                : "AJOUTER AU PANIER"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: "Livraison 58 wilayas" },
              { icon: ShieldCheck, text: "Paiement à la livraison" },
              { icon: RotateCcw, text: "Retour sous 7 jours" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 bg-[#EFEAE4] py-3 px-2 text-center">
                <Icon className="w-4 h-4 text-gray-700" />
                <span className="text-[10px] font-medium text-gray-500 leading-tight">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {([
            { key: "description" as const, label: "Description" },
            { key: "details" as const, label: "Détails" },
            { key: "shipping" as const, label: "Livraison" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-black" />
              )}
            </button>
          ))}
        </div>

        <div className="animate-fade-in min-h-[120px]">
          {activeTab === "description" && (
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description || "Aucune description disponible."}
            </p>
          )}
          {activeTab === "details" && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 bg-[#F5F1EC] px-4 py-2.5">
                <span className="text-gray-400">Marque:</span>
                <span className="font-medium text-gray-700">SN SHOP</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F1EC] px-4 py-2.5">
                <span className="text-gray-400">Tailles:</span>
                <span className="font-medium text-gray-700">{uniqueSizes.join(" - ") || "Multi"}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F1EC] px-4 py-2.5">
                <span className="text-gray-400">Couleurs:</span>
                <span className="font-medium text-gray-700">{uniqueColors.map((c) => c.name).join(" - ") || "Multi"}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F5F1EC] px-4 py-2.5">
                <span className="text-gray-400">Catégorie:</span>
                <span className="font-medium text-gray-700">{product.category?.nameAr || "Général"}</span>
              </div>
            </div>
          )}
          {activeTab === "shipping" && (
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3 bg-[#F5F1EC] p-4">
                <Truck className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Livraison dans toute l&apos;Algérie</p>
                  <p className="text-gray-500 leading-relaxed">
                    Livraison dans les 58 wilayas. Frais variables selon la wilaya et le type de livraison.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#F5F1EC] p-4">
                <ShieldCheck className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
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

      {/* Reviews Section */}
      <div className="mt-16 border-t border-gray-100 pt-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-light text-gray-900" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            Avis clients
          </h2>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
              <span className="text-sm text-gray-500 ml-1">({reviewCount})</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucun avis pour le moment. Soyez le premier !</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-[#F5F1EC] p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{review.userName}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                </div>
              ))
            )}
          </div>

          <div className="bg-[#EFEAE4] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Laisser un avis</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`w-5 h-5 cursor-pointer transition-colors ${s <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">{reviewRating}/5</span>
              </div>
              <textarea
                placeholder="Votre avis (optionnel)"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting || !reviewName.trim()}
                className="bg-black text-white px-6 py-2.5 text-xs tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? "Envoi..." : "SOUMETTRE"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Selling */}
      {product && (
        <RelatedProducts currentProductId={product.id} categoryId={product.categoryId} />
      )}
    </div>
  );
}
