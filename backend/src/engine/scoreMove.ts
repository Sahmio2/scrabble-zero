import { BONUS_SQUARES } from "./bonusSquares";

const LETTER_VALUES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1,
  J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10,
  R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
  " ": 0,
};

const BINGO_BONUS = 50;

interface PlacedTile {
  letter: string;
  row: number;
  col: number;
}

export function calculateScore(board: (string | null)[][], tilesPlaced: PlacedTile[]) {
  if (tilesPlaced.length === 0) return 0;

  const words = extractWordsFromMove(board, tilesPlaced);
  let totalScore = 0;

  for (const word of words) {
    totalScore += calculateWordScore(word.tiles, word.isNewTile);
  }

  // Add bingo bonus
  if (tilesPlaced.length === 7) {
    totalScore += BINGO_BONUS;
  }

  return totalScore;
}

function calculateWordScore(tiles: PlacedTile[], isNewTile: boolean[]): number {
  let score = 0;
  let wordMultiplier = 1;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const isNew = isNewTile[i];
    const bonus = BONUS_SQUARES[`${tile.row}-${tile.col}`];
    
    let letterScore = LETTER_VALUES[tile.letter.toUpperCase()] || 0;

    // Apply multipliers ONLY for new tiles
    if (isNew) {
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

function extractWordsFromMove(
  board: (string | null)[][],
  placedTiles: PlacedTile[]
): Array<{ word: string; tiles: PlacedTile[]; isNewTile: boolean[] }> {
  const words: Array<{ word: string; tiles: PlacedTile[]; isNewTile: boolean[] }> = [];
  const newTilePositions = new Set(placedTiles.map(t => `${t.row}-${t.col}`));

  const rows = new Set(placedTiles.map(t => t.row));
  const cols = new Set(placedTiles.map(t => t.col));
  const isHorizontal = rows.size === 1;
  const isVertical = cols.size === 1;

  const getTileAt = (row: number, col: number): PlacedTile | null => {
    // Check placed tiles first
    const placed = placedTiles.find(t => t.row === row && t.col === col);
    if (placed) return placed;
    
    // Check board
    const letter = board[row]?.[col];
    if (letter) {
      return { letter, row, col };
    }
    return null;
  };

  const extractWord = (
    startRow: number,
    startCol: number,
    dRow: number,
    dCol: number
  ): { word: string; tiles: PlacedTile[]; isNewTile: boolean[] } | null => {
    const tiles: PlacedTile[] = [];
    const isNewTile: boolean[] = [];
    let row = startRow;
    let col = startCol;

    // Backtrack to start
    while (row - dRow >= 0 && col - dCol >= 0 && row - dRow < 15 && col - dCol < 15 && getTileAt(row - dRow, col - dCol)) {
      row -= dRow;
      col -= dCol;
    }

    let wordStr = "";
    while (row >= 0 && col >= 0 && row < 15 && col < 15) {
      const tile = getTileAt(row, col);
      if (!tile) break;
      
      wordStr += tile.letter;
      tiles.push(tile);
      isNewTile.push(newTilePositions.has(`${row}-${col}`));
      
      row += dRow;
      col += dCol;
    }

    if (wordStr.length >= 2) {
      return { word: wordStr, tiles, isNewTile };
    }
    return null;
  };

  // Main word
  if (isHorizontal) {
    const main = extractWord(placedTiles[0].row, placedTiles[0].col, 0, 1);
    if (main) words.push(main);
  } else if (isVertical) {
    const main = extractWord(placedTiles[0].row, placedTiles[0].col, 1, 0);
    if (main) words.push(main);
  }

  // Cross words
  for (const tile of placedTiles) {
    if (isHorizontal) {
      const cross = extractWord(tile.row, tile.col, 1, 0);
      if (cross) {
        // Only append if it wasn't already added (unlikely for cross-words unless they overlap strangely)
        words.push(cross);
      }
    } else if (isVertical) {
      const cross = extractWord(tile.row, tile.col, 0, 1);
      if (cross) {
        words.push(cross);
      }
    }
  }

  return words;
}
