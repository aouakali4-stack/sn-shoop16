import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { ALGERIA_WILAYAS } from "@/constants/algeriaWilayas";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("RECEIVED_ORDER_BODY:", JSON.stringify(body, null, 2));

    const { customerName, phoneNumber, wilaya, commune, deliveryType, address, notes, shippingCost, subtotal, total, paymentMethod, items } = body;

    const order = await prisma.order.create({
      data: {
        customerName: customerName || "زبون",
        phoneNumber: phoneNumber || "",
        wilaya: wilaya || "غير محدد",
        commune: commune || "",
        deliveryType: deliveryType || "home",
        address: address || null,
        notes: notes || null,
        shippingCost: Number(shippingCost) || 0,
        subtotal: Number(subtotal) || 0,
        total: Number(total) || 0,
        status: "new",
        paymentMethod: paymentMethod || "cod",
        items: {
          create: items.map((item: any) => ({
            productName: item.name || item.productName || "منتج",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            size: item.size || "",
            color: item.color || "",
          }))
        }
      }
    });

    const orderNumber = generateOrderNumber();

    return NextResponse.json({
      order: { ...order, orderNumber },
      message: "تم إنشاء الطلب بنجاح",
    }, { status: 201 });
  } catch (error: any) {
    console.error("PRISMA_CREATE_ORDER_ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
