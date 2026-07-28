import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminMessages() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 w-full max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">💬 سجل محادثات زبائن Sn Shop16</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b font-semibold text-gray-700">التاريخ</th>
              <th className="p-4 border-b font-semibold text-gray-700">سؤال الزبون</th>
              <th className="p-4 border-b font-semibold text-gray-700">رد المساعد الذكي</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  لا توجد محادثات حتى الآن.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b text-sm text-gray-500 w-1/5 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleString("ar-DZ")}
                  </td>
                  <td className="p-4 border-b text-gray-900 font-medium w-1/3">
                    {msg.userMessage}
                  </td>
                  <td className="p-4 border-b text-gray-600 w-auto text-sm leading-relaxed">
                    {msg.botReply}
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
