"use client";

import React, { useState, useEffect } from "react";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/constants/algeriaWilayas";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Eye,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  newOrders: number;
  totalRevenue: number;
}

interface LowStockItem {
  productName: string;
  size: string;
  color: string;
  stock: number;
}

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
  total: number;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    newOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/admin/orders"),
          fetch("/api/admin/products"),
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] };

        const orders = ordersData.orders || ordersData || [];
        const products = productsData.products || productsData || [];

        const newOrdersCount = orders.filter(
          (o: Order) => o.status === "new"
        ).length;

        const totalRevenue = orders
          .filter((o: Order) => o.status !== "cancelled")
          .reduce((sum: number, o: Order) => sum + (o.total || 0), 0);

        const lowStock: LowStockItem[] = [];
        if (Array.isArray(products)) {
          for (const product of products) {
            if (product.variants && Array.isArray(product.variants)) {
              for (const variant of product.variants) {
                if (variant.stock < 3) {
                  lowStock.push({
                    productName: product.nameAr || product.name,
                    size: variant.size,
                    color: variant.color,
                    stock: variant.stock,
                  });
                }
              }
            }
          }
        }

        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          newOrders: newOrdersCount,
          totalRevenue,
        });

        setLowStockItems(lowStock);

        const sortedOrders = Array.isArray(orders)
          ? [...orders]
              .sort(
                (a: Order, b: Order) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5)
          : [];
        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const found = ORDER_STATUSES.find((s) => s.value === status);
    if (!found) return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          found.color
        )}
      >
        {found.labelAr}
      </span>
    );
  };

  const statCards = [
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts,
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "طلبات جديدة",
      value: stats.newOrders,
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: formatPrice(stats.totalRevenue),
      icon: LayoutDashboard,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
        <p className="text-sm text-slate-500 mt-0.5">مرحباً بك في لوحة إدارة Sn Shop16</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1.5">
                  {card.value}
                </p>
              </div>
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", card.iconBg)}>
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-700">تنبيه: مخزون منخفض</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-right py-3 px-5 font-medium text-slate-500">المنتج</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">المقاس</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">اللون</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">المخزون</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, index) => (
                  <tr key={index} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 px-5 text-slate-800 font-medium">{item.productName}</td>
                    <td className="py-3 px-5 text-slate-500">{item.size}</td>
                    <td className="py-3 px-5 text-slate-500">{item.color}</td>
                    <td className="py-3 px-5">
                      <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.stock} قطع
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">الطلبات الأخيرة</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            عرض الكل
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">لا توجد طلبات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-right py-3 px-5 font-medium text-slate-500">رقم الطلب</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">العميل</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">الولاية</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">المبلغ</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">الحالة</th>
                  <th className="text-right py-3 px-5 font-medium text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-5 font-mono text-xs font-medium text-slate-800">{order.orderNumber}</td>
                    <td className="py-3 px-5 text-slate-800">{order.customerName}</td>
                    <td className="py-3 px-5 text-slate-500">{order.wilaya}</td>
                    <td className="py-3 px-5 font-medium text-slate-800">{formatPrice(order.total)}</td>
                    <td className="py-3 px-5">{getStatusBadge(order.status)}</td>
                    <td className="py-3 px-5 text-slate-400 text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
