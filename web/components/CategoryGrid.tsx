"use client";

import Link from "next/link";
import { CATEGORIES, Category } from "@/lib/types";

const CATEGORY_IMAGES: Record<Category, string> = {
  lectures: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  culture: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  activities: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
  cinema: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
};

export default function CategoryGrid() {
  const categories = Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map(([slug, cat]) => (
        <Link
          key={slug}
          href={`/category/${slug}`}
          className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col justify-end"
          style={{ textDecoration: "none" }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${CATEGORY_IMAGES[slug]})` }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Category accent top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
            style={{ background: cat.color }}
          />
          {/* Content */}
          <div className="relative p-4">
            <div className="text-3xl mb-2">{cat.icon}</div>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              {cat.label}
            </h3>
            <p className="text-white/70 text-xs">
              {cat.description}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/90 group-hover:text-white transition-colors">
              Explore
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
