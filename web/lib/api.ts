import { supabase } from "./supabase";
import { Event, Category } from "./types";

export async function getUpcomingEvents(days = 21): Promise<Event[]> {
  const from = new Date().toISOString().split("T")[0];
  const to = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("*, venues(name, category, url)")
    .gte("start_date", from)
    .lte("start_date", to)
    .order("start_date")
    .order("start_time", { nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id,
    venueId: row.venue_id,
    venueName: row.venues?.name ?? "",
    category: (row.venues?.category ?? "culture") as Category,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    eventUrl: row.event_url,
    imageUrl: row.image_url,
  }));
}

export async function getEventsByCategory(category: Category): Promise<Event[]> {
  const from = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("*, venues!inner(name, category, url)")
    .eq("venues.category", category)
    .gte("start_date", from)
    .order("start_date")
    .order("start_time", { nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id,
    venueId: row.venue_id,
    venueName: row.venues?.name ?? "",
    category: (row.venues?.category ?? category) as Category,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    eventUrl: row.event_url,
    imageUrl: row.image_url,
  }));
}

export async function getEventsByDate(date: string): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*, venues(name, category, url)")
    .eq("start_date", date)
    .order("start_time", { nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id,
    venueId: row.venue_id,
    venueName: row.venues?.name ?? "",
    category: (row.venues?.category ?? "culture") as Category,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    eventUrl: row.event_url,
    imageUrl: row.image_url,
  }));
}

export async function getEventDates(days = 90): Promise<Set<string>> {
  const from = new Date().toISOString().split("T")[0];
  const to = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("start_date")
    .gte("start_date", from)
    .lte("start_date", to);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map(row => row.start_date));
}
