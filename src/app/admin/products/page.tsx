"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Image,
} from "lucide-react";

const isValidUrl = (url: any): url is string =>
  typeof url === "string" && url.startsWith("http");

const getImageUrl = (product: any): string => {
  if (!product) return "/placeholder.svg";
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const url = typeof img === "string" ? img : img?.url;
      if (isValidUrl(url)) return url;
    }
  }
  if (isValidUrl(product.image)) return product.image;
  return "/placeholder.svg";
};

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  nameAr: string;
  name: string;
  price: number;
  comparePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category?: { nameAr: string; name: string } | null;
  images: ProductImage[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.nameAr.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            p.category?.nameAr?.toLowerCase().includes(q) ||
            p.category?.name?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || data || []);
      setFilteredProducts(data.products || data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setFilteredProducts((prev) => prev.filter((p) => p.id !== id));
        setDeleteModal(null);
      } else {
        alert("حدث خطأ أثناء محاولة الحذف.");
      }
    } catch (error) {
      console.error("خطأ في الاتصال:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
            <p className="text-sm text-gray-500">
              إدارة جميع المنتجات ({filteredProducts.length})
            </p>
          </div>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="بحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      المنتج
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الفئة
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      السعر
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      المخزون
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الحالة
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(product)}
                              alt={product.nameAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.nameAr}
                            </p>
                            <p className="text-xs text-gray-500">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.category?.nameAr || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && product.comparePrice > 0 && (
                            <span className="block text-xs text-gray-400 line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "font-medium",
                            product.stock > 0 ? "text-green-600" : "text-red-500"
                          )}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          {product.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteModal(product.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">حذف المنتج</h3>
              <button
                onClick={() => setDeleteModal(null)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? "جاري الحذف..." : "حذف"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteModal(null)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
