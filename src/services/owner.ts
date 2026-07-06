import { supabase } from "@/src/lib/supabase/client";

interface MaybeError {
  message?: unknown;
}

function isMissingTableError(error: unknown) {
  const message = typeof error === "object" && error !== null && "message" in error
    ? String((error as MaybeError).message ?? "")
    : "";

  return ["does not exist", "relation \"", "no existe"].some((fragment) => message.includes(fragment));
}

async function countTable(table: string, filter?: Record<string, string | number | boolean>) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
  }

  const { count, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }

  return count ?? 0;
}

export interface OwnerProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  active?: boolean | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AuditLogEntry {
  id: string;
  action?: string | null;
  created_at?: string | null;
  actor?: string | null;
  details?: string | null;
}

export interface OwnerSummary {
  users: number;
  admins: number;
  activeUsers: number;
  listings: number;
  orders: number;
  sales: number;
  auditEntries: number;
  settingsCount: number;
}

export async function getOwnerSummary(): Promise<OwnerSummary> {
  const [users, admins, activeUsers, listings, orders, sales, auditEntries, settingsCount] = await Promise.all([
    countTable("profiles"),
    countTable("profiles", { role: "admin" }),
    countTable("profiles", { active: true }),
    countTable("listings"),
    countTable("orders"),
    countTable("sales"),
    countTable("audit_logs"),
    countTable("settings"),
  ]);

  return {
    users,
    admins,
    activeUsers,
    listings,
    orders,
    sales,
    auditEntries,
    settingsCount,
  };
}

export async function getOwnerUsers(): Promise<OwnerProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, active, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function getOwnerLogs(): Promise<AuditLogEntry[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, created_at, actor, details")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function updateUserRole(profileId: string, role: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);

  if (error) throw error;
}

export async function toggleUserActive(profileId: string, active: boolean) {
  const updateData: Record<string, boolean> = { active };
  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", profileId);

  if (error) {
    if (!isMissingTableError(error)) throw error;
  }
}
