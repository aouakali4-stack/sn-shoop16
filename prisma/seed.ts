import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALGERIA_WILAYAS } from "../src/constants/algeriaWilayas";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      password: hashedPassword,
      name: "مدير المتجر",
    },
  });
  console.log(`Admin created: ${admin.username}`);

  const categories = [
    {
      name: "Fasatin",
      nameAr: "فساتين",
      slug: "fasatin",
      description: "فساتين نسائية أنيقة لمختلف المناسبات",
      sortOrder: 1,
    },
    {
      name: "Abayat",
      nameAr: "عبايات",
      slug: "abayat",
      description: "عبايات مودرن بأحدث التصاميم",
      sortOrder: 2,
    },
    {
      name: "Casual",
      nameAr: "ملابس كاجوال",
      slug: "casual",
      description: "ملابس يومية مريحة وأنيقة",
      sortOrder: 3,
    },
    {
      name: "Accessories",
      nameAr: "إكسسوارات",
      slug: "accessories",
      description: "إكسسوارات نسائية مميزة",
      sortOrder: 4,
    },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`Category created: ${category.nameAr}`);
  }

  const fasatinCategory = await prisma.category.findUnique({ where: { slug: "fasatin" } });
  const abayatCategory = await prisma.category.findUnique({ where: { slug: "abayat" } });
  const casualCategory = await prisma.category.findUnique({ where: { slug: "casual" } });
  const accessoriesCategory = await prisma.category.findUnique({ where: { slug: "accessories" } });

  const sampleProducts = [
    {
      name: "Elegant Evening Dress",
      nameAr: "فستان سهرة أنيق",
      slug: "fustan-sehra-aneeq",
      description: "فستان سهرة أنيق من قماش الساتان الفاخر، مثالي للمناسبات الخاصة والحفلات. تصميم أنيق يجمع بين الكلاسيكية والعصرية مع تفاصيل راقية تخطف الأنظار.",
      price: 8500,
      comparePrice: 12000,
      stock: 15,
      categoryId: fasatinCategory!.id,
      isFeatured: true,
      salesCount: 45,
      variants: [
        { size: "S", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 5 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "XL", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "XXL", color: "أسود", colorHex: "#000000", stock: 2 },
        { size: "S", color: "أحمر", colorHex: "#DC2626", stock: 2 },
        { size: "M", color: "أحمر", colorHex: "#DC2626", stock: 3 },
        { size: "L", color: "أحمر", colorHex: "#DC2626", stock: 2 },
        { size: "XL", color: "أحمر", colorHex: "#DC2626", stock: 1 },
        { size: "S", color: "كحلي", colorHex: "#1E3A5F", stock: 2 },
        { size: "M", color: "كحلي", colorHex: "#1E3A5F", stock: 3 },
        { size: "L", color: "كحلي", colorHex: "#1E3A5F", stock: 2 },
      ],
    },
    {
      name: "Casual Summer Dress",
      nameAr: "فستان صيفي كاجوال",
      slug: "fustan-sayfi-casual",
      description: "فستان صيفي خفيف ومريح من قماش القطن الناعم، مناسب للخروجات اليومية والتسوق. متوفر بعدة ألوان زاهية تناسب فصل الصيف.",
      price: 4500,
      comparePrice: 5500,
      stock: 25,
      categoryId: fasatinCategory!.id,
      isFeatured: true,
      salesCount: 78,
      variants: [
        { size: "S", color: "وردي", colorHex: "#EC4899", stock: 5 },
        { size: "M", color: "وردي", colorHex: "#EC4899", stock: 7 },
        { size: "L", color: "وردي", colorHex: "#EC4899", stock: 6 },
        { size: "XL", color: "وردي", colorHex: "#EC4899", stock: 4 },
        { size: "XXL", color: "وردي", colorHex: "#EC4899", stock: 3 },
        { size: "S", color: "أزرق", colorHex: "#2563EB", stock: 3 },
        { size: "M", color: "أزرق", colorHex: "#2563EB", stock: 5 },
        { size: "L", color: "أزرق", colorHex: "#2563EB", stock: 4 },
        { size: "XL", color: "أزرق", colorHex: "#2563EB", stock: 3 },
        { size: "S", color: "أبيض", colorHex: "#FFFFFF", stock: 3 },
        { size: "M", color: "أبيض", colorHex: "#FFFFFF", stock: 4 },
        { size: "L", color: "أبيض", colorHex: "#FFFFFF", stock: 3 },
      ],
    },
    {
      name: "Modern Abaya",
      nameAr: "عباية مودرن",
      slug: "abaya-modern",
      description: "عباية مودرن بتصميم عصري وأنيق، مناسبة للاستخدام اليومي والمناسبات. قماش فاخر وcuts عصرية تجمع بين الأناقة والراحة.",
      price: 6000,
      comparePrice: 8000,
      stock: 20,
      categoryId: abayatCategory!.id,
      isFeatured: true,
      salesCount: 92,
      variants: [
        { size: "S", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 6 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 5 },
        { size: "XL", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "XXL", color: "أسود", colorHex: "#000000", stock: 2 },
        { size: "S", color: "كحلي", colorHex: "#1E3A5F", stock: 3 },
        { size: "M", color: "كحلي", colorHex: "#1E3A5F", stock: 4 },
        { size: "L", color: "كحلي", colorHex: "#1E3A5F", stock: 3 },
        { size: "XL", color: "كحلي", colorHex: "#1E3A5F", stock: 2 },
      ],
    },
    {
      name: "Abaya with Embroidery",
      nameAr: "عباية مطرزة",
      slug: "abaya-mtirza",
      description: "عباية فاخرة بتطريز يدوي أنيق على الكتف والياقة، تناسب المناسبات الخاصة والأعراس. تطريز ذهبي على قماش أسود فاخر.",
      price: 12000,
      comparePrice: 15000,
      stock: 10,
      categoryId: abayatCategory!.id,
      isFeatured: true,
      salesCount: 34,
      variants: [
        { size: "S", color: "أسود", colorHex: "#000000", stock: 2 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "XL", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "XXL", color: "أسود", colorHex: "#000000", stock: 2 },
      ],
    },
    {
      name: "Casual T-Shirt",
      nameAr: "تيشيرت كاجوال",
      slug: "tshirt-casual",
      description: "تيشيرت قطني مريح بتصميم عصري وقصة فضفاضة، مناسب للإطلالات اليومية. قماش قطني 100% مريح طوال اليوم.",
      price: 2500,
      comparePrice: 3000,
      stock: 40,
      categoryId: casualCategory!.id,
      isFeatured: false,
      salesCount: 120,
      variants: [
        { size: "S", color: "أبيض", colorHex: "#FFFFFF", stock: 5 },
        { size: "M", color: "أبيض", colorHex: "#FFFFFF", stock: 8 },
        { size: "L", color: "أبيض", colorHex: "#FFFFFF", stock: 7 },
        { size: "XL", color: "أبيض", colorHex: "#FFFFFF", stock: 5 },
        { size: "XXL", color: "أبيض", colorHex: "#FFFFFF", stock: 3 },
        { size: "S", color: "وردي", colorHex: "#EC4899", stock: 4 },
        { size: "M", color: "وردي", colorHex: "#EC4899", stock: 6 },
        { size: "L", color: "وردي", colorHex: "#EC4899", stock: 5 },
        { size: "XL", color: "وردي", colorHex: "#EC4899", stock: 3 },
        { size: "S", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 5 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 4 },
      ],
    },
    {
      name: "Jeans Pants",
      nameAr: "بنطلون جينز",
      slug: "banatlon-jeans",
      description: "بنطلون جينز نسائي بقصة مريحة وتصميم عصري. جينز ممتاز المقاومة مع مرونة مريحة. مناسب للمواعيد اليومية والخروجات.",
      price: 3500,
      comparePrice: 4200,
      stock: 30,
      categoryId: casualCategory!.id,
      isFeatured: false,
      salesCount: 67,
      variants: [
        { size: "S", color: "أزرق", colorHex: "#2563EB", stock: 5 },
        { size: "M", color: "أزرق", colorHex: "#2563EB", stock: 8 },
        { size: "L", color: "أزرق", colorHex: "#2563EB", stock: 7 },
        { size: "XL", color: "أزرق", colorHex: "#2563EB", stock: 5 },
        { size: "XXL", color: "أزرق", colorHex: "#2563EB", stock: 3 },
        { size: "S", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "XL", color: "أسود", colorHex: "#000000", stock: 3 },
      ],
    },
    {
      name: "Gold Necklace Set",
      nameAr: "طقم عقد ذهبي",
      slug: "taqem-aqd-dhahbi",
      description: "طقم عقد مكون من 3 قطع (عقد + سوار + أقراط) بتصميم أنيق وعصري. مطلي بالذهب عالي الجودة لا يسبب الحساسية.",
      price: 5500,
      comparePrice: 7000,
      stock: 15,
      categoryId: accessoriesCategory!.id,
      isFeatured: true,
      salesCount: 28,
      variants: [
        { size: "S", color: "ذهبي", colorHex: "#D4A574", stock: 4 },
        { size: "M", color: "ذهبي", colorHex: "#D4A574", stock: 5 },
        { size: "L", color: "ذهبي", colorHex: "#D4A574", stock: 4 },
        { size: "S", color: "فضي", colorHex: "#C0C0C0", stock: 3 },
        { size: "M", color: "فضي", colorHex: "#C0C0C0", stock: 4 },
        { size: "L", color: "فضي", colorHex: "#C0C0C0", stock: 3 },
      ],
    },
    {
      name: "Elegant Handbag",
      nameAr: "حقيبة يد أنيقة",
      slug: "haqiba-yad-aneeqa",
      description: "حقيبة يد جلد فاخرة بتصميم أنيق وعملي. م Interior واسع مع عدة جيوب لتنظيم أغراضك. مثالية للخروجات اليومية والعمل.",
      price: 7000,
      comparePrice: 9000,
      stock: 12,
      categoryId: accessoriesCategory!.id,
      isFeatured: true,
      salesCount: 55,
      variants: [
        { size: "S", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "M", color: "أسود", colorHex: "#000000", stock: 4 },
        { size: "L", color: "أسود", colorHex: "#000000", stock: 3 },
        { size: "S", color: "بني", colorHex: "#92400E", stock: 3 },
        { size: "M", color: "بني", colorHex: "#92400E", stock: 3 },
        { size: "L", color: "بني", colorHex: "#92400E", stock: 2 },
        { size: "S", color: "أحمر", colorHex: "#DC2626", stock: 2 },
        { size: "M", color: "أحمر", colorHex: "#DC2626", stock: 2 },
        { size: "L", color: "أحمر", colorHex: "#DC2626", stock: 2 },
      ],
    },
  ];

  const productImages: Record<string, string[]> = {
    "fustan-sehra-aneeq": [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    ],
    "fustan-sayfi-casual": [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop",
    ],
    "abaya-modern": [
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
    ],
    "abaya-mtirza": [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    ],
    "tshirt-casual": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec190fc?q=80&w=800&auto=format&fit=crop",
    ],
    "banatlon-jeans": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop",
    ],
    "taqem-aqd-dhahbi": [
      "https://images.unsplash.com/photo-1515562141589-67f0d569b6c3?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    ],
    "haqiba-yad-aneeqa": [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
    ],
  };

  for (const productData of sampleProducts) {
    const { variants, ...productFields } = productData;

    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existing) {
      console.log(`Product already exists: ${productData.nameAr}`);
      continue;
    }

    const urls = productImages[productData.slug] || [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
    ];

    const product = await prisma.product.create({
      data: {
        ...productFields,
        images: {
          create: urls.map((url, i) => ({
            url,
            alt: productData.nameAr,
            sortOrder: i,
          })),
        },
        variants: {
          create: variants.map((v) => ({
            ...v,
            stock: v.stock,
          })),
        },
      },
    });
    console.log(`Product created: ${product.nameAr}`);
  }

  for (const wilaya of ALGERIA_WILAYAS) {
    await prisma.shippingRate.upsert({
      where: { wilayaCode: wilaya.code },
      update: {
        homePrice: wilaya.homePrice,
        officePrice: wilaya.officePrice,
      },
      create: {
        wilayaCode: wilaya.code,
        wilayaName: wilaya.nameAr,
        homePrice: wilaya.homePrice,
        officePrice: wilaya.officePrice,
      },
    });
  }
  console.log("Shipping rates seeded for all 58 wilayas");

  await prisma.banner.upsert({
    where: { id: "default-banner" },
    update: {},
    create: {
      id: "default-banner",
      title: "Welcome to Sn Shop16",
      titleAr: "مرحباً بكم في Sn Shop16",
      subtitle: "أحدث صيحات الموضة النسائية في الجزائر",
      image: "/uploads/banners/default-banner.jpg",
      isActive: true,
      sortOrder: 0,
    },
  });
  console.log("Default banner created");

  const settings = [
    { key: "storeName", value: "Sn Shop16" },
    { key: "storeNameAr", value: "Sn Shop16" },
    { key: "logo", value: "/logo.svg" },
    { key: "phone", value: "0555555555" },
    { key: "email", value: "info@snshop16.dz" },
    { key: "address", value: "الجزائر العاصمة" },
  ];

  for (const setting of settings) {
    await prisma.storeSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Store settings created");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
