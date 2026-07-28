"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PRODUCT_SIZES, PRODUCT_COLORS } from "@/constants/algeriaWilayas";
import { Package, Plus, Trash2, Upload, X, Image, Save, Sparkles } from "lucide-react";

interface Category {
  id: string;
  nameAr: string;
  name: string;
}

interface Variant {
  size: string;
  color: string;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [nameAr, setNameAr] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<{file: File, preview: string}[]>([]);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("حدث خطأ أثناء جلب الفئات:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: PRODUCT_SIZES[0], color: PRODUCT_COLORS[0].name, stock: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleAddNewCategory = async () => {
    const newCategoryName = window.prompt("أدخل اسم الفئة الجديدة (مثال: حقائب يد، أحذية، عبايات):");
    if (!newCategoryName || newCategoryName.trim() === "") return;

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameAr: newCategoryName, name: newCategoryName }),
      });

      if (response.ok) {
        const data = await response.json();
        const newCat = data.category || data;
        setCategories((prev) => [...(prev || []), newCat]);
        alert("تمت إضافة الفئة بنجاح! يمكنك الآن اختيارها من القائمة.");
      } else {
        alert("حدث خطأ أثناء حفظ الفئة.");
      }
    } catch (error) {
      alert("خطأ في الاتصال بالسيرفر.");
    }
  };

  const handleAiAnalyze = async () => {
    if (images.length === 0) {
      setAiError("ارفع صورة أولاً قبل التحليل");
      setTimeout(() => setAiError(""), 3000);
      return;
    }

    setAiAnalyzing(true);
    setAiError("");

    try {
      const file = images[0].file;
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const data = result.split(",")[1];
          resolve(data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/admin/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAiError(data.error || "فشل التحليل");
        setTimeout(() => setAiError(""), 4000);
        return;
      }

      const data = await res.json();
      const r = data.result;

      if (r.title) setNameAr(r.title);
      if (r.titleFr) setName(r.titleFr);
      if (r.description) setDescription(r.description);

      if (r.suggestedCategory && categories.length > 0) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === r.suggestedCategory.toLowerCase()
        );
        if (match) setCategoryId(match.id);
      }

      if (r.color) {
        const colorName = r.color;
        const newVariant: Variant = {
          size: PRODUCT_SIZES[0],
          color: colorName,
          stock: 5,
        };
        setVariants([newVariant]);
      }
    } catch (err) {
      console.error("AI analyze error:", err);
      setAiError("خطأ في الاتصال بالخادم");
      setTimeout(() => setAiError(""), 4000);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        nameAr,
        name,
        description,
        price: parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        stock: parseInt(stock) || 0,
        categoryId: categoryId || null,
        isActive,
        isFeatured,
        images: images.map((img, idx) => ({ url: img.preview, alt: nameAr, sortOrder: idx })),
        variants: variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: v.stock,
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ أثناء إنشاء المنتج");
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة منتج جديد</h1>
          <p className="text-sm text-gray-500">أضف منتجاً جديداً إلى المتجر</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                <Input
                  id="nameAr"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: فستان صيفي أنيق"
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم بالإنجليزية</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elegant Summer Dress"
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المنتج بالتفصيل..."
                rows={4}
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (د.ج) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">السعر القديم (د.ج)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  min="0"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="اختياري"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">المخزون الإجمالي *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <div className="flex gap-2 items-start w-full">
                  <div className="w-full">
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                    >
                      <option value="">اختر فئة...</option>
                      {categories && Array.isArray(categories) && categories.length > 0 ? categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameAr}
                        </option>
                      )) : <option value="" disabled>لا توجد فئات حالياً</option>}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap h-[42px] flex items-center shadow-sm"
                  >
                    + فئة جديدة
                  </button>
                </div>
              </div>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">نشط</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">مميز</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">الصور</h2>
          <div className="flex flex-wrap gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative w-32 h-32">
                <img
                  src={img.preview}
                  alt={`معاينة ${index + 1}`}
                  className="h-full w-full object-cover rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md"
                  title="حذف الصورة"
                >
                  &times;
                </button>
              </div>
            ))}

            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-pink-400 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors w-32 h-32 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <svg className="w-6 h-6 text-pink-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span className="text-sm text-pink-600 font-medium">إضافة صورة</span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {aiAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري التحليل بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    تعبئة ذكية بالذكاء الاصطناعي
                  </>
                )}
              </button>
              {aiError && (
                <p className="mt-2 text-sm text-red-500">{aiError}</p>
              )}
            </div>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">المتغيرات (المقاسات والألوان)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-1">
              <Plus className="w-3 h-3" />
              إضافة متغير
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {variants.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                لا توجد متغيرات. أضف متغيراً للمقاسات والألوان.
              </div>
            ) : (
              variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-end gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">المقاس</Label>
                    <select
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                    >
                      {PRODUCT_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">اللون</Label>
                    <select
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
                    >
                      {PRODUCT_COLORS.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">المخزون</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="h-9 w-20 text-right"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 pb-6">
          <Button type="submit" disabled={loading} className="gap-2 px-8">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ المنتج
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
