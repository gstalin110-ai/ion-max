import { supabase } from "./supabase";
import { Listing, ListingFormData, Profile, Wallet, Order, Role, OrderItem, Payment, ShippingAddress, CheckoutFormData, PaymentMethod, PaymentStatus, OrderStatus } from "./types";

// ========== FUNCIONES DE LISTINGS ==========

export async function getListings() {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      categories!inner(name),
      profiles!inner(username, avatar_url)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Listing[];
}

export async function getListingsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Listing[];
}

export async function getListing(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      categories!inner(name),
      profiles!inner(username, avatar_url, full_name)
    `)
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error) throw new Error(error.message);
  return data as Listing;
}

export async function createListing(formData: ListingFormData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { error, data } = await supabase.from("listings").insert([
    {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      location: formData.location,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images,
      status: "pending_review",
    },
  ]).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateListing(id: string, formData: ListingFormData) {
  const { error, data } = await supabase
    .from("listings")
    .update({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      location: formData.location,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

// ========== FUNCIONES DE PROFILES ==========

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error, data } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ========== FUNCIONES DE WALLET ==========

export async function getWallet(userId: string) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Wallet;
}

// ========== FUNCIONES DE ROLES ==========

export async function getUserRole(userId: string): Promise<string> {
  // Primero intentar obtener el rol desde profiles.role (sistema unificado)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profileError && profile?.role) {
    return profile.role;
  }

  // Si no existe en profiles, intentar desde user_roles (sistema relacional)
  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      roles (
        name
      )
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.roles) return "user"; // Default role
  return (data.roles as any).name;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin" || role === "owner";
}

export async function isOwner(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "owner";
}

// ========== FUNCIONES DE AUTENTICACIÓN ==========

export async function signIn(email: string) {
  // Envia un magic link / OTP al email proporcionado
  const { data, error } = await supabase.auth.signInWithOtp({ email });

  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return user;
}

// ========== FUNCIONES DE ÓRDENES Y PAGOS ==========

export async function createOrder(
  buyerId: string,
  sellerId: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  totalAmount: number
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      status: "pending",
      total_amount: totalAmount,
      shipping_address: JSON.stringify(shippingAddress),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Crear items de la orden
  const orderItems = items.map(item => ({
    order_id: data.id,
    listing_id: item.listing_id,
    listing_title: item.listing_title,
    listing_image: item.listing_image,
    quantity: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
  }));

  await supabase.from("order_items").insert(orderItems);

  return data as Order;
}

export async function createPayment(
  orderId: string,
  paymentMethod: PaymentMethod,
  amount: number
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: orderId,
      payment_method: paymentMethod,
      payment_status: "pending",
      amount: amount,
      currency: "USD",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update({
      payment_status: status,
      transaction_id: transactionId,
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      payments (*)
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Order[];
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      payments (*)
    `)
    .eq("id", orderId)
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

export async function processRefund(orderId: string, reason: string): Promise<void> {
  // Actualizar estado del pago
  const { data: order } = await supabase
    .from("orders")
    .select("payments")
    .eq("id", orderId)
    .single();

  if (order?.payments) {
    const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
    await updatePaymentStatus(payment.id, "refunded");
  }

  // Actualizar estado de la orden
  await updateOrderStatus(orderId, "refunded");

  // Crear registro de reembolso
  await supabase.from("refunds").insert({
    order_id: orderId,
    reason,
    status: "processed",
  });
}

// ========== FUNCIONES DE ADMINISTRACIÓN ==========

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function banUser(userId: string, reason: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ 
      banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function unbanUser(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ 
      banned: false,
      ban_reason: null,
      banned_at: null
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function setUserRole(userId: string, role: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function getAllListingsAdmin() {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      categories!inner(name),
      profiles!inner(username, avatar_url, full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function approveListing(listingId: string) {
  const { error } = await supabase
    .from("listings")
    .update({ status: "active" })
    .eq("id", listingId);

  if (error) throw new Error(error.message);
}

export async function rejectListing(listingId: string, reason: string) {
  const { error } = await supabase
    .from("listings")
    .update({ 
      status: "rejected",
      rejection_reason: reason
    })
    .eq("id", listingId);

  if (error) throw new Error(error.message);
}

export async function getAllOrdersAdmin() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      payments (*),
      buyer:profiles!buyer_id(full_name, email),
      seller:profiles!seller_id(full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSystemStats() {
  const [usersCount, listingsCount, ordersCount, revenue] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("payment_status", "completed")
  ]);

  const totalRevenue = revenue.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  return {
    users: usersCount.count || 0,
    listings: listingsCount.count || 0,
    orders: ordersCount.count || 0,
    revenue: totalRevenue
  };
}

export async function getRecentActivity() {
  const [recentListings, recentOrders, recentUsers] = await Promise.all([
    supabase.from("listings").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(10),
    supabase.from("orders").select("*, buyer:profiles(full_name), seller:profiles(full_name)").order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10)
  ]);

  return {
    listings: recentListings.data || [],
    orders: recentOrders.data || [],
    users: recentUsers.data || []
  };
}

// ========== FUNCIONES DE ENCUESTAS (SURVEY) ==========

export async function getAllSurveys() {
  const { data, error } = await supabase
    .from("survey_responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
