import type { PlacedTile } from "./scoring";

export interface WordScore {
  word: string;
  tiles: PlacedTile[];
  score: number;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  words: WordScore[];
  errors: string[];
}

// Common English words for quick validation (fallback)
const COMMON_WORDS = new Set([
  "A",
  "I",
  "IN",
  "ON",
  "AT",
  "TO",
  "BE",
  "IS",
  "IT",
  "OF",
  "AND",
  "OR",
  "THE",
  "FOR",
  "YOU",
  "THEY",
  "WE",
  "HE",
  "SHE",
  "ME",
  "MY",
  "BY",
  "UP",
  "GO",
  "DO",
  "NO",
  "SO",
  "IF",
  "AS",
  "AN",
  "ALL",
  "BUT",
  "CAT",
  "DOG",
  "SUN",
  "RUN",
  "FUN",
  "HAT",
  "BAT",
  "RAT",
  "SAT",
  "MAT",
  "FAT",
  "VAN",
  "MAN",
  "CAN",
  "FAN",
  "PAN",
  "TAN",
  "WAS",
  "HAD",
  "HAS",
  "HIS",
  "HER",
  "HIM",
  "HOW",
  "NOW",
  "NEW",
  "WHO",
  "WHY",
  "WAY",
  "DAY",
  "SAY",
  "MAY",
  "PAY",
  "LAY",
  "RAY",
  "BAY",
  "GAY",
  "HAY",
  "NAY",
  "SAY",
  "PLAY",
  "STAY",
  "GRAY",
  "PRAY",
  "TRAY",
  "CLAY",
  "SLAY",
  "SPRAY",
  "STRAY",
  "TIME",
  "GAME",
  "WORD",
  "PLAY",
  "SCORE",
  "BOARD",
  "TILES",
  "RACK",
  "TURN",
  // ... would include full dictionary in production
]);

/**
 * Extract all words formed by a move
 * Returns words formed horizontally and vertically
 */
export function extractWordsFromMove(
  tiles: PlacedTile[],
  board: (string | null)[][],
): WordScore[] {
  const words: WordScore[] = [];
  const newTilePositions = new Set(tiles.map((t) => `${t.row}-${t.col}`));

  // Helper to get tile at position
  const getTileAt = (row: number, col: number): string | null => {
    const placedTile = tiles.find((t) => t.row === row && t.col === col);
    if (placedTile) return placedTile.letter;
    return board[row]?.[col] ?? null;
  };

  // Helper to build word starting from a position in a direction
  const buildWord = (
    startRow: number,
    startCol: number,
    dRow: number,
    dCol: number,
  ): { word: string; tiles: PlacedTile[] } | null => {
    const wordTiles: PlacedTile[] = [];
    let row = startRow;
    let col = startCol;

    // Move backward to find start of word
    while (row >= 0 && col >= 0 && row < 15 && col < 15) {
      const prevRow = row - dRow;
      const prevCol = col - dCol;
      if (prevRow < 0 || prevCol < 0 || prevRow >= 15 || prevCol >= 15) break;
      if (!getTileAt(prevRow, prevCol)) break;
      row = prevRow;
      col = prevCol;
    }

    // Build word going forward
    let word = "";
    while (row >= 0 && col >= 0 && row < 15 && col < 15) {
      const letter = getTileAt(row, col);
      if (!letter) break;

      word += letter;
      const tile = tiles.find((t) => t.row === row && t.col === col);
      if (tile) {
        wordTiles.push(tile);
      } else {
        // Tile was already on board
        wordTiles.push({
          id: `board-${row}-${col}`,
          letter,
          row,
          col,
        });
      }

      row += dRow;
      col += dCol;
    }

    if (word.length >= 2) {
      return { word, tiles: wordTiles };
    }
    return null;
  };

  // Check horizontal words for each new tile
  for (const tile of tiles) {
    const horizontalWord = buildWord(tile.row, tile.col, 0, 1);
    if (horizontalWord) {
      const existing = words.find((w) => w.word === horizontalWord.word);
      if (!existing) {
        words.push({
          word: horizontalWord.word,
          tiles: horizontalWord.tiles,
          score: 0, // Will be calculated separately
          isValid: false, // Will be validated
        });
      }
    }

    // Check vertical words for each new tile
    const verticalWord = buildWord(tile.row, tile.col, 1, 0);
    if (verticalWord) {
      const existing = words.find((w) => w.word === verticalWord.word);
      if (!existing) {
        words.push({
          word: verticalWord.word,
          tiles: verticalWord.tiles,
          score: 0,
          isValid: false,
        });
      }
    }
  }

  return words;
}

/**
 * Validate a single word using dictionary API
 */
export async function validateWord(word: string): Promise<boolean> {
  if (!word || word.length < 2) return false;
  if (word.length === 1) return "AEIOU".includes(word.toUpperCase());

  // Check common words first (instant)
  if (COMMON_WORDS.has(word.toUpperCase())) {
    return true;
  }

  // For production, use a dictionary API
  try {
    // Using Datamuse API (free, no API key required)
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`,
    );
    const data = await response.json();
    return data.length > 0 && data[0].word.toLowerCase() === word.toLowerCase();
  } catch (error) {
    console.error("Dictionary API error:", error);
    // Fallback to common words
    return COMMON_WORDS.has(word.toUpperCase());
  }
}

/**
 * Validate all words in a move
 */
export async function validateMove(
  tiles: PlacedTile[],
  board: (string | null)[][],
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Basic validation
  if (tiles.length === 0) {
    return { isValid: false, words: [], errors: ["No tiles placed"] };
  }

  if (tiles.length > 7) {
    return {
      isValid: false,
      words: [],
      errors: ["Cannot place more than 7 tiles"],
    };
  }

  // Check for duplicate positions
  const positions = new Set();
  for (const tile of tiles) {
    const pos = `${tile.row}-${tile.col}`;
    if (positions.has(pos)) {
      return {
        isValid: false,
        words: [],
        errors: ["Duplicate tile positions"],
      };
    }
    positions.add(pos);
  }

  // Check bounds
  for (const tile of tiles) {
    if (tile.row < 0 || tile.row >= 15 || tile.col < 0 || tile.col >= 15) {
      return { isValid: false, words: [], errors: ["Tile out of bounds"] };
    }
  }

  // Extract words
  const words = extractWordsFromMove(tiles, board);

  if (words.length === 0) {
    return { isValid: false, words: [], errors: ["No valid words formed"] };
  }

  // Validate each word
  for (const word of words) {
    word.isValid = await validateWord(word.word);
    if (!word.isValid) {
      errors.push(`"${word.word}" is not a valid word`);
    }
  }

  return {
    isValid: errors.length === 0,
    words,
    errors,
  };
}

/**
 * Check if tiles are connected (valid placement)
 */
export function areTilesConnected(
  tiles: PlacedTile[],
  board: (string | null)[][],
): boolean {
  if (tiles.length === 0) return false;
  if (tiles.length === 1) return true;

  // Check if all tiles are in same row or column
  const rows = new Set(tiles.map((t) => t.row));
  const cols = new Set(tiles.map((t) => t.col));

  const sameRow = rows.size === 1;
  const sameCol = cols.size === 1;

  if (!sameRow && !sameCol) return false;

  // Check for gaps
  if (sameRow) {
    const row = tiles[0].row;
    const sortedCols = tiles.map((t) => t.col).sort((a, b) => a - b);
    for (let i = sortedCols[0]; i <= sortedCols[sortedCols.length - 1]; i++) {
      const hasTile = tiles.some((t) => t.col === i) || board[row][i];
      if (!hasTile) return false;
    }
  } else {
    const col = tiles[0].col;
    const sortedRows = tiles.map((t) => t.row).sort((a, b) => a - b);
    for (let i = sortedRows[0]; i <= sortedRows[sortedRows.length - 1]; i++) {
      const hasTile = tiles.some((t) => t.row === i) || board[i][col];
      if (!hasTile) return false;
    }
  }

  return true;
}

/**
 * Check if at least one tile touches existing tiles on board
 * (or is on center square for first move)
 */
export function isValidPlacement(
  tiles: PlacedTile[],
  board: (string | null)[][],
  isFirstMove: boolean,
): { valid: boolean; error?: string } {
  // First move must use center square
  if (isFirstMove) {
    const hasCenterTile = tiles.some((t) => t.row === 7 && t.col === 7);
    if (!hasCenterTile) {
      return { valid: false, error: "First move must use the center star" };
    }
  } else {
    // Must connect to existing tiles
    let touchesExisting = false;
    for (const tile of tiles) {
      const neighbors = [
        [tile.row - 1, tile.col],
        [tile.row + 1, tile.col],
        [tile.row, tile.col - 1],
        [tile.row, tile.col + 1],
      ];
      for (const [r, c] of neighbors) {
        if (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c]) {
          touchesExisting = true;
          break;
        }
      }
    }
    if (!touchesExisting) {
      return { valid: false, error: "Tiles must connect to existing words" };
    }
  }

  // Check tiles are in a straight line
  if (!areTilesConnected(tiles, board)) {
    return {
      valid: false,
      error: "Tiles must be placed in a straight line without gaps",
    };
  }

  return { valid: true };
}
