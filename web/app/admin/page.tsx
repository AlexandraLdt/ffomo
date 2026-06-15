import { supabase } from "@/lib/supabase";

interface ScraperLog {
  venue_id: string;
  venue_name: string;
  events_found: number;
  new_events: number;
  updated_events: number;
  error: string | null;
  scraped_at: string;
}

interface ScraperRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  scraper_logs: ScraperLog[];
}

interface Venue {
  id: string;
  name: string;
  category: string;
  url: string;
  last_scraped_at: string | null;
}

async function getLatestRun(): Promise<ScraperRun | null> {
  const { data } = await supabase
    .from("scraper_runs")
    .select("*, scraper_logs(*)")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

async function getVenues(): Promise<Venue[]> {
  const { data } = await supabase
    .from("venues")
    .select("id, name, category, url, last_scraped_at")
    .order("category")
    .order("name");
  return data ?? [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function duration(start: string, end: string | null) {
  if (!end) return "—";
  const secs = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default async function AdminPage() {
  const [run, venues] = await Promise.all([getLatestRun(), getVenues()]);

  const logsByVenue = new Map<string, ScraperLog>();
  for (const log of run?.scraper_logs ?? []) {
    logsByVenue.set(log.venue_id, log);
  }

  const totalEvents = run?.scraper_logs.reduce((s, l) => s + l.events_found, 0) ?? 0;
  const totalNew = run?.scraper_logs.reduce((s, l) => s + l.new_events, 0) ?? 0;
  const totalErrors = run?.scraper_logs.filter(l => l.error).length ?? 0;
  const totalZero = run?.scraper_logs.filter(l => !l.error && l.events_found === 0).length ?? 0;

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", padding: "2rem", color: "var(--text)" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            FRANKFURT
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>FFOMO Admin</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Scraper monitoring & institution overview</p>
        </div>

        {/* Latest run summary */}
        {run ? (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.75rem" }}>
              Latest Run
            </h2>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Started {formatDate(run.started_at)}
                </span>
                <span style={{ color: "var(--border)", fontSize: "0.8rem" }}>·</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Duration: {duration(run.started_at, run.finished_at)}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {[
                  { label: "Events found", value: totalEvents, color: "var(--text)" },
                  { label: "New events", value: totalNew, color: "#4ade80" },
                  { label: "Warnings (0 events)", value: totalZero, color: "#facc15" },
                  { label: "Errors", value: totalErrors, color: "#f87171" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No scraper runs found yet. Run the scraper to see results here.
          </div>
        )}

        {/* Institution breakdown */}
        <section>
          <h2 style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Institutions ({venues.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {venues.map(venue => {
              const log = logsByVenue.get(venue.id);
              const status = !log ? "not-run" : log.error ? "error" : log.events_found === 0 ? "warning" : "ok";
              const statusColor = { ok: "#4ade80", warning: "#facc15", error: "#f87171", "not-run": "var(--text-dim)" }[status];
              const statusDot = { ok: "●", warning: "●", error: "●", "not-run": "○" }[status];

              return (
                <div key={venue.id} style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${log?.error ? "#7f1d1d" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "0.875rem 1rem",
                  display: "grid",
                  gridTemplateColumns: "1.5rem 1fr auto",
                  gap: "0.75rem",
                  alignItems: "center",
                }}>
                  {/* Status dot */}
                  <span style={{ color: statusColor, fontSize: "0.75rem" }}>{statusDot}</span>

                  {/* Name + error */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{venue.name}</span>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
                        padding: "0.15rem 0.5rem", borderRadius: 99,
                        background: "var(--border)", color: "var(--text-muted)",
                      }}>
                        {venue.category}
                      </span>
                    </div>
                    <a href={venue.url} target="_blank" rel="noopener noreferrer" className="venue-url">
                      {venue.url}
                    </a>
                    {log?.error && (
                      <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#f87171" }}>
                        {log.error}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: "1.25rem", textAlign: "right" }}>
                    {log ? (
                      <>
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: statusColor }}>{log.events_found}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>found</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#4ade80" }}>{log.new_events}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>new</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "1rem", fontWeight: 700 }}>{log.updated_events}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>updated</div>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No data</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
