export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  banner?: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  parent?: string | null;
  children?: Category[];
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
  isThumbnail: boolean;
  displayOrder: number;
}

export interface ProductSpec {
  key: string;
  value: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: Category | string;
  subCategory?: Category | string;
  brand?: Brand | string;
  shortDescription?: string;
  description?: string;
  specifications: ProductSpec[];
  features: string[];
  highlights: string[];
  images: ProductImage[];
  videoUrl?: string;
  regularPrice: number;
  salePrice?: number;
  gstPercentage: number;
  stockQuantity: number;
  maxOrderQuantity: number;
  warranty?: string;
  deliveryInfo?: string;
  seoTitle?: string;
  metaDescription?: string;
  codAvailable: boolean;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  requiresSubscription: boolean;
  requiresInstallation: boolean;
  comparable: boolean;
  vehicleCompatibility: string[];
  whatsInTheBox: string[];
  faqs: ProductFaq[];
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  createdAt: string;
}

export interface ProductVariant {
  _id: string;
  product: string;
  sku: string;
  attributes: { name: string; value: string }[];
  price: number;
  salePrice?: number;
  stockQuantity: number;
  images: string[];
  status: 'active' | 'inactive';
}

export interface CartLine {
  itemId: string;
  product: string;
  variant?: string;
  name: string;
  slug: string;
  image?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  regularPrice: number;
  gstPercentage: number;
  maxOrderQuantity: number;
  availableStock: number;
  requiresInstallation: boolean;
  requiresSubscription: boolean;
  codAvailable: boolean;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
  savedForLater: boolean;
  stockOk: boolean;
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCharge: number;
  codCharge: number;
  totalAmount: number;
  couponCode?: string;
  couponError?: string;
  itemCount: number;
}

export interface Address {
  _id: string;
  label: 'home' | 'work' | 'other';
  name: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: string;
  variant?: string;
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  price: number;
  regularPrice: number;
  gstPercentage: number;
  taxAmount: number;
  lineTotal: number;
  requiresInstallation: boolean;
  requiresSubscription: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharge: number;
  codCharge: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'online' | 'cod' | 'qr_manual';
  paymentStatus: string;
  paymentScreenshotUrl?: string;
  orderStatus: string;
  statusHistory: { status: string; note?: string; changedAt: string }[];
  courier?: string;
  trackingNumber?: string;
  invoiceNumber?: string;
  placedAt: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  mobileVerified: boolean;
  emailVerified: boolean;
  referralCode: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  createdAt: string;
}

export interface HomepageSection {
  _id: string;
  key: string;
  title?: string;
  subtitle?: string;
  image?: string;
  buttonText?: string;
  buttonLink?: string;
  config: Record<string, unknown>;
  enabled: boolean;
  displayOrder: number;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
  ctaText?: string;
  ctaUrl?: string;
  displayOrder: number;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  category: { _id: string; name: string; slug: string } | string;
  author: string;
  featuredImage: string;
  excerpt?: string;
  content?: string;
  tags: string[];
  status: string;
  featured: boolean;
  publishedAt?: string;
  readingTimeMinutes: number;
  views: number;
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Review {
  _id: string;
  product: string;
  user: { name: string; avatarUrl?: string } | string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ExpertReview {
  _id: string;
  name: string;
  designation?: string;
  profileImage?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  language: string;
  description: string;
  displayOrder: number;
}

export interface Offer {
  _id: string;
  title: string;
  type: string;
  discountValue?: number;
  bannerImage?: string;
  applicableProducts: Product[];
  applicableCategories: Category[];
  endDate: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface CmsPage {
  _id: string;
  slug: string;
  title: string;
  content: string;
  seoTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}
