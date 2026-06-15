const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

// Keyword-tagged image pools — scanned against event title + description
const KEYWORD_POOLS: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ["jazz", "blues", "swing", "improvisation"],
    images: [u("1415201364774-f6f0bb35f28f"), u("1511192336575-5a79af67a629"), u("1514320291840-2e0a9bf2a9ae")],
  },
  {
    keywords: ["orchester", "orchestra", "sinfonie", "symphonie", "philharmonie", "kammermusik", "chor", "choir", "klassik", "classical", "beethoven", "mozart", "brahms", "bach", "händel"],
    images: [u("1507838153414-b4b713384a76"), u("1511671782779-c97d3d27a1d4"), u("1460881680858-30d872d5b530")],
  },
  {
    keywords: ["ballet", "ballett", "tanz", "dance", "tanztheater", "choreografie"],
    images: [u("1518834107812-67b0b7c58434"), u("1574680096145-d05b474e2155")],
  },
  {
    keywords: ["oper", "opera", "musical", "operette", "bühne", "schauspiel", "theater", "theatre", "stück", "premiere"],
    images: [u("1503095396549-807759245b35"), u("1541140134513-85a161dc4a00")],
  },
  {
    keywords: ["ausstellung", "exhibition", "galerie", "gallery", "kunst", "art", "gemälde", "skulptur", "foto", "photography", "vernissage", "öffnung"],
    images: [u("1554907984-15263bfd63bd"), u("1579783902614-a3fb3927b6a5"), u("1561214115-f2f134cc4912"), u("1513364776144-60967b0f800f"), u("1578662996442-48f60103fc96")],
  },
  {
    keywords: ["film", "kino", "cinema", "screening", "vorführung", "dokumentar", "documentary", "kurzfilm", "spielfilm"],
    images: [u("1489599849927-2ee91cede3ba"), u("1440404653325-ab127d49abc1"), u("1594909122845-11baa439b7bf"), u("1485846234645-a62644f84728"), u("1536440136628-849c177e76a1"), u("1478720568477-152d9b164e26")],
  },
  {
    keywords: ["lesung", "literatur", "buch", "book", "autor", "author", "poesie", "poetry", "roman", "schreiben"],
    images: [u("1524995997946-a1c2e315a42f"), u("1456513080510-7bf3a84b82f8")],
  },
  {
    keywords: ["führung", "tour", "rundgang", "besichtigung", "guided"],
    images: [u("1533929736458-ca588d08c8be"), u("1561214115-f2f134cc4912")],
  },
  {
    keywords: ["workshop", "kurs", "seminar", "atelier", "kreativ"],
    images: [u("1531482615713-2afd69097998"), u("1552664730-d307ca884978"), u("1488521787991-ed7bbaae773c")],
  },
  {
    keywords: ["vortrag", "talk", "diskussion", "panel", "podium", "symposium", "konferenz", "lecture", "keynote"],
    images: [u("1475721027785-f74eccf877e2"), u("1540575467063-178a50c2df87"), u("1559223607-a43c990c692c"), u("1505373877841-8d25f7d46678")],
  },
  {
    keywords: ["markt", "market", "essen", "food", "kulinarisch", "festival", "straßen", "street food"],
    images: [u("1414235077428-338989a2e8c0"), u("1504674900247-0877df9cc836")],
  },
  {
    keywords: ["park", "garten", "garden", "outdoor", "natur", "nature", "freiluft", "open air"],
    images: [u("1506905925346-21bda4d32df4"), u("1517457373958-b7bdd4587205")],
  },
  {
    keywords: ["universität", "uni", "akademie", "akademisch", "forschung", "wissenschaft", "institut", "hochschule"],
    images: [u("1521737852567-6949f3f9f2b5"), u("1555396273-367ea4eb4db5"), u("1507003211169-0a1dd7228f2d")],
  },
];

// Per-category fallback when no keyword matches
const CATEGORY_FALLBACK: Record<string, string[]> = {
  lectures: [
    u("1475721027785-f74eccf877e2"), u("1540575467063-178a50c2df87"),
    u("1505373877841-8d25f7d46678"), u("1507003211169-0a1dd7228f2d"),
    u("1521737852567-6949f3f9f2b5"), u("1456513080510-7bf3a84b82f8"),
    u("1559223607-a43c990c692c"), u("1555396273-367ea4eb4db5"),
  ],
  culture: [
    u("1511671782779-c97d3d27a1d4"), u("1507838153414-b4b713384a76"),
    u("1460881680858-30d872d5b530"), u("1578662996442-48f60103fc96"),
    u("1513364776144-60967b0f800f"), u("1554907984-15263bfd63bd"),
    u("1580060839134-75a5edca2e99"), u("1582201942988-13e60e4556ee"),
  ],
  activities: [
    u("1517457373958-b7bdd4587205"), u("1414235077428-338989a2e8c0"),
    u("1506905925346-21bda4d32df4"), u("1488521787991-ed7bbaae773c"),
    u("1571019614242-c5c5dee9f50b"), u("1504674900247-0877df9cc836"),
  ],
  cinema: [
    u("1489599849927-2ee91cede3ba"), u("1440404653325-ab127d49abc1"),
    u("1594909122845-11baa439b7bf"), u("1485846234645-a62644f84728"),
    u("1536440136628-849c177e76a1"), u("1478720568477-152d9b164e26"),
  ],
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getFallbackImage(
  category: string,
  eventId: string,
  title = "",
  description = ""
): string {
  const text = (title + " " + description).toLowerCase();

  // Try keyword pools first
  for (const { keywords, images } of KEYWORD_POOLS) {
    if (keywords.some((k) => text.includes(k))) {
      return images[hash(eventId) % images.length];
    }
  }

  // Fall back to category pool
  const pool = CATEGORY_FALLBACK[category] ?? CATEGORY_FALLBACK.lectures;
  return pool[hash(eventId) % pool.length];
}
