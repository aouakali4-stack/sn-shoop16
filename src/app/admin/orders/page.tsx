"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES, ALGERIA_WILAYAS } from "@/constants/algeriaWilayas";
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  ChevronDown,
  Printer,
} from "lucide-react";

interface OrderItem {
  id: string;
  nameAr: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  address?: string;
  deliveryType?: string;
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (activeTab !== "all") {
      result = result.filter((o) => o.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.phone?.includes(q)
      );
    }

    setFilteredOrders(result);
  }, [orders, activeTab, searchQuery]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      const ordersList = data.orders || data || [];
      setOrders(
        Array.isArray(ordersList)
          ? ordersList.sort(
              (a: Order, b: Order) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          : []
      );
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    if (!found) return <Badge variant="secondary">{status}</Badge>;
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          found.color
        )}
      >
        {found.labelAr}
      </span>
    );
  };

  const getWilayaName = (code: string) => {
    const w = ALGERIA_WILAYAS.find((w) => w.code === code);
    return w ? w.nameAr : code;
  };

  const tabs = [
    { value: "all", label: "الكل", count: orders.length },
    {
      value: "new",
      label: "جديد",
      count: orders.filter((o) => o.status === "new").length,
    },
    {
      value: "confirmed",
      label: "قيد التأكيد",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      value: "shipped",
      label: "تم الشحن",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      value: "delivered",
      label: "تم التسليم",
      count: orders.filter((o) => o.status === "delivered").length,
    },
    {
      value: "cancelled",
      label: "ملغى",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-sm text-gray-500">إدارة طلبات المتجر ({filteredOrders.length})</p>
        </div>
        <a
          href="/api/export-orders"
          className="mr-auto bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
        >
          تصدير إلى Excel
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "mr-1.5 text-xs",
                  activeTab === tab.value ? "text-pink-200" : "text-gray-400"
                )}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="بحث برقم الطلب أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right text-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      رقم الطلب
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      العميل
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الهاتف
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الولاية
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الحالة
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      التاريخ
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs" dir="ltr">
                        {order.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {getWilayaName(order.wilaya) || order.wilaya}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                          </Button>
                          {order.phone && (
                            <a
                              href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `مرحباً ${order.customerName} 👋\n\nنشكرك على طلبك من متجر Sn Shop16! 🛍️\n\nرقم الطلب: ${order.orderNumber}\n${order.items && order.items.length > 0 ? `المنتجات: ${order.items.map((i) => `${i.nameAr} × ${i.quantity}`).join(", ")}\n` : ""}المبلغ الإجمالي: ${formatPrice(order.total)}\nالولاية: ${getWilayaName(order.wilaya) || order.wilaya}\n\nيرجى تأكيد عنوان الشحن لكي نقوم بإرسال الطلبية في أقرب وقت.\n\nشكراً لاختيارك Sn Shop16 💕`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold hover:bg-green-600 transition-colors"
                            >
                              تأكيد عبر واتساب 💬
                            </a>
                          )}
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(order.id, e.target.value)
                              }
                              disabled={updatingStatus === order.id}
                              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs appearance-none pr-6 focus:outline-none focus:ring-1 focus:ring-pink-500"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.labelAr}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
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

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                تفاصيل الطلب {selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">اسم العميل</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="font-medium text-gray-900" dir="ltr">
                    {selectedOrder.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">الولاية</p>
                  <p className="font-medium text-gray-900">
                    {getWilayaName(selectedOrder.wilaya) || selectedOrder.wilaya}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">نوع التوصيل</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.deliveryType === "office"
                      ? "مكتب التوصيل"
                      : "المنزل"}
                  </p>
                </div>
                {selectedOrder.address && (
                  <div className="col-span-2 space-y-1">
                    <p className="text-xs text-gray-500">العنوان</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.address}
                    </p>
                  </div>
                )}
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    المنتجات
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {item.nameAr}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.size && `${item.size} `}
                            {item.color && `/ ${item.color}`}
                            {` × ${item.quantity}`}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  الإجمالي
                </span>
                <span className="text-lg font-bold text-pink-600">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>

              {selectedOrder.notes && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">ملاحظات</p>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-xl">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-gray-500">تحديث الحالة</p>
                <div className="flex gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() =>
                        handleStatusUpdate(selectedOrder.id, status.value)
                      }
                      disabled={selectedOrder.status === status.value}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedOrder.status === status.value
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {status.labelAr}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" />
                طباعة الطلب
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
