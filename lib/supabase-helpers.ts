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
      seller_id: user.id,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      location: formData.location,
      tags: formData.tags ? [formData.tags] : [],
      images: formData.images,
      status: "active",
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

// ========== FUNCIONES DE MÉTODOS DE PAGO DEL VENDEDOR ==========

export async function getSellerPaymentMethods() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("seller_payment_methods")
    .select("*")
    .eq("seller_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addSellerPaymentMethod(paymentMethod: {
  type: 'payment_link' | 'qr_code';
  provider: string;
  label: string;
  value: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  // Verificar límite de 5 por tipo
  const { count } = await supabase
    .from("seller_payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .eq("type", paymentMethod.type)
    .eq("is_active", true);

  if (count && count >= 5) {
    throw new Error(`Máximo 5 métodos de pago de tipo ${paymentMethod.type === 'payment_link' ? 'enlace' : 'QR'} permitidos`);
  }

  const { error, data } = await supabase
    .from("seller_payment_methods")
    .insert([{
      seller_id: user.id,
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      label: paymentMethod.label,
      value: paymentMethod.value,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSellerPaymentMethod(id: string, updates: {
  label?: string;
  value?: string;
  is_active?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { error, data } = await supabase
    .from("seller_payment_methods")
    .update(updates)
    .eq("id", id)
    .eq("seller_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSellerPaymentMethod(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { error } = await supabase
    .from("seller_payment_methods")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) throw new Error(error.message);
}

export async function getSellerPaymentMethodsBySellerId(sellerId: string) {
  const { data, error } = await supabase
    .from("seller_payment_methods")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ========== FUNCIONES DE FACTURACIÓN ELECTRÓNICA ==========

export async function createInvoice(invoiceData: {
  order_id: string;
  seller_id: string;
  buyer_id: string;
  subtotal: number;
  seller_ruc?: string;
  seller_razon_social?: string;
  seller_address?: string;
  seller_phone?: string;
  seller_email?: string;
  buyer_ruc?: string;
  buyer_razon_social?: string;
  buyer_address?: string;
  buyer_phone?: string;
  buyer_email?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  // Generar número de factura único
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;
  const invoice_number = `ION-${year}${month}${day}-${random}`;

  // Calcular IVA (12% Ecuador)
  const tax_amount = invoiceData.subtotal * 0.12;
  const total_amount = invoiceData.subtotal + tax_amount;

  const { error, data } = await supabase
    .from("invoices")
    .insert([{
      invoice_number,
      order_id: invoiceData.order_id,
      seller_id: invoiceData.seller_id,
      buyer_id: invoiceData.buyer_id,
      subtotal: invoiceData.subtotal,
      tax_amount,
      total_amount,
      currency: 'USD',
      seller_ruc: invoiceData.seller_ruc,
      seller_razon_social: invoiceData.seller_razon_social,
      seller_address: invoiceData.seller_address,
      seller_phone: invoiceData.seller_phone,
      seller_email: invoiceData.seller_email,
      buyer_ruc: invoiceData.buyer_ruc,
      buyer_razon_social: invoiceData.buyer_razon_social,
      buyer_address: invoiceData.buyer_address,
      buyer_phone: invoiceData.buyer_phone,
      buyer_email: invoiceData.buyer_email,
      status: 'pending',
      owner_reference: true,
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getInvoiceById(invoiceId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getInvoicesBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getInvoicesByBuyer(buyerId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateInvoiceUrls(invoiceId: string, pdfUrl: string, xmlUrl?: string) {
  const { error } = await supabase
    .from("invoices")
    .update({
      pdf_url: pdfUrl,
      xml_url: xmlUrl,
      status: 'generated',
    })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
}

export async function markInvoiceAsSent(invoiceId: string) {
  const { error } = await supabase
    .from("invoices")
    .update({ status: 'sent' })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
}

// ========== FUNCIONES DE TICKETS Y QUEJAS ==========

export async function createSupportTicket(ticketData: {
  type: 'complaint' | 'issue' | 'suggestion' | 'other';
  category: string;
  subject: string;
  description: string;
  related_entity_type?: string;
  related_entity_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  // Generar número de ticket único
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 90000) + 10000;
  const ticket_number = `TKT-${year}${month}${day}-${random}`;

  const { error, data } = await supabase
    .from("support_tickets")
    .insert([{
      user_id: user.id,
      ticket_number,
      type: ticketData.type,
      category: ticketData.category,
      subject: ticketData.subject,
      description: ticketData.description,
      related_entity_type: ticketData.related_entity_type,
      related_entity_id: ticketData.related_entity_id,
      priority: ticketData.priority || 'medium',
      status: 'open',
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserTickets() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getTicketById(ticketId: string) {
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTicketMessages(ticketId: string) {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function addTicketMessage(ticketId: string, message: string, isOwner: boolean = false) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  const { error, data } = await supabase
    .from("ticket_messages")
    .insert([{
      ticket_id: ticketId,
      sender_id: user.id,
      is_owner: isOwner,
      message,
      attachments: [],
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed') {
  const { error } = await supabase
    .from("support_tickets")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'resolved' || status === 'closed' ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);
}

export async function updateTicketOwnerNotes(ticketId: string, notes: string) {
  const { error } = await supabase
    .from("support_tickets")
    .update({ owner_notes: notes })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);
}
