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

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string | null;
  created_at: string;
  expires_at: string;
  author?: CommunityMember | null;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: CommunityMember | null;
  receiver?: CommunityMember | null;
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

// ========== FUNCIONES DE HISTORIAS ==========

export async function getActiveStories(): Promise<Story[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("stories")
    .select("id, user_id, image_url, caption, created_at, expires_at, profiles:user_id ( id, email, full_name, bio, profession, avatar_url )")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data ?? []).map((story) => {
    const raw = story as {
      id: string;
      user_id: string;
      image_url: string;
      caption?: string | null;
      created_at: string;
      expires_at: string;
      profiles?: CommunityMember | CommunityMember[] | null;
    };
    const author = Array.isArray(raw.profiles) ? raw.profiles[0] ?? null : raw.profiles ?? null;
    return {
      id: raw.id,
      user_id: raw.user_id,
      image_url: raw.image_url,
      caption: raw.caption,
      created_at: raw.created_at,
      expires_at: raw.expires_at,
      author,
    };
  });
}

export async function createStory(userId: string, imageUrl: string, caption?: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expira en 24 horas

  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: userId,
      image_url: imageUrl,
      caption,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== FUNCIONES DE SOLICITUDES DE AMISTAD ==========

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const { data, error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status, created_at, sender:sender_id ( id, email, full_name, bio, profession, avatar_url ), receiver:receiver_id ( id, email, full_name, bio, profession, avatar_url )")
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data ?? []).map((req) => {
    const raw = req as {
      id: string;
      sender_id: string;
      receiver_id: string;
      status: "pending" | "accepted" | "rejected";
      created_at: string;
      sender?: CommunityMember | CommunityMember[] | null;
      receiver?: CommunityMember | CommunityMember[] | null;
    };
    const sender = Array.isArray(raw.sender) ? raw.sender[0] ?? null : raw.sender ?? null;
    const receiver = Array.isArray(raw.receiver) ? raw.receiver[0] ?? null : raw.receiver ?? null;
    return {
      id: raw.id,
      sender_id: raw.sender_id,
      receiver_id: raw.receiver_id,
      status: raw.status,
      created_at: raw.created_at,
      sender,
      receiver,
    };
  });
}

export async function respondToFriendRequest(requestId: string, status: "accepted" | "rejected") {
  const { data, error } = await supabase
    .from("friend_requests")
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFriends(userId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from("friend_requests")
    .select("sender_id, receiver_id")
    .or(`and(sender_id.eq.${userId},status.eq.accepted),and(receiver_id.eq.${userId},status.eq.accepted)`);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  const friendIds = new Set<string>();
  for (const row of data ?? []) {
    const friendId = row.sender_id === userId ? row.receiver_id : row.sender_id;
    friendIds.add(friendId);
  }

  if (friendIds.size === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at")
    .in("id", Array.from(friendIds));

  if (profileError) {
    if (isMissingTableError(profileError)) return [];
    throw profileError;
  }

  return profiles ?? [];
}

// ========== ALGORITMO SIMPLE DE RECOMENDACIÓN ==========

export async function getRecommendedUsers(userId: string): Promise<CommunityMember[]> {
  // Algoritmo simple: recomienda usuarios con misma profesión o bio similar
  const myProfile = await getMyProfile(userId);
  if (!myProfile) return [];

  const allMembers = await getCommunityMembers(userId);
  
  // Puntuar usuarios basado en similitud
  const scored = allMembers.map(member => {
    let score = 0;
    
    // Misma profesión = +50 puntos
    if (myProfile.profession && member.profession === myProfile.profession) {
      score += 50;
    }
    
    // Profesión similar (contiene palabras clave) = +20 puntos
    if (myProfile.profession && member.profession) {
      const myProf = myProfile.profession.toLowerCase();
      const memberProf = member.profession.toLowerCase();
      if (myProf.includes(memberProf) || memberProf.includes(myProf)) {
        score += 20;
      }
    }
    
    // Bio similar = +10 puntos
    if (myProfile.bio && member.bio) {
      const myBioWords = myProfile.bio.toLowerCase().split(/\s+/);
      const memberBioWords = member.bio.toLowerCase().split(/\s+/);
      const commonWords = myBioWords.filter(word => memberBioWords.includes(word));
      score += commonWords.length * 5;
    }
    
    return { member, score };
  });
  
  // Ordenar por puntuación y devolver top 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.member);
}
