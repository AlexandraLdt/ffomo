import { Event, CATEGORIES } from "@/lib/types";

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const cat = CATEGORIES[event.category];

  return (
    <a
      href={event.eventUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        textDecoration: "none",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {event.imageUrl && !compact && (
        <div className="h-40 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className={compact ? "p-3" : "p-4"}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: cat.color + "18", color: cat.color }}>
            {cat.icon} {cat.label}
          </span>
          {event.startTime && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {event.startTime}
            </span>
          )}
        </div>
        <h3 className={`font-semibold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors ${compact ? "text-sm" : "text-base"}`} style={{ color: "var(--text)" }}>
          {event.title}
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {event.venueName}
        </p>
        {event.description && !compact && (
          <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {event.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent)" }}>
          View event
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </a>
  );
}
