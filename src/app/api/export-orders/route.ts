import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const rows = orders.map((order, index) => ({
      "رقم الطلب": index + 1,
      "تاريخ الطلب": new Date(order.createdAt).toLocaleDateString("ar-DZ"),
      "اسم الزبون": order.customerName,
      "رقم الهاتف": order.phoneNumber,
      "الولاية": order.wilaya,
      "البلدية": order.commune,
      "نوع التوصيل": order.deliveryType === "home" ? "منزل" : "مكتب",
      "تفاصيل المنتجات": order.items.map((item) => `${item.productName} (${item.size}/${item.color}) x${item.quantity}`).join(", "),
      "المجموع الفرعي": `${order.subtotal} د.ج`,
      "مصاريف الشحن": `${order.shippingCost} د.ج`,
      "الإجمالي": `${order.total} د.ج`,
      "طريقة الدفع": order.paymentMethod === "cod" ? "عند الاستلام" : order.paymentMethod,
      "الحالة": order.status,
      "ملاحظات": order.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الطلبات");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": 'attachment; filename="orders.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error: any) {
    console.error("Export orders error:", error);
    return NextResponse.json({ error: "فشل تصدير الطلبات" }, { status: 500 });
  }
}
