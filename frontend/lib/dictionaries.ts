export type DictionaryType = "TWL" | "SOWPODS" | "ENABLE";

// Very small starter wordlists per dictionary.
// In production, you’d load full dictionaries from files/CDN.
const BASE_WORDS = [
  "A",
  "I",
  "AN",
  "AND",
  "THE",
  "TO",
  "IN",
  "ON",
  "AT",
  "OF",
  "IS",
  "IT",
  "CAT",
  "DOG",
  "WORD",
  "WORDS",
  "GAME",
  "PLAY",
  "SCRABBLE",
];

const TWL_EXTRA: string[] = [];
const SOWPODS_EXTRA: string[] = [
  // Example: words that might differ by dictionary, placeholder.
  "COLOUR",
];
const ENABLE_EXTRA: string[] = [];

export function getLocalDictionary(type: DictionaryType): Set<string> {
  const upper = (w: string) => w.trim().toUpperCase();

  const words = new Set<string>(BASE_WORDS.map(upper));
  const extra =
    type === "TWL" ? TWL_EXTRA : type === "SOWPODS" ? SOWPODS_EXTRA : ENABLE_EXTRA;

  for (const w of extra) words.add(upper(w));
  return words;
}
