"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Pause, ChevronLeft, ChevronRight, ShoppingCart, Plus, Heart, MessageCircle, Flame, Bookmark, Share2 } from "lucide-react";
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
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState<Set<string>>(new Set());

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

  const toggleLike = (storyId: string) => {
    setLikedStories(prev => {
      const updated = new Set(prev);
      if (updated.has(storyId)) {
        updated.delete(storyId);
      } else {
        updated.add(storyId);
      }
      return updated;
    });
  };

  const toggleBookmark = (storyId: string) => {
    setBookmarkedStories(prev => {
      const updated = new Set(prev);
      if (updated.has(storyId)) {
        updated.delete(storyId);
      } else {
        updated.add(storyId);
      }
      return updated;
    });
  };

  // Simular progreso de la historia
  useEffect(() => {
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
  }, [activeStory, isPlaying]);

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

                {/* Story Info Premium */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-black text-white">
                      {stories[activeStory].title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-white text-lg">Vendedor Premium</p>
                        <div className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-black text-yellow-400">
                          <Flame className="h-3 w-3" />
                          <span>Top</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 flex items-center gap-2">
                        Hace 2 horas · 1.2K vistas
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4">{stories[activeStory].title}</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => toggleLike(stories[activeStory].id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                        likedStories.has(stories[activeStory].id)
                          ? "bg-red-500 text-white"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedStories.has(stories[activeStory].id) ? "fill-white" : ""}`} />
                      {Math.floor(Math.random() * 500) + 100}
                    </button>
                    <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition">
                      <MessageCircle className="h-4 w-4" />
                      {Math.floor(Math.random() * 50) + 10}
                    </button>
                    <button
                      onClick={() => toggleBookmark(stories[activeStory].id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                        bookmarkedStories.has(stories[activeStory].id)
                          ? "bg-yellow-400 text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {stories[activeStory].type === "product" && (
                    <Link
                      href={stories[activeStory].link || "#"}
                      onClick={closeStory}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-3 text-sm font-black text-black hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] transition"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Ver producto
                    </Link>
                  )}
                  {stories[activeStory].type === "promotion" && (
                    <Link
                      href={stories[activeStory].link || "#"}
                      onClick={closeStory}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-400 to-red-500 px-8 py-3 text-sm font-black text-white hover:shadow-[0_0_30px_rgba(248,113,113,0.5)] transition"
                    >
                      <Flame className="h-4 w-4" />
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
