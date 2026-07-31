"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFollowers } from "@/src/services/social";
import { useAuth } from "@/src/contexts/auth-context";

export function RecommendationsComponent() {
  const { user } = useAuth();
  const router = useRouter();
  
  const { data: followers = [], isLoading } = useQuery({
    queryKey: ["followers"],
    queryFn: () => user ? getFollowers(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  const followersCount = followers.length;

  return (
    <motion.button
      onClick={() => router.push("/usuarios")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition"
    >
      <Users className="h-6 w-6 text-white" />
      {followersCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white border-2 border-black">
          {followersCount}
        </span>
      )}
    </motion.button>
  );
}
