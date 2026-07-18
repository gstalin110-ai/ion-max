"use client";

import { useLanguage } from "@/src/contexts/language-context";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("es")}
        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
          language === "es"
            ? "bg-yellow-400 text-black"
            : "bg-white/10 text-zinc-400 hover:bg-white/20"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
          language === "en"
            ? "bg-yellow-400 text-black"
            : "bg-white/10 text-zinc-400 hover:bg-white/20"
        }`}
      >
        EN
      </button>
    </div>
  );
}
