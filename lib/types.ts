// Tipos para todo el ecosistema de IÓN MAX

// ============ LISTINGS (PUBLICACIONES) ============
export type ListingStatus = "pending_review" | "active" | "paused" | "sold" | "deleted";
export type ListingCategory = "product" | "service" | "course" | "affiliate" | "job" | "business";

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  category_name?: string;
  status: ListingStatus;
  location?: string;
  tags?: string[];
  images: string[];
  view_count: number;
  rating?: number;
  review_count?: number;
  seller_id?: string;
  seller_name?: string;
  seller_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  location?: string;
  tags?: string;
  images: string[];
}

// ============ PROFILES ============
export interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  phone?: string;
  country?: string;
  province?: string;
  city?: string;
  address?: string;
  website?: string;
  email_verified: boolean;
  account_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// ============ ORDENS ============
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  order_items?: any[];
  payments?: any[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  listing_id: string;
  listing_title: string;
  listing_image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export type PaymentMethod = "credit_card" | "debit_card" | "paypal" | "stripe" | "bank_transfer" | "cash_on_delivery";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export interface CheckoutFormData {
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  save_payment_method?: boolean;
  notes?: string;
}

// ============ WALLET ============
export interface Wallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  retained_balance: number;
  total_income: number;
  total_commissions: number;
  created_at: string;
  updated_at: string;
}

export type TransactionType = "credit_sale" | "debit_withdrawal" | "credit_refund" | "debit_fee";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  reference_payment_id?: string;
  created_at: string;
}

// ============ WITHDRAWALS ============
export type WithdrawalStatus = "pending" | "approved" | "rejected";

export interface Withdrawal {
  id: string;
  wallet_id: string;
  amount_requested: number;
  status: WithdrawalStatus;
  payout_method: string;
  payout_details: Record<string, any>;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

// ============ MESSAGES ============
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text?: string;
  attachments: any[];
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
}

// ============ NOTIFICATIONS ============
export type NotificationType = "message" | "order_update" | "payment" | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}

// ============ REVIEWS ============
export interface Review {
  id: string;
  listing_id: string;
  reviewer_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  seller_response?: string;
  created_at: string;
  updated_at: string;
}

// ============ ROLES ============
export type UserRole = "user" | "admin" | "owner" | "moderator" | "support" | "marketplace_manager" | "services_manager" | "academy_manager" | "community_manager" | "financial_manager";

export interface Role {
  id: string;
  name: UserRole;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
}

// ============ CART (LOCALSTORAGE) ============
export interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  cantidad: number;
}

// ============ NUEVOS TIPOS DE SRC/TYPES/INDEX.TS ============
export type Category = "SHOP" | "ACADEMY" | "SERVICES" | "JOBS" | "BUSINESS";

export interface AppUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
}

// ============ FIN DE NUEVOS TIPOS ============

// ============ LEGACY (COMPATIBILIDAD) ============
export type Categoria = "SHOP" | "ACADEMY" | "SERVICES";

// Alias para compatibilidad con código existente
export interface Item extends Listing {
  categoria?: Categoria;
  etiqueta?: string;
  stock?: number;
  enlace_externo?: string;
  imagen_url?: string;
  nombre?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  images: string[];
  price: number;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminFormData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  location?: string;
  tags?: string;
  images: string[];
}

