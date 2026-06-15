"use client";

import Link from "next/link";
import { CATEGORIES, Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<Category, string> = {
  lectures: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  culture: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
  activities: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800&q=80",
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
          className="group relative overflow-hidden rounded-2xl flex flex-col justify-end"
          style={{ aspectRatio: "3/4", textDecoration: "none" }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${CATEGORY_IMAGES[slug]})` }}
          />

          {/* Layered gradient — strong at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

          {/* Colour accent line at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
            style={{ background: cat.color }}
          />

          {/* Content pinned to bottom */}
          <div className="relative px-4 pb-5 pt-0">
            <div className="text-2xl mb-1.5">{cat.icon}</div>
            <h3 className="text-white font-bold text-base leading-tight tracking-tight mb-0.5">
              {cat.label}
            </h3>
            <p className="text-white/60 text-xs leading-snug">
              {cat.description}
            </p>
            <div
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1 transition-all duration-200 group-hover:gap-2"
              style={{ background: cat.color + "22", color: cat.color }}
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
