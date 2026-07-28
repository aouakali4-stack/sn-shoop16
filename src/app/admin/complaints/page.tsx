import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminComplaints() {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 w-full max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">🎧 خدمة العملاء والشكاوى</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b font-semibold text-gray-700">التاريخ</th>
              <th className="p-4 border-b font-semibold text-gray-700">الزبون (رقم الهاتف)</th>
              <th className="p-4 border-b font-semibold text-gray-700">الموضوع</th>
              <th className="p-4 border-b font-semibold text-gray-700">الرسالة / الشكوى</th>
              <th className="p-4 border-b font-semibold text-gray-700">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  لا توجد شكاوى أو رسائل حالياً.
                </td>
              </tr>
            ) : (
              complaints.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b text-sm text-gray-500 whitespace-nowrap">
                    {new Date(comp.createdAt).toLocaleString("ar-DZ")}
                  </td>
                  <td className="p-4 border-b text-gray-900 font-medium">
                    {comp.customerName} <br />
                    <span className="text-sm text-blue-600 dir-ltr">{comp.phone}</span>
                  </td>
                  <td className="p-4 border-b text-gray-900 font-semibold">
                    {comp.subject}
                  </td>
                  <td className="p-4 border-b text-gray-600 text-sm leading-relaxed max-w-xs">
                    {comp.message}
                  </td>
                  <td className="p-4 border-b">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        comp.status === "جديدة"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
