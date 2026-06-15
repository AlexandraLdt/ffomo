import { Event, Venue } from "./types";

export const mockVenues: Venue[] = [
  { id: "schirn", name: "Schirn Kunsthalle Frankfurt", url: "https://www.schirn.de/programm/", category: "culture" },
  { id: "staedel", name: "Städel Museum", url: "https://www.staedelmuseum.de/en/exhibitions-programme", category: "culture" },
  { id: "juedisches-museum", name: "Jüdisches Museum Frankfurt", url: "https://www.juedischesmuseum.de/", category: "culture" },
  { id: "mmk", name: "Museum für Moderne Kunst (MMK)", url: "https://www.mmk.art/de/whats-on", category: "culture" },
  { id: "romantik-museum", name: "Deutsches Romantik-Museum", url: "https://deutsches-romantik-museum.de/programm/", category: "culture" },
  { id: "schauspiel", name: "Schauspiel Frankfurt", url: "https://www.schauspielfrankfurt.de/spielplan/kalender/", category: "culture" },
  { id: "alte-oper", name: "Alte Oper Frankfurt", url: "https://www.alteoper.de/de/programm", category: "culture" },
  { id: "oper-frankfurt", name: "Oper Frankfurt", url: "https://oper-frankfurt.de/de/spielplan/", category: "culture" },
  { id: "palmengarten", name: "Palmengarten Frankfurt", url: "https://www.palmengarten.de/de/kalender.html", category: "culture" },
  { id: "malsehkino", name: "Mal Seh'n Kino", url: "https://malsehnkino.de/index.php?section=week", category: "cinema" },
  { id: "arthouse", name: "Arthouse Kinos Frankfurt", url: "https://www.arthouse-kinos.de/", category: "cinema" },
  { id: "cinestar", name: "CineStar Frankfurt Metropolis", url: "https://www.cinestar.de/kino-frankfurt-main-metropolis#kinoprogramm", category: "cinema" },
  { id: "freiluftkino", name: "Freiluftkino Frankfurt", url: "https://www.freiluftkinofrankfurt.de/", category: "cinema" },
  { id: "polytechnische", name: "Polytechnische Gesellschaft", url: "https://polytechnische.de/veranstaltungen", category: "lectures" },
  { id: "prif", name: "PRIF – Peace Research Institute", url: "https://www.prif.org/veranstaltungen", category: "lectures" },
  { id: "boell", name: "Heinrich-Böll-Stiftung Hessen", url: "https://www.boell-hessen.de/", category: "lectures" },
  { id: "kas", name: "Konrad-Adenauer-Stiftung Hessen", url: "https://www.kas.de/de/web/hessen/veranstaltungen", category: "lectures" },
  { id: "naumann", name: "Friedrich-Naumann-Stiftung", url: "https://shop.freiheit.org/#Veranstaltungen/", category: "lectures" },
  { id: "medico", name: "Stiftung Medico International", url: "https://www.stiftung-medico.de/symposien", category: "lectures" },
  { id: "ev-akademie", name: "Evangelische Akademie Frankfurt", url: "https://www.evangelische-akademie.de/kalender/", category: "lectures" },
  { id: "kulturelles-ffm", name: "Kulturelles Frankfurt", url: "https://kulturellesfrankfurt.de/veranstaltungen", category: "lectures" },
  { id: "visit-frankfurt", name: "Visit Frankfurt", url: "https://www.visitfrankfurt.travel/erleben/veranstaltungskalender", category: "activities" },
  { id: "coloria", name: "Coloria Frankfurt", url: "https://coloria.de/", category: "activities" },
  { id: "viola-beuscher", name: "Viola Beuscher", url: "https://violabeuscher.com/", category: "activities" },
  { id: "lieblingsorte", name: "Frankfurt Lieblingsorte", url: "https://www.frankfurtlieblingsorte.de/", category: "activities" },
  { id: "flohmarkt", name: "HFM Frankfurt – Flohmärkte", url: "https://www.hfm-frankfurt.de/flohmaerkte", category: "activities" },
];

function dateStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export const mockEvents: Event[] = [
  {
    id: "e1", venueId: "staedel", venueName: "Städel Museum", category: "culture",
    title: "Late Night at the Städel",
    description: "Every Wednesday, explore the museum after hours with live music and guided tours of the permanent collection.",
    startDate: dateStr(0), startTime: "20:00",
    eventUrl: "https://www.staedelmuseum.de/en/exhibitions-programme",
    imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600&q=80",
  },
  {
    id: "e2", venueId: "polytechnische", venueName: "Polytechnische Gesellschaft", category: "lectures",
    title: "Zukunft der Demokratie – Public Lecture",
    description: "An open public lecture on the future of democratic institutions in Europe.",
    startDate: dateStr(0), startTime: "18:30",
    eventUrl: "https://polytechnische.de/veranstaltungen",
  },
  {
    id: "e3", venueId: "malsehkino", venueName: "Mal Seh'n Kino", category: "cinema",
    title: "French New Wave: À bout de souffle",
    description: "A canonical screening of Godard's 1960 landmark film, followed by a discussion.",
    startDate: dateStr(1), startTime: "19:00",
    eventUrl: "https://malsehnkino.de/index.php?section=week",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80",
  },
  {
    id: "e4", venueId: "schirn", venueName: "Schirn Kunsthalle Frankfurt", category: "culture",
    title: "Opening: Surrealism and Today",
    description: "A major new exhibition examining the enduring influence of Surrealism on contemporary art.",
    startDate: dateStr(1), startTime: "11:00",
    eventUrl: "https://www.schirn.de/programm/",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80",
  },
  {
    id: "e5", venueId: "alte-oper", venueName: "Alte Oper Frankfurt", category: "culture",
    title: "Frankfurt Radio Symphony: Mahler 9",
    description: "The hr-Sinfonieorchester performs Mahler's final completed symphony.",
    startDate: dateStr(2), startTime: "20:00",
    eventUrl: "https://www.alteoper.de/de/programm",
    imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80",
  },
  {
    id: "e6", venueId: "prif", venueName: "PRIF – Peace Research Institute", category: "lectures",
    title: "European Security in 2026: Panel Discussion",
    description: "Senior researchers discuss shifting security dynamics across Europe.",
    startDate: dateStr(2), startTime: "17:00",
    eventUrl: "https://www.prif.org/veranstaltungen",
  },
  {
    id: "e7", venueId: "visit-frankfurt", venueName: "Visit Frankfurt", category: "activities",
    title: "Guided Old Town Walking Tour",
    description: "A guided walk through Frankfurt's Römerberg and historic old town district.",
    startDate: dateStr(3), startTime: "10:00",
    eventUrl: "https://www.visitfrankfurt.travel/erleben/veranstaltungskalender",
    imageUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80",
  },
  {
    id: "e8", venueId: "arthouse", venueName: "Arthouse Kinos Frankfurt", category: "cinema",
    title: "Women in Film Festival: Opening Night",
    description: "An international showcase celebrating films by women directors.",
    startDate: dateStr(3), startTime: "19:30",
    eventUrl: "https://www.arthouse-kinos.de/",
  },
  {
    id: "e9", venueId: "mmk", venueName: "Museum für Moderne Kunst (MMK)", category: "culture",
    title: "Family Sunday at the MMK",
    description: "Hands-on workshops for families in the permanent collection galleries.",
    startDate: dateStr(4), startTime: "10:00",
    eventUrl: "https://www.mmk.art/de/whats-on",
  },
  {
    id: "e10", venueId: "kas", venueName: "Konrad-Adenauer-Stiftung Hessen", category: "lectures",
    title: "Europa nach der Wahl – Perspektiven",
    description: "Political panel examining Europe's direction after recent elections.",
    startDate: dateStr(5), startTime: "16:00",
    eventUrl: "https://www.kas.de/de/web/hessen/veranstaltungen",
  },
  {
    id: "e11", venueId: "freiluftkino", venueName: "Freiluftkino Frankfurt", category: "cinema",
    title: "Open-Air Cinema: Paris, Texas",
    description: "Wim Wenders' restored masterpiece under the Frankfurt summer sky.",
    startDate: dateStr(6), startTime: "21:00",
    eventUrl: "https://www.freiluftkinofrankfurt.de/",
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80",
  },
  {
    id: "e12", venueId: "flohmarkt", venueName: "HFM Frankfurt – Flohmärkte", category: "activities",
    title: "Großer Frankfurter Flohmarkt",
    description: "Frankfurt's beloved weekly flea market along the riverbank.",
    startDate: dateStr(7), startTime: "08:00",
    eventUrl: "https://www.hfm-frankfurt.de/flohmaerkte",
  },
  {
    id: "e13", venueId: "schauspiel", venueName: "Schauspiel Frankfurt", category: "culture",
    title: "Premiere: Die Möwe (Tschechow)",
    description: "New production of Chekhov's The Seagull, directed by Lily Sykes.",
    startDate: dateStr(8), startTime: "19:30",
    eventUrl: "https://www.schauspielfrankfurt.de/spielplan/kalender/",
  },
  {
    id: "e14", venueId: "oper-frankfurt", venueName: "Oper Frankfurt", category: "culture",
    title: "Verdi: La Traviata",
    description: "A new staging of Verdi's beloved opera with the Frankfurt Opera ensemble.",
    startDate: dateStr(10), startTime: "19:00",
    eventUrl: "https://oper-frankfurt.de/de/spielplan/",
    imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80",
  },
  {
    id: "e15", venueId: "ev-akademie", venueName: "Evangelische Akademie Frankfurt", category: "lectures",
    title: "Klimagerechtigkeit – Wer trägt Verantwortung?",
    description: "An interdisciplinary forum on climate justice and civic responsibility.",
    startDate: dateStr(14), startTime: "18:00",
    eventUrl: "https://www.evangelische-akademie.de/kalender/",
  },
];

export function getEventsByDate(dateStr: string): Event[] {
  return mockEvents.filter((e) => e.startDate === dateStr);
}

export function getEventsByCategory(category: string): Event[] {
  return mockEvents.filter((e) => e.category === category);
}

export function getUpcomingDates(days = 14): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}
