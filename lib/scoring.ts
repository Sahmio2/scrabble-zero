// Standard Scrabble letter scores
export const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4,
  I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3,
  Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8,
  Y: 4, Z: 10,
};

// Bonus square types
export type BonusType = "double-letter" | "triple-letter" | "double-word" | "triple-word" | "center";

// Bonus square positions for 15x15 board
export const BONUS_SQUARES: Record<string, BonusType> = {
  // Center star
  "7-7": "center",
  
  // Triple Word squares (corners and midpoints)
  "0-0": "triple-word", "0-7": "triple-word", "0-14": "triple-word",
  "7-0": "triple-word", "7-14": "triple-word",
  "14-0": "triple-word", "14-7": "triple-word", "14-14": "triple-word",
  
  // Double Word squares (diagonals)
  "1-1": "double-word", "2-2": "double-word", "3-3": "double-word", "4-4": "double-word",
  "10-10": "double-word", "11-11": "double-word", "12-12": "double-word", "13-13": "double-word",
  "1-13": "double-word", "2-12": "double-word", "3-11": "double-word", "4-10": "double-word",
  "10-4": "double-word", "11-3": "double-word", "12-2": "double-word", "13-1": "double-word",
  
  // Triple Letter squares
  "1-5": "triple-letter", "1-9": "triple-letter",
  "5-1": "triple-letter", "5-5": "triple-letter", "5-9": "triple-letter", "5-13": "triple-letter",
  "9-1": "triple-letter", "9-5": "triple-letter", "9-9": "triple-letter", "9-13": "triple-letter",
  "13-5": "triple-letter", "13-9": "triple-letter",
  
  // Double Letter squares
  "0-3": "double-letter", "0-11": "double-letter",
  "2-0": "double-letter", "2-6": "double-letter", "2-8": "double-letter", "2-14": "double-letter",
  "3-0": "double-letter", "3-7": "double-letter", "3-14": "double-letter",
  "6-0": "double-letter", "6-6": "double-letter", "6-8": "double-letter", "6-14": "double-letter",
  "7-3": "double-letter", "7-11": "double-letter",
  "8-0": "double-letter", "8-6": "double-letter", "8-8": "double-letter", "8-14": "double-letter",
  "11-0": "double-letter", "11-7": "double-letter", "11-14": "double-letter",
  "12-0": "double-letter", "12-6": "double-letter", "12-8": "double-letter", "12-14": "double-letter",
  "14-3": "double-letter", "14-11": "double-letter",
};

export interface PlacedTile {
  id: string;
  letter: string;
  row: number;
  col: number;
  isBlank?: boolean;
}

export interface WordScore {
  word: string;
  tiles: PlacedTile[];
  score: number;
  isValid: boolean;
}

export function getLetterScore(letter: string): number {
  return LETTER_SCORES[letter.toUpperCase()] || 0;
}

export function getBonusAtPosition(row: number, col: number): BonusType | undefined {
  return BONUS_SQUARES[`${row}-${col}`];
}

export function calculateWordScore(
  tiles: PlacedTile[],
  board: (string | null)[][]
): number {
  let score = 0;
  let wordMultiplier = 1;

  for (const tile of tiles) {
    let letterScore = getLetterScore(tile.letter);
    const bonus = getBonusAtPosition(tile.row, tile.col);

    // Check if this is a new tile (not already on board)
    const isNewTile = !board[tile.row][tile.col];

    if (isNewTile) {
      switch (bonus) {
        case "double-letter":
          letterScore *= 2;
          break;
        case "triple-letter":
          letterScore *= 3;
          break;
        case "double-word":
        case "center":
          wordMultiplier *= 2;
          break;
        case "triple-word":
          wordMultiplier *= 3;
          break;
      }
    }

    score += letterScore;
  }

  // Apply word multiplier (but not to center if it's the first move)
  const hasCenterTile = tiles.some(t => t.row === 7 && t.col === 7);
  if (hasCenterTile && tiles.length === 1) {
    // First move bonus already counted as double-word
  }

  return score * wordMultiplier;
}

export function calculateTotalMoveScore(
  words: WordScore[]
): number {
  return words.reduce((total, word) => total + word.score, 0);
}

// Bingo bonus (using all 7 tiles)
export const BINGO_BONUS = 50;
