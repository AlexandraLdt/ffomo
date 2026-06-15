"use client";

import Link from "next/link";
import { CATEGORIES, Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<Category, string> = {
  lectures: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
  culture: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80",
  activities: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  cinema: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
};

export default function CategoryGrid() {
  const categories = Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {categories.map(([slug, cat]) => (
        <Link
          key={slug}
          href={`/category/${slug}`}
          className="group relative overflow-hidden rounded-2xl flex flex-col items-center justify-center text-center"
          style={{ aspectRatio: "3/4", textDecoration: "none", border: "2px solid rgba(255,95,160,0.45)" }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${CATEGORY_IMAGES[slug]})` }}
          />

          {/* Strong vignette for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-black/20" />

          {/* Colour accent line at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: cat.color }}
          />

          {/* Centered content */}
          <div className="relative flex flex-col items-center justify-center px-4 gap-2">
            <div className="text-3xl mb-1">{cat.icon}</div>
            <h3
              className="text-white font-black uppercase leading-none tracking-tight"
              style={{
                fontSize: "clamp(1.25rem, 4vw, 1.75rem)",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {cat.label}
            </h3>
            <p
              className="text-white/70 text-xs leading-snug max-w-[90%]"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
            >
              {cat.description}
            </p>
            <div
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all duration-200 group-hover:gap-2"
              style={{ background: cat.color + "33", color: cat.color }}
            >
              Browse
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
