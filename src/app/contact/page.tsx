"use client";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ customerName: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("جاري الإرسال...");

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
        setFormData({ customerName: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      setStatus("حدث خطأ في الاتصال.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-16 p-8 bg-white rounded-xl shadow-sm border border-gray-100" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">خدمة العملاء والشكاوى</h1>
      <p className="text-center text-gray-500 mb-8">نحن هنا للاستماع إليك. يرجى ملء النموذج أدناه وسنقوم بالرد عليك في أقرب وقت.</p>

      <form onSubmit={handleSubmit} className="space-y-6 text-right">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
          <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
          <input type="tel" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-left" dir="ltr" placeholder="05XX XX XX XX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
          <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تفاصيل الرسالة / الشكوى</label>
          <textarea required rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white p-4 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400">
          {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
        {status && (
          <p className={`text-center mt-4 font-medium ${status.includes("بنجاح") ? "text-green-600" : "text-red-600"}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
