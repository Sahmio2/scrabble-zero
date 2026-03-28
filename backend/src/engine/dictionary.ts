export const dictionary = new Set<string>();

export function loadDictionary(words: string[]) {
  words.forEach(word => dictionary.add(word));
}

export function isValidWord(word: string) {
  return dictionary.has(word.toUpperCase());
}
