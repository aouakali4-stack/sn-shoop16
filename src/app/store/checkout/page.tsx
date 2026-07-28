"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { ALGERIA_WILAYAS, DELIVERY_TYPES } from "@/constants/algeriaWilayas";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [commune, setCommune] = useState("");
  const [deliveryType, setDeliveryType] = useState("home");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotal();

  const selectedWilaya = useMemo(
    () => ALGERIA_WILAYAS.find((w) => w.code === wilayaCode),
    [wilayaCode]
  );

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return deliveryType === "office" ? selectedWilaya.officePrice : selectedWilaya.homePrice;
  }, [selectedWilaya, deliveryType]);

  const total = Math.max(0, subtotal + shippingCost - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data.coupon.discountAmount);
        setCouponApplied(true);
        setCouponError("");
      } else {
        setCouponError(data.error || "كود غير صالح");
        setCouponDiscount(0);
        setCouponApplied(false);
      }
    } catch {
      setCouponError("خطأ في الاتصال");
    }
    setCouponLoading(false);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 3) {
      errs.customerName = "Nom complet requis (3 caractères min.)";
    }

    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      errs.phoneNumber = "Numéro invalide (05/06/07 + 8 chiffres)";
    }

    if (!wilayaCode) {
      errs.wilaya = "Veuillez sélectionner une wilaya";
    }

    if (!commune.trim()) {
      errs.commune = "Commune requise";
    }

    if (deliveryType === "home" && !address.trim()) {
      errs.address = "Adresse requise pour la livraison à domicile";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          wilaya: wilayaCode,
          commune: commune.trim(),
          deliveryType,
          address: address.trim() || null,
          notes: notes.trim() || null,
          shippingCost,
          subtotal,
          total,
          paymentMethod: "cod",
          items: items.map((item) => ({
            productId: item.productId,
            name: item.nameAr,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setOrderSuccess(true);
      clearCart();
    } catch {
      setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="mx-4 max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#EFEAE4]">
            <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2
            className="text-3xl font-light text-black mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Commande confirmée
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Merci <span className="font-semibold text-black">{customerName}</span>.
            Nous vous contacterons au <span className="font-semibold text-black" dir="ltr">{phoneNumber}</span>.
          </p>
          <p className="mt-2 text-xs text-gray-400">Paiement à la livraison</p>
          <Link
            href="/"
            className="mt-8 inline-block bg-black text-white text-xs tracking-[0.2em] font-semibold px-8 py-3 hover:bg-gray-800 transition-colors"
          >
            RETOUR À LA BOUTIQUE
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center px-4">
          <p className="text-lg font-light text-gray-700" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            Votre panier est vide
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-black text-sm font-medium hover:underline"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "flex h-11 w-full border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1
        className="mb-8 text-3xl font-light text-black"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Form */}
          <div className="space-y-6 lg:col-span-3">
            {/* Delivery Info */}
            <div className="border border-stone-200 bg-white p-6 shadow-sm rounded-xl">
              <h2 className="mb-5 text-base font-semibold text-black tracking-wide uppercase text-[11px]">
                Informations de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Nom complet *</label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={inputClass}
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Téléphone *</label>
                  <input
                    type="text"
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={inputClass}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Wilaya *</label>
                    <select
                      value={wilayaCode}
                      onChange={(e) => setWilayaCode(e.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>Sélectionner</option>
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.nameAr}
                        </option>
                      ))}
                    </select>
                    {errors.wilaya && (
                      <p className="mt-1 text-xs text-red-500">{errors.wilaya}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Commune *</label>
                    <input
                      type="text"
                      placeholder="Commune"
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className={inputClass}
                    />
                    {errors.commune && (
                      <p className="mt-1 text-xs text-red-500">{errors.commune}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Type de livraison *</label>
                  <div className="flex gap-3">
                    {DELIVERY_TYPES.map((dt) => (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => setDeliveryType(dt.value)}
                        className={`flex-1 border px-4 py-3 text-sm font-medium transition-all ${
                          deliveryType === dt.value
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {dt.labelAr}
                      </button>
                    ))}
                  </div>
                </div>

                {deliveryType === "home" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-600">Adresse *</label>
                    <input
                      type="text"
                      placeholder="Quartier, rue, n° de maison..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-600">Notes</label>
                  <textarea
                    placeholder="Instructions de livraison (optionnel)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-stone-200 bg-white p-6 shadow-sm rounded-xl">
              <h2 className="mb-4 text-base font-semibold text-black tracking-wide uppercase text-[11px]">
                Mode de paiement
              </h2>
              <div className="flex items-center gap-3 border border-gray-200 bg-[#F5F1EC] px-4 py-3">
                <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Paiement à la livraison (COD)</span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 border border-stone-200 bg-white p-6 shadow-sm rounded-xl">
              <h2 className="mb-5 text-base font-semibold text-black tracking-wide uppercase text-[11px]">
                Récapitulatif
              </h2>

              <div className="max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden bg-[#EFEAE4]">
                      <Image
                        src={item.image}
                        alt={item.nameAr}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center bg-black text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{item.nameAr}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.size} / {item.color}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-black whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Livraison</span>
                  <span className="font-medium text-gray-700">
                    {wilayaCode ? formatPrice(shippingCost) : "—"}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2">Code promo</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="WELCOME10"
                      disabled={couponApplied}
                      className="flex-1 px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || couponApplied || !couponCode.trim()}
                      className="px-4 py-2 bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? "..." : couponApplied ? "✓" : "Appliquer"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {couponApplied && <p className="text-xs text-green-600 mt-1">Réduction appliquée: -{formatPrice(couponDiscount)}</p>}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Réduction</span>
                    <span className="font-medium text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-black">Total</span>
                  <span className="text-xl font-semibold text-black">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {errors.submit && (
                <p className="mt-3 text-sm text-red-500 text-center">{errors.submit}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full h-14 bg-black text-white text-sm font-medium tracking-wide hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Envoi en cours...
                  </span>
                ) : (
                  "CONFIRMER LA COMMANDE"
                )}
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-400">
                Paiement à la livraison — Pas de carte bancaire requise
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
