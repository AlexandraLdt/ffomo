"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface CalendarProps {
  eventDates?: Set<string>;
  onDateSelect?: (date: string) => void;
}

export default function Calendar({ eventDates = new Set(), onDateSelect }: CalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const router = useRouter();

  const todayStr = now.toISOString().split("T")[0];
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const offset = (firstDay + 6) % 7; // Mon-first

  function handleDay(day: number) {
    const d = new Date(year, month, day);
    const str = d.toISOString().split("T")[0];
    if (onDateSelect) onDateSelect(str);
    else router.push(`/day/${str}`);
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="select-none w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--border)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-base font-bold tracking-wide" style={{ color: "var(--text)" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center rounded-full text-xl transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--border)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-center text-xs font-semibold py-1 tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const d = new Date(year, month, day);
          const str = d.toISOString().split("T")[0];
          const isToday = str === todayStr;
          const hasEvents = eventDates.has(str);
          const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());

          return (
            <button
              key={i}
              onClick={() => handleDay(day)}
              disabled={isPast}
              className="relative flex flex-col items-center justify-center rounded-xl text-sm transition-all"
              style={{
                height: 44,
                color: isPast ? "var(--border)" : isToday ? "white" : "var(--text)",
                background: isToday ? "var(--accent)" : "transparent",
                cursor: isPast ? "default" : "pointer",
                fontWeight: isToday ? 700 : 400,
              }}
              onMouseEnter={e => {
                if (!isPast && !isToday) e.currentTarget.style.background = "var(--border)";
              }}
              onMouseLeave={e => {
                if (!isPast && !isToday) e.currentTarget.style.background = "transparent";
              }}
            >
              {day}
              {hasEvents && !isPast && (
                <span
                  className="absolute bottom-1.5 w-1 h-1 rounded-full"
                  style={{ background: isToday ? "rgba(255,255,255,0.9)" : "var(--accent)" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
