import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export const productSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربية مطلوب"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "السعر يجب أن يكون أكبر من 0"),
  comparePrice: z.number().optional().nullable(),
  stock: z.number().min(0).default(0),
  categoryId: z.string().min(1, "القسم مطلوب"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        size: z.string(),
        color: z.string(),
        colorHex: z.string().optional(),
        stock: z.number().min(0).default(0),
        price: z.number().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

export const orderStatusSchema = z.object({
  status: z.enum(["new", "confirmed", "shipped", "delivered", "cancelled"]),
});

export const orderSchema = z.object({
  customerName: z.string().min(2, "الاسم الكامل مطلوب"),
  phoneNumber: z
    .string()
    .min(10, "رقم الهاتف غير صحيح")
    .max(10, "رقم الهاتف غير صحيح")
    .regex(/^0[5-7]\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 05 أو 06 أو 07"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  commune: z.string().min(2, "البلدية مطلوبة"),
  deliveryType: z.enum(["home", "office"]),
  address: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().min(1),
      })
    )
    .min(1, "السلة فارغة"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربية مطلوب"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const shippingRateSchema = z.object({
  wilayaCode: z.string(),
  wilayaName: z.string(),
  homePrice: z.number().min(0),
  officePrice: z.number().min(0),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  titleAr: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1, "الصورة مطلوبة"),
  link: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});
