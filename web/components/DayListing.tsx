"use client";

import Link from "next/link";
import { Event } from "@/lib/types";
import EventCard from "./EventCard";

interface DayGroup {
  date: string;
  label: string;
  events: Event[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface DayListingProps {
  dayGroups: DayGroup[];
}

export default function DayListing({ dayGroups }: DayListingProps) {
  const nonEmpty = dayGroups.filter((g) => g.events.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <p className="text-lg font-semibold">No upcoming events found.</p>
        <p className="text-sm mt-1">Check back soon — the calendar updates daily.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {nonEmpty.map(({ date, events }) => (
        <section key={date}>
          {/* Day header */}
          <div className="flex items-center gap-4 mb-5">
            <Link
              href={`/day/${date}`}
              className="group flex items-baseline gap-2.5 hover:opacity-80 transition-opacity"
              style={{ textDecoration: "none" }}
            >
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {formatDateLabel(date)}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {formatShortDate(date)}
              </span>
            </Link>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            {events.length > 3 && (
              <Link
                href={`/day/${date}`}
                className="text-xs font-semibold shrink-0 transition-colors hover:text-white"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                +{events.length - 3} more →
              </Link>
            )}
          </div>

          {/* Event cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
