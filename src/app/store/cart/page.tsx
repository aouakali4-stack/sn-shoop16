"use client";

import { useCartStore } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center px-4">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center bg-[#EFEAE4]">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2
            className="text-2xl font-light text-gray-700 mb-2"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Votre panier est vide
          </h2>
          <p className="text-sm text-gray-400">Ajoutez des produits pour commencer.</p>
          <Link
            href="/"
            className="mt-6 inline-block bg-black text-white text-xs tracking-[0.2em] font-semibold px-8 py-3 hover:bg-gray-800 transition-colors"
          >
            CONTINUER LES ACHATS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1
        className="mb-8 text-3xl font-light text-black"
        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
      >
        Panier
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.size}-${item.color}`}
            className="flex gap-4 border border-gray-100 bg-white p-4 sm:gap-6 sm:p-5 transition-shadow hover:shadow-sm"
          >
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-[#EFEAE4] sm:h-32 sm:w-32">
              <Image
                src={item.image}
                alt={item.nameAr}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-800 sm:text-base">
                  {item.nameAr}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="bg-[#F5F1EC] px-2.5 py-0.5 text-gray-600">
                    {item.size}
                  </span>
                  <span className="bg-[#F5F1EC] px-2.5 py-0.5 text-gray-600">
                    {item.color}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center overflow-hidden border border-gray-200">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="flex h-8 w-10 items-center justify-center border-x border-gray-200 text-sm font-medium text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          Math.min(item.stock, item.quantity + 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.size, item.color)}
                    className="flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-red-500"
                    title="Supprimer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <span className="text-base font-semibold text-black sm:text-lg">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-gray-100 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              Sous-total ({items.reduce((c, i) => c + i.quantity, 0)} article{items.reduce((c, i) => c + i.quantity, 0) > 1 ? "s" : ""})
            </span>
            <span className="text-xl font-semibold text-black">{formatPrice(total)}</span>
          </div>
        </div>
        <div className="border-t border-gray-100 bg-[#F5F1EC] p-6">
          <Link href="/store/checkout" className="block">
            <button className="w-full h-12 bg-black text-white text-xs tracking-[0.2em] font-semibold hover:bg-gray-800 transition-colors">
              PASSER LA COMMANDE
            </button>
          </Link>
          <Link
            href="/"
            className="mt-3 block text-center text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
}
