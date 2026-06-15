export type Category = "lectures" | "culture" | "activities" | "cinema";

export interface Venue {
  id: string;
  name: string;
  url: string;
  category: Category;
  imageUrl?: string;
}

export interface Event {
  id: string;
  venueId: string;
  venueName: string;
  category: Category;
  title: string;
  description?: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string;
  startTime?: string;
  eventUrl: string;
  imageUrl?: string;
}

export const CATEGORIES: Record<Category, { label: string; description: string; icon: string; color: string }> = {
  lectures: {
    label: "Lectures & Talks",
    description: "Universities, think tanks, public discourse",
    icon: "🎓",
    color: "#2D5FA5",
  },
  culture: {
    label: "Culture & Arts",
    description: "Museums, galleries, theatre, music",
    icon: "🎨",
    color: "#7B3FA0",
  },
  activities: {
    label: "Things To Do",
    description: "Tours, workshops, markets, sport",
    icon: "🌿",
    color: "#2E8B57",
  },
  cinema: {
    label: "Cinema & Film",
    description: "Cinemas, film festivals, screenings",
    icon: "🎬",
    color: "#C41E3A",
  },
};
