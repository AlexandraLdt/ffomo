"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "@/components/Calendar";
import CategoryGrid from "@/components/CategoryGrid";
import DayListing from "@/components/DayListing";
import { getUpcomingEvents, getEventDates } from "@/lib/api";
import { Event } from "@/lib/types";

type View = "categories" | "days";

interface DayGroup {
  date: string;
  label: string;
  events: Event[];
}

function getUpcomingDates(days = 21): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function HomeClient() {
  const [view, setView] = useState<View>("categories");
  const [eventDates, setEventDates] = useState<Set<string>>(new Set());
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const [events, dates] = await Promise.all([
          getUpcomingEvents(21),
          getEventDates(90),
        ]);
        const groups = getUpcomingDates(21).map((date) => ({
          date,
          label: "",
          events: events.filter((e) => e.startDate === date),
        }));
        setDayGroups(groups);
        setEventDates(dates);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Hero ── */}
      <section
        className="relative flex flex-col lg:flex-row items-start justify-between gap-8 px-6 md:px-12 lg:px-20 pt-16 pb-12"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex-1 max-w-xl">
          <div className="mb-2">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--accent)" }}>
              Frankfurt
            </span>
          </div>
          <h1
            className="text-7xl md:text-8xl font-black tracking-tight leading-none mb-6"
            style={{ color: "var(--accent)", letterSpacing: "-0.04em" }}
          >
            FFOMO
          </h1>
          <p className="text-2xl md:text-3xl font-semibold leading-snug max-w-sm" style={{ color: "var(--text)" }}>
            Your city. Every event.
          </p>
          <p className="mt-4 text-base" style={{ color: "var(--text-muted)" }}>
            Lectures · Culture · Activities · Cinema — updated daily.
          </p>
        </div>

        <div
          className="shrink-0 rounded-2xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", width: 380 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Jump to a date
          </p>
          <Calendar eventDates={eventDates} onDateSelect={(date) => router.push(`/day/${date}`)} />
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="h-px" style={{ background: "var(--border)" }} />
      </div>

      {/* ── View Toggle + Content ── */}
      <section className="flex-1 px-6 md:px-12 lg:px-20 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "var(--border)" }}>
            <button
              onClick={() => setView("categories")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: view === "categories" ? "var(--accent)" : "transparent",
                color: view === "categories" ? "white" : "var(--text-muted)",
              }}
            >
              By Category
            </button>
            <button
              onClick={() => setView("days")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: view === "days" ? "var(--accent)" : "transparent",
                color: view === "days" ? "white" : "var(--text-muted)",
              }}
            >
              By Day
            </button>
          </div>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            {view === "categories" ? "Browse events by type" : "See what's coming up day by day"}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            Loading events…
          </div>
        ) : view === "categories" ? (
          <CategoryGrid />
        ) : (
          <DayListing dayGroups={dayGroups} />
        )}
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 md:px-12 lg:px-20 py-8 mt-8"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>FFOMO</span>
            <span className="text-sm ml-2">Frankfurt's event guide — updated daily</span>
          </div>
          <p className="text-xs">
            Event data is scraped automatically from institution websites. Click any event to visit the source.
          </p>
        </div>
      </footer>
    </main>
  );
}
