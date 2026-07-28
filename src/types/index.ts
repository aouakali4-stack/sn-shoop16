export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
  price?: number | null;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  isActive: boolean;
  products?: Product[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  productName: string;
  orderId: string;
  productId?: string | null;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  wilaya: string;
  commune: string;
  deliveryType: string;
  address?: string | null;
  shippingCost: number;
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  notes?: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRate {
  id: string;
  wilayaCode: string;
  wilayaName: string;
  homePrice: number;
  officePrice: number;
}

export interface Banner {
  id: string;
  title: string;
  titleAr?: string | null;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  image: string;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  stock: number;
}

export interface StoreSettings {
  storeName: string;
  storeNameAr: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
}
