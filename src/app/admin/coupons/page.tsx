"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Trash2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  isPercentage: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [isPercentage, setIsPercentage] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!code.trim() || !discount) return;
    setAdding(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, discount: Number(discount), isPercentage }),
      });
      if (res.ok) {
        setCode("");
        setDiscount("");
        setIsPercentage(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        alert(data.error || "حدث خطأ");
      }
    } catch {
      alert("خطأ في الاتصال");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("خطأ في الاتصال");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">كوبونات التخفيض</h1>
          <p className="text-sm text-gray-500">إنشاء وإدارة كوبونات الخصم</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إضافة كوبون جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">كود الكوبون</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال: WELCOME10"
                className="w-48"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">قيمة الخصم</label>
              <Input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
                className="w-28"
              />
            </div>
            <div className="flex items-center gap-2 pb-0.5">
              <input
                type="checkbox"
                checked={isPercentage}
                onChange={(e) => setIsPercentage(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label className="text-sm text-gray-600">نسبة مئوية (%)</label>
            </div>
            <Button
              onClick={handleAdd}
              disabled={adding || !code.trim() || !discount}
              className="gap-1 bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              {adding ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الكوبونات الحالية ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد كوبونات بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الكود</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الخصم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">النوع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{coupon.code}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {coupon.discount} {coupon.isPercentage ? "%" : "د.ج"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {coupon.isPercentage ? "نسبة مئوية" : "مبلغ ثابت"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {coupon.isActive ? "نشط" : "معطّل"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
