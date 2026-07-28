"use client";

import { useState } from "react";
import { Key, Save, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors";
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

export default function AdminPasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!currentPassword || !newPassword) {
      setError("يرجى ملء جميع الحقول");
      return;
    }

    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  };

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
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">تغيير كلمة المرور</h1>
            <p className="text-sm text-gray-500">حدّث كلمة مرور حسابك</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          تم تغيير كلمة المرور بنجاح
        </div>
      )}

      <div className="bg-white border border-gray-200 p-6 space-y-5">
        <div>
          <label className={labelClass}>كلمة المرور الحالية</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            placeholder="أدخل كلمة المرور الحالية"
          />
        </div>
        <div>
          <label className={labelClass}>كلمة المرور الجديدة</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            placeholder="أدخل كلمة المرور الجديدة"
          />
        </div>
        <div>
          <label className={labelClass}>تأكيد كلمة المرور الجديدة</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="أعد إدخال كلمة المرور الجديدة"
          />
        </div>
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
              جاري التحديث...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              تحديث كلمة المرور
            </>
          )}
        </button>
      </div>
    </div>
  );
}
