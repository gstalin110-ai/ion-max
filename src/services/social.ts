import { supabase } from "@/src/lib/supabase/client";

interface MaybeError {
  message?: unknown;
}

function isMissingTableError(error: unknown) {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as MaybeError).message ?? "")
      : "";
  return ["does not exist", "relation \"", "no existe"].some((f) => message.includes(f));
}

export interface CommunityMember {
  id: string;
  email?: string | null;
  full_name?: string | null;
  bio?: string | null;
  profession?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: CommunityMember | null;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export async function getCommunityMembers(excludeUserId?: string): Promise<CommunityMember[]> {
  let query = supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, content, created_at, profiles:user_id ( id, email, full_name, bio, profession, avatar_url )")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data ?? []).map((post) => {
    const raw = post as {
      id: string;
      user_id: string;
      content: string;
      created_at: string;
      profiles?: CommunityMember | CommunityMember[] | null;
    };
    const author = Array.isArray(raw.profiles) ? raw.profiles[0] ?? null : raw.profiles ?? null;
    return {
      id: raw.id,
      user_id: raw.user_id,
      content: raw.content,
      created_at: raw.created_at,
      author,
    };
  });
}

export async function createCommunityPost(userId: string, content: string) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({ user_id: userId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyProfile(userId: string): Promise<CommunityMember | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }

  return data;
}

export async function updateMyProfile(
  userId: string,
  updates: { full_name?: string; bio?: string; profession?: string }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function ensureProfile(userId: string, email: string, fullName?: string) {
  const existing = await getMyProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email,
      full_name: fullName ?? email.split("@")[0],
      active: true,
      role: "client",
    })
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }

  return data;
}

export async function getDirectMessages(
  userId: string,
  otherUserId: string
): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from("direct_messages")
    .select("id, sender_id, receiver_id, content, is_read, created_at")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function sendDirectMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("direct_messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationPartners(userId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from("direct_messages")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  const partnerIds = new Set<string>();
  for (const row of data ?? []) {
    const otherId = row.sender_id === userId ? row.receiver_id : row.sender_id;
    partnerIds.add(otherId);
  }

  if (partnerIds.size === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at")
    .in("id", Array.from(partnerIds));

  if (profileError) {
    if (isMissingTableError(profileError)) return [];
    throw profileError;
  }

  return profiles ?? [];
}
