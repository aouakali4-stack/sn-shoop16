export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  homePrice: number;
  officePrice: number;
}

export const ALGERIA_WILAYAS: Wilaya[] = [
  { code: "01", name: "Adrar", nameAr: "أدرار", homePrice: 700, officePrice: 600 },
  { code: "02", name: "Chlef", nameAr: "الشلف", homePrice: 500, officePrice: 400 },
  { code: "03", name: "Laghouat", nameAr: "الأغواط", homePrice: 600, officePrice: 500 },
  { code: "04", name: "Oum El Bouaghi", nameAr: "أم البواقي", homePrice: 500, officePrice: 400 },
  { code: "05", name: "Batna", nameAr: "باتنة", homePrice: 500, officePrice: 400 },
  { code: "06", name: "Béjaïa", nameAr: "بجاية", homePrice: 500, officePrice: 400 },
  { code: "07", name: "Biskra", nameAr: "بسكرة", homePrice: 500, officePrice: 400 },
  { code: "08", name: "Béchar", nameAr: "بشار", homePrice: 700, officePrice: 600 },
  { code: "09", name: "Blida", nameAr: "البليدة", homePrice: 400, officePrice: 350 },
  { code: "10", name: "Bouira", nameAr: "البويرة", homePrice: 450, officePrice: 400 },
  { code: "11", name: "Tamanrasset", nameAr: "تمنراست", homePrice: 800, officePrice: 700 },
  { code: "12", name: "Tébessa", nameAr: "تبسة", homePrice: 550, officePrice: 450 },
  { code: "13", name: "Tlemcen", nameAr: "تلمسان", homePrice: 500, officePrice: 400 },
  { code: "14", name: "Tiaret", nameAr: "تيارت", homePrice: 500, officePrice: 400 },
  { code: "15", name: "Tizi Ouzou", nameAr: "تيزي وزو", homePrice: 400, officePrice: 350 },
  { code: "16", name: "Alger", nameAr: "الجزائر", homePrice: 350, officePrice: 300 },
  { code: "17", name: "Djelfa", nameAr: "الجلفة", homePrice: 550, officePrice: 450 },
  { code: "18", name: "Jijel", nameAr: "جيجل", homePrice: 500, officePrice: 400 },
  { code: "19", name: "Sétif", nameAr: "سطيف", homePrice: 450, officePrice: 400 },
  { code: "20", name: "Saïda", nameAr: "سعيدة", homePrice: 550, officePrice: 450 },
  { code: "21", name: "Skikda", nameAr: "سكيكدة", homePrice: 500, officePrice: 400 },
  { code: "22", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس", homePrice: 550, officePrice: 450 },
  { code: "23", name: "Annaba", nameAr: "عنابة", homePrice: 500, officePrice: 400 },
  { code: "24", name: "Guelma", nameAr: "قالمة", homePrice: 500, officePrice: 400 },
  { code: "25", name: "Constantine", nameAr: "قسنطينة", homePrice: 450, officePrice: 400 },
  { code: "26", name: "Médéa", nameAr: "المدية", homePrice: 400, officePrice: 350 },
  { code: "27", name: "Mostaganem", nameAr: "مستغانم", homePrice: 500, officePrice: 400 },
  { code: "28", name: "M'sila", nameAr: "المسيلة", homePrice: 500, officePrice: 400 },
  { code: "29", name: "Mascara", nameAr: "معسكر", homePrice: 550, officePrice: 450 },
  { code: "30", name: "Ouargla", nameAr: "ورقلة", homePrice: 650, officePrice: 550 },
  { code: "31", name: "Oran", nameAr: "وهران", homePrice: 450, officePrice: 400 },
  { code: "32", name: "El Bayadh", nameAr: "البيض", homePrice: 600, officePrice: 500 },
  { code: "33", name: "Illizi", nameAr: "إليزي", homePrice: 800, officePrice: 700 },
  { code: "34", name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج", homePrice: 500, officePrice: 400 },
  { code: "35", name: "Boumerdès", nameAr: "بومرداس", homePrice: 400, officePrice: 350 },
  { code: "36", name: "El Tarf", nameAr: "الطارف", homePrice: 500, officePrice: 400 },
  { code: "37", name: "Tindouf", nameAr: "تندوف", homePrice: 800, officePrice: 700 },
  { code: "38", name: "Tissemsilt", nameAr: "تيسمسيلت", homePrice: 500, officePrice: 400 },
  { code: "39", name: "El Oued", nameAr: "الوادي", homePrice: 550, officePrice: 450 },
  { code: "40", name: "Khenchela", nameAr: "خنشلة", homePrice: 550, officePrice: 450 },
  { code: "41", name: "Souk Ahras", nameAr: "سوق أهراس", homePrice: 500, officePrice: 400 },
  { code: "42", name: "Tipaza", nameAr: "تيبازة", homePrice: 400, officePrice: 350 },
  { code: "43", name: "Mila", nameAr: "ميلة", homePrice: 500, officePrice: 400 },
  { code: "44", name: "Aïn Defla", nameAr: "عين الدفلى", homePrice: 450, officePrice: 400 },
  { code: "45", name: "Naâma", nameAr: "النعامة", homePrice: 600, officePrice: 500 },
  { code: "46", name: "Aïn Témouchent", nameAr: "عين تموشنت", homePrice: 500, officePrice: 400 },
  { code: "47", name: "Ghardaïa", nameAr: "غرداية", homePrice: 650, officePrice: 550 },
  { code: "48", name: "Relizane", nameAr: "غليزان", homePrice: 500, officePrice: 400 },
  { code: "49", name: "El M'Ghair", nameAr: "المغير", homePrice: 600, officePrice: 500 },
  { code: "50", name: "El Meniaa", nameAr: "المنيعة", homePrice: 650, officePrice: 550 },
  { code: "51", name: "Ouled Djellal", nameAr: "أولاد جلال", homePrice: 600, officePrice: 500 },
  { code: "52", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار", homePrice: 850, officePrice: 750 },
  { code: "53", name: "Béni Abbès", nameAr: "بني عباس", homePrice: 750, officePrice: 650 },
  { code: "54", name: "Timimoun", nameAr: "تيميمون", homePrice: 750, officePrice: 650 },
  { code: "55", name: "Touggourt", nameAr: "تقرت", homePrice: 650, officePrice: 550 },
  { code: "56", name: "Djanet", nameAr: "جانت", homePrice: 850, officePrice: 750 },
  { code: "57", name: "In Salah", nameAr: "إن صالح", homePrice: 800, officePrice: 700 },
  { code: "58", name: "In Guezzam", nameAr: "إن قزام", homePrice: 850, officePrice: 750 },
];

export const DELIVERY_TYPES = [
  { value: "home", labelAr: "التوصيل للمنزل", labelEn: "Home Delivery" },
  { value: "office", labelAr: "التوصيل للمكتب", labelEn: "Office Delivery" },
] as const;

export const ORDER_STATUSES = [
  { value: "new", labelAr: "جديد", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", labelAr: "قيد التأكيد", color: "bg-yellow-100 text-yellow-800" },
  { value: "shipped", labelAr: "تم الشحن", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", labelAr: "تم التسليم", color: "bg-green-100 text-green-800" },
  { value: "cancelled", labelAr: "ملغى", color: "bg-red-100 text-red-800" },
] as const;

export const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const PRODUCT_COLORS = [
  { name: "أسود", hex: "#000000" },
  { name: "أبيض", hex: "#FFFFFF" },
  { name: "أحمر", hex: "#DC2626" },
  { name: "أزرق", hex: "#2563EB" },
  { name: "وردي", hex: "#EC4899" },
  { name: "بنفسجي", hex: "#7C3AED" },
  { name: "أخضر", hex: "#16A34A" },
  { name: "أصفر", hex: "#EAB308" },
  { name: "برتقالي", hex: "#F97316" },
  { name: "بني", hex: "#92400E" },
  { name: "رمادي", hex: "#6B7280" },
  { name: "بيج", hex: "#D4A574" },
  { name: "نود", hex: "#E8D5C4" },
  { name: "كحلي", hex: "#1E3A5F" },
] as const;
