"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Pause, ChevronLeft, ChevronRight, ShoppingCart, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/supabase-helpers";

interface Story {
  id: string;
  type: "product" | "promotion";
  title: string;
  image: string;
  duration?: number;
  link?: string;
}

export function StoriesComponent() {
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: getListings,
  });

  // Crear stories de ejemplo con productos
  const stories: Story[] = [
    ...listings.slice(0, 5).map((listing) => ({
      id: listing.id,
      type: "product" as const,
      title: listing.title,
      image: listing.images?.[0] || "/placeholder.png",
      link: `/listing/${listing.id}`,
    })),
    {
      id: "promo-1",
      type: "promotion",
      title: "¡Oferta Especial!",
      image: "/placeholder.png",
      link: "/marketplace",
    },
  ];

  const handleStoryClick = (index: number) => {
    setActiveStory(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const closeStory = () => {
    setActiveStory(null);
    setProgress(0);
    setIsPlaying(false);
  };

  const nextStory = () => {
    if (activeStory !== null && activeStory < stories.length - 1) {
      setActiveStory(activeStory + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (activeStory !== null && activeStory > 0) {
      setActiveStory(activeStory - 1);
      setProgress(0);
    }
  };

  // Simular progreso de la historia
  useState(() => {
    let interval: NodeJS.Timeout;
    if (activeStory !== null && isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 1;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  });

  return (
    <>
      {/* STORIES BAR */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex-shrink-0">
          <button className="relative h-16 w-16 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:border-white/40 transition">
            <Plus className="h-6 w-6 text-zinc-400" />
          </button>
          <p className="mt-2 text-xs text-center text-zinc-500">Tu historia</p>
        </div>

        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => handleStoryClick(index)}
            className="flex-shrink-0 group"
          >
            <div className="relative h-16 w-16 rounded-full border-2 border-yellow-400 p-0.5">
              <div className="h-full w-full rounded-full overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                  unoptimized
                />
              </div>
              {story.type === "promotion" && (
                <div className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1">
                  <span className="text-[8px] font-black text-white">PROMO</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-center text-zinc-400 truncate w-16">
              {story.title.substring(0, 10)}...
            </p>
          </button>
        ))}
      </div>

      {/* STORY VIEWER */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closeStory}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full max-w-2xl max-h-[80vh] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                {stories.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: index === activeStory ? `${progress}%` : index < activeStory ? "100%" : "0%" }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={closeStory}
                className="absolute top-8 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation Buttons */}
              <button
                onClick={prevStory}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextStory}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Story Content */}
              <div className="relative h-full w-full rounded-3xl overflow-hidden">
                <Image
                  src={stories[activeStory].image}
                  alt={stories[activeStory].title}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Story Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                    <div>
                      <p className="font-black text-white">Vendedor Premium</p>
                      <p className="text-xs text-zinc-400">Hace 2 horas</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{stories[activeStory].title}</h3>
                  {stories[activeStory].type === "product" && (
                    <Link
                      href={stories[activeStory].link || "#"}
                      onClick={closeStory}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black hover:bg-zinc-200 transition"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Ver producto
                    </Link>
                  )}
                  {stories[activeStory].type === "promotion" && (
                    <Link
                      href={stories[activeStory].link || "#"}
                      onClick={closeStory}
                      className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-black text-black hover:bg-yellow-300 transition"
                    >
                      Ver ofertas
                    </Link>
                  )}
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-4 text-white hover:bg-black/70 transition"
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
