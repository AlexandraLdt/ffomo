"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getEventsByDate } from "@/lib/api";
import { Event, Category, CATEGORIES } from "@/lib/types";
import EventCard from "@/components/EventCard";

function formatDateHeading(dateStr: string): { label: string; sub: string } {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const full = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (d.getTime() === today.getTime()) return { label: "Today", sub: full };
  if (d.getTime() === tomorrow.getTime()) return { label: "Tomorrow", sub: full };
  return { label: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }), sub: String(d.getFullYear()) };
}

const CATEGORY_ORDER: Category[] = ["lectures", "culture", "activities", "cinema"];

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { label, sub } = formatDateHeading(date);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventsByDate(date).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [date]);

  // Group events by category, in fixed order
  const eventsByCategory: Partial<Record<Category, Event[]>> = {};
  for (const e of events) {
    if (!eventsByCategory[e.category]) eventsByCategory[e.category] = [];
    eventsByCategory[e.category]!.push(e);
  }
  const presentCategories = CATEGORY_ORDER.filter((c) => eventsByCategory[c]?.length);

  const d = new Date(date + "T00:00:00");
  const prevDate = new Date(d); prevDate.setDate(d.getDate() - 1);
  const nextDate = new Date(d); nextDate.setDate(d.getDate() + 1);
  const prevStr = prevDate.toISOString().split("T")[0];
  const nextStr = nextDate.toISOString().split("T")[0];
  const todayStr = new Date().toISOString().split("T")[0];

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
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              Events on
            </p>
            <h1 className="text-4xl font-black" style={{ color: "var(--text)", letterSpacing: "-0.03em" }}>
              {label}
            </h1>
            <p className="mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
          <div className="flex items-center gap-2">
            {date > todayStr && (
              <Link
                href={`/day/${prevStr}`}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none" }}
              >
                ← Previous day
              </Link>
            )}
            <Link
              href={`/day/${nextStr}`}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)", textDecoration: "none" }}
            >
              Next day →
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-10">
        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            Loading events…
          </div>
        ) : presentCategories.length === 0 ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">No events found for this date.</p>
            <p className="text-sm mt-2">Try another day, or check back as more events are added.</p>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: "var(--accent)", color: "white", textDecoration: "none" }}
            >
              Back to calendar
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              {events.length} event{events.length !== 1 ? "s" : ""} across {presentCategories.length} categor{presentCategories.length !== 1 ? "ies" : "y"}
            </p>
            <div className="space-y-10">
              {presentCategories.map((cat) => {
                const catInfo = CATEGORIES[cat];
                const catEvents = eventsByCategory[cat]!;
                return (
                  <section key={cat}>
                    <div className="flex items-center gap-3 mb-4">
                      <Link
                        href={`/category/${cat}`}
                        className="flex items-center gap-2 text-xl font-bold transition-colors hover:opacity-80"
                        style={{ color: "var(--text)", textDecoration: "none" }}
                      >
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </Link>
                      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                        {catEvents.length} event{catEvents.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {catEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
