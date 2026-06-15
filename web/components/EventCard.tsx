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
      className="group block rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      style={{ background: "var(--bg-card)", textDecoration: "none" }}
    >
      {/* Image / visual area */}
      <div className={`relative overflow-hidden ${compact ? "h-32" : "h-48"}`}>
        <img
          src={imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Date + time badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div
            className="rounded-lg px-2.5 py-1 flex items-center gap-1.5"
            style={{
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <span className="text-white text-xs font-semibold tracking-tight">
              {formatCardDate(event.startDate)}
            </span>
            {event.startTime && (
              <>
                <span style={{ color: "var(--text-muted)" }} className="text-xs">·</span>
                <span style={{ color: "var(--text-muted)" }} className="text-xs">
                  {event.startTime}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Category dot accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: cat.color }}
        />
      </div>

      {/* Text content */}
      <div className={compact ? "p-3" : "p-4"}>
        <h3
          className={`font-bold leading-snug line-clamp-2 mb-1.5 group-hover:text-[var(--accent)] transition-colors ${compact ? "text-sm" : "text-[15px]"}`}
          style={{ color: "var(--text)" }}
        >
          {event.title}
        </h3>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {event.venueName}
        </p>
        {event.description && !compact && (
          <p
            className="text-xs mt-1.5 line-clamp-2"
            style={{ color: "var(--text-dim)" }}
          >
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
