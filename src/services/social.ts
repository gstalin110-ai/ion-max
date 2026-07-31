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
  is_admin?: boolean;
  role?: string;
  ion_id?: string;
  username?: string;
  privacy_settings?: any;
  social_links?: any;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: CommunityMember | null;
  image_url?: string | null;
  images?: string[] | null;
  media_type?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
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
    .select("id, email, full_name, bio, profession, avatar_url, created_at, is_admin, role, ion_id, username, privacy_settings, social_links")
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
    .select("id, user_id, content, created_at, image_url, video_url, images, media_type, likes_count, comments_count")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  // Obtener profiles por separado para evitar FK errors
  const userIds = (data ?? []).map(post => post.user_id);
  const profilesMap = new Map<string, CommunityMember>();
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, bio, profession, avatar_url, created_at")
      .in("id", userIds);
    
    (profiles ?? []).forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
  }

  return (data ?? []).map((post) => ({
    id: post.id,
    user_id: post.user_id,
    content: post.content,
    created_at: post.created_at,
    image_url: post.image_url,
    images: post.images,
    media_type: post.media_type,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    author: profilesMap.get(post.user_id) || null,
  }));
}

export async function createCommunityPost(userId: string, content: string, imageUrl?: string, images?: string[]) {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({ 
      user_id: userId, 
      content,
      image_url: imageUrl,
      images,
      media_type: imageUrl || images?.length ? 'image' : 'text'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyPosts(userId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, user_id, content, created_at, image_url, video_url, images, media_type, likes_count, comments_count")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
}

export async function getMyProfile(userId: string): Promise<(CommunityMember & { gemini_api_key?: string }) | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, gemini_api_key, created_at, is_admin, role, ion_id, username, privacy_settings, social_links")
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
  updates: { full_name?: string; bio?: string; profession?: string; gemini_api_key?: string; username?: string; social_links?: any }
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

// ========== FUNCIONES DE LIKES Y COMENTARIOS PERSISTENTES ==========

export async function togglePostLike(postId: string, userId: string): Promise<{ liked: boolean }> {
  // Verificar si ya dio like
  const { data: existing } = await supabase
    .from("community_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("community_post_likes").delete().eq("id", existing.id);
    return { liked: false };
  } else {
    await supabase.from("community_post_likes").insert({ post_id: postId, user_id: userId });
    return { liked: true };
  }
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("community_post_likes")
    .select("user_id")
    .eq("post_id", postId);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return (data ?? []).map(l => l.user_id);
}

export async function addPostComment(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from("community_post_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select("*, profiles:user_id(id, full_name, avatar_url)")
    .single();

  if (error) throw error;
  return data;
}

export async function getPostComments(postId: string) {
  const { data, error } = await supabase
    .from("community_post_comments")
    .select("id, post_id, user_id, content, created_at, profiles:user_id(id, full_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  return data ?? [];
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

// ========== FUNCIONES DE SEGUIMIENTO (FOLLOWS) ==========

export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return false;
    throw error;
  }

  return !!data;
}

export async function getFollowers(userId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  const followerIds = (data ?? []).map(f => f.follower_id);
  if (followerIds.length === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at, is_admin, role, ion_id, username, privacy_settings, social_links")
    .in("id", followerIds);

  if (profileError) {
    if (isMissingTableError(profileError)) return [];
    throw profileError;
  }

  return profiles ?? [];
}

export async function getFollowing(userId: string): Promise<CommunityMember[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }

  const followingIds = (data ?? []).map(f => f.following_id);
  if (followingIds.length === 0) return [];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, bio, profession, avatar_url, created_at, is_admin, role, ion_id, username, privacy_settings, social_links")
    .in("id", followingIds);

  if (profileError) {
    if (isMissingTableError(profileError)) return [];
    throw profileError;
  }

  return profiles ?? [];
}

export async function getFriendsCount(userId: string): Promise<number> {
  // Amigos = personas que sigo y me siguen de vuelta (mutuo follow)
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) {
    if (isMissingTableError(error)) return 0;
    throw error;
  }

  const followingIds = (data ?? []).map(f => f.following_id);
  if (followingIds.length === 0) return 0;

  // Verificar cuántos de estos me siguen de vuelta
  const { data: mutualFollows, error: mutualError } = await supabase
    .from("follows")
    .select("follower_id")
    .in("follower_id", followingIds)
    .eq("following_id", userId);

  if (mutualError) {
    if (isMissingTableError(mutualError)) return 0;
    throw mutualError;
  }

  return (mutualFollows ?? []).length;
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
