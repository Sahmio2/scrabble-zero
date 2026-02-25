import type { TileData } from "./gameLogic";
import { BONUS_SQUARES, BINGO_BONUS } from "./gameLogic";

export interface PlacedTile {
  id: string;
  letter: string;
  points: number;
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

// Get letter score from tile
export function getLetterScore(letter: string): number {
  const letterScores: Record<string, number> = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10,
    " ": 0,
  };
  return letterScores[letter.toUpperCase()] || 0;
}

// Get bonus at position
export function getBonusAtPosition(
  row: number,
  col: number,
): string | undefined {
  return BONUS_SQUARES[`${row}-${col}`];
}

// Calculate score for a single word
export function calculateWordScore(
  tiles: PlacedTile[],
  isNewPlacement: boolean[],
): number {
  let score = 0;
  let wordMultiplier = 1;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const isNewTile = isNewPlacement[i];
    const bonus = getBonusAtPosition(tile.row, tile.col);

    let letterScore = tile.points;

    // Apply letter multipliers only for new tiles
    if (isNewTile) {
      switch (bonus) {
        case "DL":
          letterScore *= 2;
          break;
        case "TL":
          letterScore *= 3;
          break;
        case "DW":
        case "center":
          wordMultiplier *= 2;
          break;
        case "TW":
          wordMultiplier *= 3;
          break;
      }
    }

    score += letterScore;
  }

  return score * wordMultiplier;
}

// Extract all words formed by a move (main word + cross-words)
export function extractWordsFromMove(
  placedTiles: PlacedTile[],
  board: (TileData | null)[][],
): Array<{ word: string; tiles: PlacedTile[]; isNewTile: boolean[] }> {
  if (placedTiles.length === 0) return [];

  const words: Array<{
    word: string;
    tiles: PlacedTile[];
    isNewTile: boolean[];
  }> = [];
  const newTilePositions = new Set(placedTiles.map((t) => `${t.row}-${t.col}`));

  // Determine direction: check if all tiles are in same row or column
  const rows = new Set(placedTiles.map((t) => t.row));
  const cols = new Set(placedTiles.map((t) => t.col));
  const isHorizontal = rows.size === 1;
  const isVertical = cols.size === 1;

  // Get tile at position (checks both placed tiles and existing board tiles)
  const getTileAt = (
    row: number,
    col: number,
  ): PlacedTile | TileData | null => {
    const placedTile = placedTiles.find((t) => t.row === row && t.col === col);
    if (placedTile) return placedTile;
    return board[row]?.[col] ?? null;
  };

  // Extract a word in a direction starting from a position
  const extractWord = (
    startRow: number,
    startCol: number,
    dRow: number,
    dCol: number,
  ): { word: string; tiles: PlacedTile[]; isNewTile: boolean[] } | null => {
    const tiles: PlacedTile[] = [];
    const isNewTile: boolean[] = [];
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
      const tile = getTileAt(row, col);
      if (!tile) break;

      word += tile.letter;

      // Convert to PlacedTile format
      const placedTile: PlacedTile = {
        id: tile.id,
        letter: tile.letter,
        points: tile.points,
        row,
        col,
        isBlank: tile.isBlank,
      };

      tiles.push(placedTile);
      isNewTile.push(newTilePositions.has(`${row}-${col}`));

      row += dRow;
      col += dCol;
    }

    if (word.length >= 2) {
      return { word, tiles, isNewTile };
    }
    return null;
  };

  // Get main word
  if (isHorizontal) {
    const mainWord = extractWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
    if (mainWord) words.push(mainWord);
  } else if (isVertical) {
    const mainWord = extractWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
    if (mainWord) words.push(mainWord);
  }

  // Get cross-words for each new tile
  for (const tile of placedTiles) {
    if (isHorizontal) {
      // Check for vertical cross-word
      const crossWord = extractWord(tile.row, tile.col, 1, 0);
      if (crossWord && crossWord.tiles.length > 1) {
        // Avoid duplicates
        const existing = words.find(
          (w) =>
            w.word === crossWord.word &&
            w.tiles.length === crossWord.tiles.length,
        );
        if (!existing) words.push(crossWord);
      }
    } else if (isVertical) {
      // Check for horizontal cross-word
      const crossWord = extractWord(tile.row, tile.col, 0, 1);
      if (crossWord && crossWord.tiles.length > 1) {
        const existing = words.find(
          (w) =>
            w.word === crossWord.word &&
            w.tiles.length === crossWord.tiles.length,
        );
        if (!existing) words.push(crossWord);
      }
    }
  }

  return words;
}

// Calculate total score for a move
export function calculateTotalScore(
  words: Array<{ word: string; tiles: PlacedTile[]; isNewTile?: boolean[] }>,
): number {
  let total = 0;

  for (const word of words) {
    // Default to all true if isNewTile not provided (for backward compatibility)
    const isNewTile = word.isNewTile ?? word.tiles.map(() => true);
    total += calculateWordScore(word.tiles, isNewTile);
  }

  return total;
}

// Check if move is a bingo (using all 7 tiles)
export function isBingo(placedTiles: PlacedTile[]): boolean {
  return placedTiles.length === 7;
}

// Calculate final score with bingo bonus
export function calculateFinalScore(
  words: Array<{ word: string; tiles: PlacedTile[]; isNewTile: boolean[] }>,
  placedTiles: PlacedTile[],
): number {
  let total = calculateTotalScore(words);

  // Add bingo bonus
  if (isBingo(placedTiles)) {
    total += BINGO_BONUS;
  }

  return total;
}

// Export BINGO_BONUS for backward compatibility
export { BINGO_BONUS };
