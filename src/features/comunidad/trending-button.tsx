"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrendingButton() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push("/trending")}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-4 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition"
    >
      <Flame className="h-6 w-6 text-white" />
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-0"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
