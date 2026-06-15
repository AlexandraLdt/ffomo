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
  const [showCalendar, setShowCalendar] = useState(false);
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

      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-50 px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between"
        style={{
          background: "rgba(10, 4, 22, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-3">
          <a href="/" style={{ textDecoration: "none" }}>
            <h1
              className="text-5xl font-black tracking-tight"
              style={{ color: "var(--accent)", letterSpacing: "-0.04em" }}
            >
              FFOMO
            </h1>
          </a>
          <span
            className="text-xs font-semibold tracking-widest uppercase hidden sm:block"
            style={{ color: "var(--text-muted)" }}
          >
            Frankfurt
          </span>
        </div>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: showCalendar ? "var(--accent)" : "var(--bg-card)",
            color: showCalendar ? "white" : "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          <span>📅</span>
          <span className="hidden sm:inline">Jump to date</span>
        </button>
      </header>

      {/* ── Calendar dropdown ── */}
      {showCalendar && (
        <div
          className="px-6 md:px-12 lg:px-20 py-6"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Jump to a date
          </p>
          <div className="max-w-sm">
            <Calendar
              eventDates={eventDates}
              onDateSelect={(date) => {
                setShowCalendar(false);
                router.push(`/day/${date}`);
              }}
            />
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 lg:px-20 pt-10 pb-8">
        <p className="text-lg font-semibold leading-tight" style={{ color: "var(--text)" }}>
          Your city. Every event.
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
          Lectures · Culture · Activities · Cinema — updated daily.
        </p>
      </section>

      {/* ── Filter pills ── */}
      <section className="px-6 md:px-12 lg:px-20 pb-8">
        <div className="flex gap-2">
          <button
            onClick={() => setView("categories")}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              background: view === "categories" ? "var(--accent)" : "var(--bg-card)",
              color: view === "categories" ? "white" : "var(--text-muted)",
              border: "1px solid " + (view === "categories" ? "var(--accent)" : "var(--border)"),
            }}
          >
            By Category
          </button>
          <button
            onClick={() => setView("days")}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              background: view === "days" ? "var(--accent)" : "var(--bg-card)",
              color: view === "days" ? "white" : "var(--text-muted)",
              border: "1px solid " + (view === "days" ? "var(--accent)" : "var(--border)"),
            }}
          >
            By Day
          </button>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="flex-1 px-6 md:px-12 lg:px-20 pb-16">
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
        className="px-6 md:px-12 lg:px-20 py-6"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>FFOMO</span>
          <p className="text-xs">
            Event data scraped daily from Frankfurt institution websites. Click any event to visit the source.
          </p>
          <a href="/admin" className="text-xs" style={{ color: "var(--text-dim)" }}>Admin & Monitoring</a>
        </div>
      </footer>
    </main>
  );
}
