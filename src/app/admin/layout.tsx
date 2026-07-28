"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Store,
  MessageSquare,
  HeadphonesIcon,
  Ticket,
  Tag,
  ChevronDown,
  User,
  Key,
  CheckCheck,
  ShoppingCart as OrderIcon,
  ShieldAlert,
  AlertTriangle,
  Info,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/products",
    label: "المنتجات",
    icon: Package,
  },
  {
    href: "/admin/categories",
    label: "الفئات",
    icon: Tag,
  },
  {
    href: "/admin/orders",
    label: "الطلبات",
    icon: ShoppingCart,
  },
  {
    href: "/admin/messages",
    label: "المحادثات",
    icon: MessageSquare,
  },
  {
    href: "/admin/complaints",
    label: "الشكاوى",
    icon: HeadphonesIcon,
  },
  {
    href: "/admin/coupons",
    label: "الكوبونات",
    icon: Ticket,
  },
  {
    href: "/admin/settings",
    label: "إعدادات",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "order":
        return <OrderIcon className="w-4 h-4 text-blue-500" />;
      case "security":
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case "stock":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50" dir="rtl">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-64 bg-zinc-900
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm leading-tight">Sn Shop16</h1>
                <p className="text-slate-500 text-[10px] tracking-wide">ADMIN</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <Store className="w-[18px] h-[18px] flex-shrink-0" />
              <span>المتجر</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 w-full"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 left-1 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-800">الإشعارات</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        تحديد الكل كمقروء
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        لا توجد إشعارات
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <div className="mt-0.5 p-1.5 rounded-full bg-slate-100">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.isRead ? "font-semibold text-slate-800" : "font-medium text-slate-600"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-300 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString("ar-DZ")}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors border-r border-slate-200"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-800">SN SHOP16</p>
                  <p className="text-xs text-slate-400">admin@snshop16.dz</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">SN SHOP16</p>
                    <p className="text-xs text-slate-400">admin@snshop16.dz</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/admin/settings/profile");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      تعديل الملف الشخصي
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/admin/settings/password");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      تغيير كلمة المرور
                    </button>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
