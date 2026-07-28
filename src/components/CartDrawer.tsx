"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/hooks/use-cart";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-DZ").format(price) + " DA";
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const total = getTotal();
  const itemCount = getItemCount();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
            <h2
              className="text-lg font-light text-gray-900"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Panier
            </h2>
            {itemCount > 0 && (
              <span className="bg-black text-white text-[10px] font-semibold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-5 py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1} />
              <p
                className="text-lg font-light text-gray-500 mb-1"
                style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
              >
                Votre panier est vide
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Découvrez notre collection et ajoutez vos articles préférés.
              </p>
              <button
                onClick={closeCart}
                className="bg-black text-white text-[10px] tracking-[0.2em] font-semibold px-6 py-2.5 hover:bg-gray-800 transition-colors"
              >
                CONTINUER MES ACHATS
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3.5 px-5 py-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 flex-shrink-0 overflow-hidden bg-[#EFEAE4] rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.nameAr || item.name}</h3>
                        <button
                          onClick={() => removeItem(item.productId, item.size, item.color)}
                          className="p-0.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                        {item.size && item.size !== "ONE_SIZE" && (
                          <span className="bg-gray-50 px-1.5 py-0.5 rounded">{item.size}</span>
                        )}
                        {item.color && item.color !== "default" && (
                          <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded">
                            {item.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-gray-200 inline-block"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 h-7 flex items-center justify-center text-xs font-medium text-gray-800 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Sous-total</span>
              <span className="text-lg font-light text-gray-900" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Les frais de livraison seront calculés lors du checkout.
            </p>
            <Link
              href="/store/checkout"
              onClick={closeCart}
              className="block w-full bg-black text-white text-xs tracking-[0.2em] font-semibold py-3.5 text-center hover:bg-gray-800 transition-colors"
            >
              COMMANDER
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-[10px] tracking-[0.1em] text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              CONTINUER MES ACHATS
            </button>
          </div>
        )}
      </div>
    </>
  );
}
