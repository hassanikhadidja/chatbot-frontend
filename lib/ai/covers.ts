const COVERS = [
  {
    match: ["romance", "erotic", "dark"],
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    tone: "from-neutral-950 via-stone-900 to-amber-950",
  },
  {
    match: ["fantasy", "kingdom", "magic"],
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    tone: "from-slate-950 via-indigo-950 to-stone-900",
  },
  {
    match: ["thriller", "mystery", "crime"],
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
    tone: "from-zinc-950 via-slate-900 to-amber-950",
  },
  {
    match: ["sci-fi", "space", "ocean"],
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=80",
    tone: "from-cyan-950 via-slate-950 to-blue-950",
  },
  {
    match: ["horror"],
    image:
      "https://images.unsplash.com/photo-1509248961158-e54f967bd9b0?auto=format&fit=crop&w=1600&q=80",
    tone: "from-zinc-950 via-red-950 to-stone-950",
  },
];

const FALLBACK = {
  image:
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80",
  tone: "from-zinc-950 via-neutral-900 to-stone-800",
};

export function coverForGenres(genres: string[]) {
  const haystack = genres.join(" ").toLowerCase();
  const match = COVERS.find((cover) => cover.match.some((item) => haystack.includes(item)));
  return match ?? FALLBACK;
}

export function hueFromName(name: string, offset = 0) {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return (sum * 13 + offset) % 360;
}
