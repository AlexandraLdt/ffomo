import { Event, CATEGORIES } from "@/lib/types";
import { getFallbackImage } from "@/lib/fallbackImages";

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

function formatCardDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const cat = CATEGORIES[event.category];
  const imageUrl = event.imageUrl || getFallbackImage(event.category, event.id, event.title, event.description ?? "");

  return (
    <a
      href={event.eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ background: "var(--bg-card)", textDecoration: "none" }}
    >
      {/* Blurred background image — subtle texture, not the main focus */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          filter: "blur(18px)",
          transform: "scale(1.15)",
          opacity: 0.18,
        }}
      />

      {/* Dark card overlay keeps text readable */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, var(--bg-card) 40%, transparent 100%)" }}
      />

      {/* Category accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: cat.color }}
      />

      {/* Content */}
      <div className={`relative ${compact ? "p-3" : "p-4 pt-5"}`}>
        {/* Date + time */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            {formatCardDate(event.startDate)}
          </span>
          {event.startTime && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              · {event.startTime}
            </span>
          )}
        </div>

        <h3
          className={`font-bold leading-snug line-clamp-2 mb-1.5 group-hover:text-[var(--accent)] transition-colors ${compact ? "text-sm" : "text-[15px]"}`}
          style={{ color: "var(--text)" }}
        >
          {event.title}
        </h3>

        <p className="text-xs truncate mb-2" style={{ color: "var(--text-muted)" }}>
          {event.venueName}
        </p>

        {event.description && !compact && (
          <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-dim)" }}>
            {event.description}
          </p>
        )}

        <div className="mt-3">
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: cat.color + "1A", color: cat.color }}
          >
            {cat.icon} {cat.label}
          </span>
        </div>
      </div>
    </a>
  );
}
