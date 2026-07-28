"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Truck, CreditCard, RotateCcw, Shield } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import { getProductImageUrl } from "@/lib/utils";
import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/layout/StoreFooter";
import ChatWidget from "@/components/ChatWidget";
import NewsletterForm from "@/components/NewsletterForm";

interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants: { size: string; color: string; stock: number; price?: number | null }[];
  category?: { name: string; nameAr: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image?: string | null;
  _count?: { products: number };
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop",
];

function getFallbackImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
}

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  const uniqueSizes = Array.isArray(product?.variants)
    ? [...new Set(product.variants.map((v: any) => v.size).filter(Boolean))]
    : [];
  const firstImage =
    getProductImageUrl(product?.images) ||
    (product as any)?.image ||
    getFallbackImage(product?.id || "default");

  const handleAddToCart = () => {
    const size = selectedSize || uniqueSizes[0] || "M";
    const variant = (Array.isArray(product?.variants) ? product.variants : []).find((v: any) => v.size === size)
      || (Array.isArray(product?.variants) ? product.variants[0] : undefined);
    if (!variant) return;

    addItem({
      productId: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: firstImage,
      size: size,
      color: variant.color,
      colorHex: undefined,
      stock: variant.stock,
    });
    openCart();
  };

  return (
    <div
      className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-beige-light overflow-hidden">
        <Link href={`/store/products/${product.slug}`}>
          <img
            src={firstImage}
            alt={product.nameAr || product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        {/* Wishlist button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
          <Heart size={15} strokeWidth={1.5} className="text-gray-600" />
        </button>
        {/* Quick add to cart */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 left-3 right-3 bg-black text-white text-xs tracking-[0.15em] font-medium py-2.5 flex items-center justify-center gap-2 transition-all duration-300
            ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          <ShoppingBag size={14} strokeWidth={1.5} />
          AJOUTER AU PANIER
        </button>
        {/* Compare price badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] tracking-wider font-semibold px-2.5 py-1">
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col text-left p-4 gap-1.5">
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          {product.category?.nameAr || product.category?.name || ""}
        </span>
        <Link href={`/store/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 truncate" dir="auto">
            {product.nameAr || product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Quick size buttons */}
        {uniqueSizes.length > 0 && (
          <div className="flex gap-2 pt-1">
            {uniqueSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-7 h-7 text-[10px] font-medium border transition-colors
                  ${selectedSize === size
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState({
    heroTitle: "NEW COLLECTION 2026",
    heroSubtitle: "Découvrez les dernières tendances à des prix irrésistibles",
    heroImageUrl: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes, settingsRes] = await Promise.allSettled([
          fetch("/api/store/products"),
          fetch("/api/store/categories"),
          fetch("/api/store/settings"),
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          try {
            const prodData = await prodRes.value.json();
            setProducts(prodData.products || []);
          } catch { setProducts([]); }
        } else {
          setProducts([]);
        }

        if (catRes.status === "fulfilled" && catRes.value.ok) {
          try {
            const catData = await catRes.value.json();
            setCategories(catData.categories || []);
          } catch { setCategories([]); }
        } else {
          setCategories([]);
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          try {
            const sData = await settingsRes.value.json();
            if (sData.settings) {
              setHeroSettings({
                heroTitle: sData.settings.heroTitle || "NEW COLLECTION 2026",
                heroSubtitle: sData.settings.heroSubtitle || "Découvrez les dernières tendances à des prix irrésistibles",
                heroImageUrl: sData.settings.heroImageUrl || "",
              });
            }
          } catch {}
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayProducts = products.filter((p) => p.slug).slice(0, 8);

  const navLinks = [
    { href: "/", label: "ACCUEIL" },
    ...categories.map((cat) => ({
      href: `/store/category/${cat.slug}`,
      label: (cat.name || "").toUpperCase(),
    })),
    { href: "/contact", label: "CONTACT" },
  ];

  const categoryDisplay = [
    { name: "Robes", slug: "fasatin", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop" },
    { name: "Hauts", slug: "casual", image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=500&auto=format&fit=crop" },
    { name: "Pantalons", slug: "vetements", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&auto=format&fit=crop" },
    { name: "Vestes", slug: "vetements", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop" },
    { name: "Sacs", slug: "accessories", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop" },
    { name: "Chaussures", slug: "chaussures", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop" },
    { name: "Promotions", slug: "promotions", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader navLinks={navLinks} siteName="SN SHOP" />
      <main className="flex-1">

      {/* ── HERO BANNER ── */}
      <section className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroSettings.heroImageUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop"}
            alt="New Collection 2026"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        {/* Text Overlay */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="animate-text delay-1 text-xs sm:text-sm tracking-[0.35em] text-white/70 uppercase mb-4 sm:mb-6 font-medium">
            Collection Printemps-Été
          </p>
          <h1
            className="animate-text delay-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-light text-white leading-[0.85] mb-5 sm:mb-7"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            {(heroSettings.heroTitle || "NEW COLLECTION 26").split("\n").map((line, i) => (
              <span key={i}>{line}{i < (heroSettings.heroTitle || "").split("\n").length - 1 && <br />}</span>
            )) || (
              <>
                NEW<br />COLLECTION<br /><span className="italic font-light">26</span>
              </>
            )}
          </h1>
          <p className="animate-text delay-3 text-sm sm:text-base md:text-lg text-white/80 mb-7 sm:mb-9 max-w-lg mx-auto leading-relaxed font-light">
            {heroSettings.heroSubtitle || "Découvrez nos dernières tendances"}
          </p>
          <div className="animate-text delay-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="#products"
              className="inline-block bg-white text-black text-xs sm:text-sm tracking-[0.25em] font-semibold px-10 sm:px-14 py-4 sm:py-4.5 hover:bg-gray-100 transition-colors duration-300"
            >
              SHOP NOW
            </Link>
            <Link
              href="#products"
              className="inline-block border border-white/50 text-white text-xs sm:text-sm tracking-[0.25em] font-medium px-10 sm:px-14 py-4 sm:py-4.5 hover:bg-white/10 transition-colors duration-300"
            >
              DÉCOUVRIR
            </Link>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITION BAR ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: Truck, title: "Livraison Rapide", subtitle: "Dans toute l'Algérie" },
              { icon: CreditCard, title: "Paiement à la livraison", subtitle: "COD sécurisé" },
              { icon: RotateCcw, title: "Retour Facile", subtitle: "Sous 7 jours" },
              { icon: Shield, title: "Produits de qualité", subtitle: "Garantie satisfaite" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center py-6 px-4 text-center">
                <item.icon size={22} strokeWidth={1.2} className="text-gray-700 mb-2.5" />
                <p className="text-xs font-semibold text-gray-900 tracking-wide">{item.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section title */}
          <div className="flex items-center gap-4 justify-center mb-12">
            <span className="w-12 h-px bg-gray-300" />
            <h2
              className="text-xl md:text-2xl tracking-[0.2em] font-light text-black"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              NOS CATÉGORIES
            </h2>
            <span className="w-12 h-px bg-gray-300" />
          </div>

          {/* Circular categories */}
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            {categoryDisplay.map((cat, index) => (
              <Link
                key={`${cat.slug}-${index}`}
                href={`/store/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-black transition-all duration-300 group-hover:shadow-lg">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-xs tracking-[0.1em] font-medium text-gray-700 group-hover:text-black transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW PRODUCTS ── */}
      <section id="products" className="py-16 md:py-20 bg-beige-light">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="w-8 md:w-12 h-px bg-gray-400" />
              <h2
                className="text-xl md:text-2xl tracking-[0.15em] font-light text-black"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                NOUVEAUTÉS
              </h2>
            </div>
            <Link
              href="/store/category/nouveautes"
              className="text-xs tracking-[0.15em] font-medium text-gray-600 hover:text-black transition-colors border-b border-gray-300 hover:border-black pb-0.5"
            >
              VOIR TOUT
            </Link>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">Aucun produit pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">Offre spéciale</p>
          <h2
            className="text-4xl md:text-6xl font-light mb-4"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            -10% SUR VOTRE
            <br />
            <span className="italic">PREMIÈRE COMMANDE</span>
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            Inscrivez-vous à notre newsletter et recevez immédiatement votre code promo.
          </p>
          <Link
            href="/store/category/nouveautes"
            className="inline-block bg-white text-black text-xs tracking-[0.25em] font-semibold px-10 py-4 hover:bg-gray-200 transition-colors"
          >
            DÉCOUVRIR
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER (inline before footer) ── */}
      <section className="py-16 bg-nude">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2
            className="text-2xl md:text-3xl tracking-[0.15em] font-light text-black mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            INSCRIVEZ-VOUS À NOTRE NEWSLETTER
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            Recevez en avant-première nos nouveautés et offres exclusives.
          </p>
          <div className="flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
      </main>
      <StoreFooter />
      <ChatWidget />
    </div>
  );
}
