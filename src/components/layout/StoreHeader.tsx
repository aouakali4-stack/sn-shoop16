"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCartStore } from "@/hooks/use-cart";
import CartDrawer from "@/components/CartDrawer";

interface SiteSettings {
  siteName: string;
  announcementText: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="bg-black text-white text-xs tracking-widest uppercase">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
        <span className="hidden sm:block font-light">Livraison dans toute l&apos;Algérie</span>
        <span className="hidden md:block font-medium">{text || "-10% SUR VOTRE PREMIÈRE COMMANDE"}</span>
        <span className="hidden sm:block font-light">Suivi de commande</span>
        <span className="sm:hidden text-center w-full font-medium">{text || "-10% SUR VOTRE 1ÈRE COMMANDE"}</span>
      </div>
    </div>
  );
}

export default function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({ siteName: "SN SHOP", announcementText: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    setIsMounted(true);

    fetch("/api/store/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            siteName: data.settings.siteName || "SN SHOP",
            announcementText: data.settings.announcementText || "",
          });
        }
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks: { href: string; label: string; highlight?: boolean }[] = [
    { href: "/", label: "ACCUEIL" },
    ...categories.map((cat) => ({
      href: `/store/category/${cat.slug}`,
      label: cat.name,
      highlight: cat.name === "PROMOTIONS",
    })),
    { href: "/contact", label: "CONTACT" },
  ];

  const displayName = settings.siteName?.toUpperCase() || "SN SHOP";

  return (
    <>
      <AnnouncementBar text={settings.announcementText} />

      <header className="sticky top-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-1 w-24 md:w-32">
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-700 hover:text-black transition-colors"
                >
                  {searchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
                </button>
                {searchOpen && (
                  <form
                    onSubmit={handleSearch}
                    className="absolute top-full left-0 mt-2 w-64 sm:w-80 bg-white border border-gray-200 shadow-lg rounded-xl p-2 flex items-center gap-2 z-50"
                  >
                    <Search size={16} strokeWidth={1.5} className="text-gray-400 flex-shrink-0 ml-1" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
                    />
                  </form>
                )}
              </div>
            </div>

            <Link href="/" className="flex-1 flex justify-center">
              <h1
                className="text-2xl md:text-4xl tracking-[0.2em] font-light text-black"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                {displayName}
              </h1>
            </Link>

            <div className="flex items-center gap-1 w-24 md:w-32 justify-end">
              <button
                onClick={openCart}
                className="relative p-2 text-gray-700 hover:text-black transition-colors"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {isMounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-semibold leading-none min-w-[18px] min-h-[18px]">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                className="md:hidden p-2 text-gray-700"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-0 pb-3 -mt-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 lg:px-4 py-1 text-[11px] lg:text-xs tracking-[0.15em] font-medium transition-colors
                  ${link.highlight
                    ? "text-rose-600 hover:text-rose-700"
                    : "text-gray-700 hover:text-black"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2.5 text-sm tracking-[0.1em] font-medium transition-colors
                    ${link.highlight
                      ? "text-rose-600"
                      : "text-gray-700 hover:text-black"
                    }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
