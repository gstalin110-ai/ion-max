import { supabase } from "@/src/lib/supabase/client";

interface MaybeError {
  message?: unknown;
}

function isMissingTableError(error: unknown) {
  const message = typeof error === "object" && error !== null && "message" in error
    ? String((error as MaybeError).message ?? "")
    : "";

  return (
    message.includes("does not exist") ||
    message.includes("relation \"") ||
    message.includes("no existe")
  );
}

async function countTable(table: string, filter?: Record<string, string | number | boolean>) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
        query = query.eq(key, value);
      }
    }
  }

  const { count, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }

  return count ?? 0;
}

function parseNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
  return 0;
}

export interface WalletSummary {
  availableBalance: number;
  heldBalance: number;
  pendingBalance: number;
  income: number;
  commissions: number;
  hasData: boolean;
}

export interface DashboardStats {
  products: number;
  services: number;
  courses: number;
  messages: number;
  favorites: number;
  orders: number;
  sales: number;
  wallet: WalletSummary;
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user?.id) return {
    availableBalance: 0,
    heldBalance: 0,
    pendingBalance: 0,
    income: 0,
    commissions: 0,
    hasData: false,
  };

  const tables = ["wallets", "wallet"];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").eq("user_id", user.id).single();
    if (error) {
      if (isMissingTableError(error)) continue;
      return {
        availableBalance: 0,
        heldBalance: 0,
        pendingBalance: 0,
        income: 0,
        commissions: 0,
        hasData: false,
      };
    }

    if (!data) continue;
    const row = data as Record<string, unknown>;

    return {
      availableBalance: parseNumber(row.available_balance ?? row.balance ?? 0),
      heldBalance: parseNumber(row.held_balance ?? row.retained_balance ?? 0),
      pendingBalance: parseNumber(row.pending_balance ?? 0),
      income: parseNumber(row.income ?? row.total_income ?? 0),
      commissions: parseNumber(row.commissions ?? row.fees ?? 0),
      hasData: true,
    };
  }

  return {
    availableBalance: 0,
    heldBalance: 0,
    pendingBalance: 0,
    income: 0,
    commissions: 0,
    hasData: false,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  const [products, services, courses, messages, favorites, orders, sales, wallet] = await Promise.all([
    countTable("listings", { status: "active", category_name: "SHOP" }),
    countTable("listings", { status: "active", category_name: "SERVICES" }),
    countTable("listings", { status: "active", category_name: "ACADEMY" }),
    user?.id ? countTable("messages", { receiver_id: user.id }) : Promise.resolve(0),
    user?.id ? countTable("favorites", { user_id: user.id }) : Promise.resolve(0),
    user?.id ? countTable("orders", { buyer_id: user.id }) : Promise.resolve(0),
    user?.id ? countTable("sales", { seller_id: user.id }) : Promise.resolve(0),
    getWalletSummary(),
  ]);

  return {
    products,
    services,
    courses,
    messages,
    favorites,
    orders,
    sales,
    wallet,
  };
}
