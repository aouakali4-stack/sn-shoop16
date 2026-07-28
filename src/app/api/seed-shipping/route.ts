import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wilayas = [
      { code: "01", name: "Adrar", home: 1200, desk: 800 },
      { code: "02", name: "Chlef", home: 600, desk: 400 },
      { code: "03", name: "Laghouat", home: 800, desk: 550 },
      { code: "04", name: "Oum El Bouaghi", home: 700, desk: 450 },
      { code: "05", name: "Batna", home: 700, desk: 450 },
      { code: "06", name: "Béjaïa", home: 600, desk: 400 },
      { code: "07", name: "Biskra", home: 850, desk: 600 },
      { code: "08", name: "Béchar", home: 1000, desk: 700 },
      { code: "09", name: "Blida", home: 500, desk: 350 },
      { code: "10", name: "Bouira", home: 600, desk: 400 },
      { code: "11", name: "Tamanrasset", home: 1400, desk: 1000 },
      { code: "12", name: "Tébessa", home: 750, desk: 500 },
      { code: "13", name: "Tlemcen", home: 650, desk: 450 },
      { code: "14", name: "Tiaret", home: 700, desk: 450 },
      { code: "15", name: "Tizi Ouzou", home: 600, desk: 400 },
      { code: "16", name: "Alger", home: 400, desk: 250 },
      { code: "17", name: "Djelfa", home: 750, desk: 500 },
      { code: "18", name: "Jijel", home: 650, desk: 450 },
      { code: "19", name: "Sétif", home: 650, desk: 450 },
      { code: "20", name: "Saïda", home: 700, desk: 450 },
      { code: "21", name: "Skikda", home: 650, desk: 450 },
      { code: "22", name: "Sidi Bel Abbès", home: 650, desk: 450 },
      { code: "23", name: "Annaba", home: 650, desk: 450 },
      { code: "24", name: "Guelma", home: 700, desk: 450 },
      { code: "25", name: "Constantine", home: 650, desk: 450 },
      { code: "26", name: "Médéa", home: 600, desk: 400 },
      { code: "27", name: "Mostaganem", home: 650, desk: 450 },
      { code: "28", name: "M'Sila", home: 700, desk: 450 },
      { code: "29", name: "Mascara", home: 650, desk: 450 },
      { code: "30", name: "Ouargla", home: 900, desk: 650 },
      { code: "31", name: "Oran", home: 600, desk: 400 },
      { code: "32", name: "El Bayadh", home: 850, desk: 600 },
      { code: "33", name: "Illizi", home: 1400, desk: 1000 },
      { code: "34", name: "Bordj Bou Arreridj", home: 650, desk: 450 },
      { code: "35", name: "Boumerdès", home: 500, desk: 350 },
      { code: "36", name: "El Tarf", home: 700, desk: 450 },
      { code: "37", name: "Tindouf", home: 1400, desk: 1000 },
      { code: "38", name: "Tissemsilt", home: 700, desk: 450 },
      { code: "39", name: "El Oued", home: 900, desk: 650 },
      { code: "40", name: "Khenchela", home: 750, desk: 500 },
      { code: "41", name: "Souk Ahras", home: 750, desk: 500 },
      { code: "42", name: "Tipaza", home: 500, desk: 350 },
      { code: "43", name: "Mila", home: 650, desk: 450 },
      { code: "44", name: "Aïn Defla", home: 600, desk: 400 },
      { code: "45", name: "Naâma", home: 850, desk: 600 },
      { code: "46", name: "Aïn Témouchent", home: 650, desk: 450 },
      { code: "47", name: "Ghardaïa", home: 900, desk: 650 },
      { code: "48", name: "Relizane", home: 650, desk: 450 },
      { code: "49", name: "Timimoun", home: 1200, desk: 850 },
      { code: "50", name: "Bordj Badji Mokhtar", home: 1500, desk: 1100 },
      { code: "51", name: "Ouled Djellal", home: 850, desk: 600 },
      { code: "52", name: "Béni Abbès", home: 1100, desk: 800 },
      { code: "53", name: "In Salah", home: 1300, desk: 950 },
      { code: "54", name: "In Guezzam", home: 1500, desk: 1100 },
      { code: "55", name: "Touggourt", home: 900, desk: 650 },
      { code: "56", name: "Djanet", home: 1400, desk: 1000 },
      { code: "57", name: "El M'Ghair", home: 900, desk: 650 },
      { code: "58", name: "El Meniaa", home: 950, desk: 700 },
    ];

    for (const w of wilayas) {
      await prisma.shippingRate.upsert({
        where: { wilayaCode: w.code },
        update: { homePrice: w.home, officePrice: w.desk, wilayaName: w.name },
        create: { wilayaCode: w.code, wilayaName: w.name, homePrice: w.home, officePrice: w.desk },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ أسعار الشحن لجميع الولايات الـ 58 بنجاح!",
    });
  } catch (error: any) {
    console.error("Shipping seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
