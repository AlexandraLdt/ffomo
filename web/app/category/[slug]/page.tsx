"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, Category, Event } from "@/lib/types";
import { getEventsByCategory } from "@/lib/api";
import EventCard from "@/components/EventCard";

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (!Object.keys(CATEGORIES).includes(slug)) notFound();

  const category = slug as Category;
  const cat = CATEGORIES[category];

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventsByCategory(category).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [category]);

  // Group events by date
  const eventsByDate: Record<string, Event[]> = {};
  for (const e of events) {
    if (!eventsByDate[e.startDate]) eventsByDate[e.startDate] = [];
    eventsByDate[e.startDate].push(e);
  }
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="px-6 md:px-12 lg:px-20 py-12" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-70"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          ← Back to FFOMO
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{cat.icon}</span>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              Category
            </p>
            <h1 className="text-4xl font-black" style={{ color: "var(--text)", letterSpacing: "-0.03em" }}>
              {cat.label}
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)" }}>{cat.description}</p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            Loading events…
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No upcoming events in this category.</p>
            <p className="text-sm mt-1">Check back soon — the calendar updates daily.</p>
          </div>
        ) : (
          <>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              {events.length} upcoming event{events.length !== 1 ? "s" : ""} across {sortedDates.length} day{sortedDates.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-10">
              {sortedDates.map((date) => (
                <section key={date}>
                  <div className="flex items-baseline gap-3 mb-4">
                    <Link
                      href={`/day/${date}`}
                      className="text-xl font-bold transition-colors hover:text-[var(--accent)]"
                      style={{ color: "var(--text)", textDecoration: "none" }}
                    >
                      {formatDayLabel(date)}
                    </Link>
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      · {formatShortDate(date)}
                    </span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                      {eventsByDate[date].length} event{eventsByDate[date].length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {eventsByDate[date].map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
