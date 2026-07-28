"use client";

import { useState, useEffect } from "react";
import { User, Save, ArrowRight } from "lucide-react";
import Link from "next/link";

const inputClass =
  "w-full border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors";
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

export default function AdminProfilePage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.admin.name || "");
        setUsername(data.admin.username || "");
        setCreatedAt(data.admin.createdAt || "");
      }
    } catch {
      setError("فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى الإعدادات
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">تعديل الملف الشخصي</h1>
            <p className="text-sm text-gray-500">تحديث معلومات حسابك</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 space-y-5">
        <div>
          <label className={labelClass}>الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="اسم المدير"
          />
        </div>
        <div>
          <label className={labelClass}>اسم المستخدم</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
            placeholder="اسم المستخدم"
          />
        </div>
        {createdAt && (
          <div>
            <label className={labelClass}>تاريخ الإنشاء</label>
            <p className="text-sm text-gray-600 py-2.5">
              {new Date(createdAt).toLocaleDateString("ar-DZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : saved ? (
            <>
              <Save className="w-4 h-4" />
              تم الحفظ ✓
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
