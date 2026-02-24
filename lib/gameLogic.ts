import type {
  Game,
  GamePlayer,
  GameMove as PrismaGameMove,
  GameInvite,
  User,
} from "@prisma/client";

export interface GameRoom {
  id: string;
  code: string;
  mode: "classic" | "private" | "guest";
  hostId: string;
  maxPlayers: number;
  status: "waiting" | "active" | "finished";
  players: GamePlayer[];
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  tiles: string[];
  userId: string;
}

export interface GameMove {
  playerId: string;
  tiles: { letter: string; row: number; col: number }[];
  score: number;
  timestamp: Date;
}

export interface GameState {
  room: GameRoom;
  currentTurn: number;
  board: (string | null)[][];
  playerRacks: Record<string, string[]>;
  tileBag: string[];
  moves: GameMove[];
  turnTimer: {
    playerId: string;
    startTime: Date;
    duration: number; // seconds
  };
}

// Generate a random room code
export function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize Scrabble tile distribution
export function initializeTileBag(): string[] {
  const distribution = [
    { letter: "A", count: 9 },
    { letter: "B", count: 2 },
    { letter: "C", count: 2 },
    { letter: "D", count: 4 },
    { letter: "E", count: 12 },
    { letter: "F", count: 2 },
    { letter: "G", count: 3 },
    { letter: "H", count: 2 },
    { letter: "I", count: 9 },
    { letter: "J", count: 1 },
    { letter: "K", count: 1 },
    { letter: "L", count: 4 },
    { letter: "M", count: 2 },
    { letter: "N", count: 6 },
    { letter: "O", count: 8 },
    { letter: "P", count: 2 },
    { letter: "Q", count: 1 },
    { letter: "R", count: 6 },
    { letter: "S", count: 4 },
    { letter: "T", count: 6 },
    { letter: "U", count: 4 },
    { letter: "V", count: 2 },
    { letter: "W", count: 2 },
    { letter: "X", count: 1 },
    { letter: "Y", count: 2 },
    { letter: "Z", count: 1 },
  ];

  const bag: string[] = [];
  distribution.forEach(({ letter, count }) => {
    for (let i = 0; i < count; i++) {
      bag.push(letter);
    }
  });

  // Shuffle the bag
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  return bag;
}

// Initialize empty 15x15 board
export function initializeBoard(): (string | null)[][] {
  return Array(15)
    .fill(null)
    .map(() => Array(15).fill(null));
}

// Deal initial tiles to players
export function dealInitialTiles(
  tileBag: string[],
  playerCount: number,
): Record<string, string[]> {
  const racks: Record<string, string[]> = {};
  const tilesPerPlayer = 7;

  for (let i = 0; i < playerCount; i++) {
    const playerTiles = tileBag.splice(0, tilesPerPlayer);
    racks[`player-${i}`] = playerTiles;
  }

  return racks;
}

// Calculate letter scores
export function getLetterScore(letter: string): number {
  const scores: Record<string, number> = {
    A: 1,
    E: 1,
    I: 1,
    L: 1,
    N: 1,
    O: 1,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    D: 2,
    G: 2,
    B: 3,
    C: 3,
    M: 3,
    P: 3,
    F: 4,
    H: 4,
    V: 4,
    W: 4,
    Y: 4,
    K: 5,
    J: 8,
    X: 8,
    Q: 10,
    Z: 10,
  };
  return scores[letter.toUpperCase()] || 0;
}

// Validate word placement (basic validation)
export function validateWordPlacement(
  board: (string | null)[][],
  tiles: { letter: string; row: number; col: number }[],
): { valid: boolean; error?: string } {
  if (tiles.length === 0) {
    return { valid: false, error: "No tiles placed" };
  }

  // Check if tiles are in a straight line (horizontal or vertical)
  const rows = tiles.map((t) => t.row);
  const cols = tiles.map((t) => t.col);
  const uniqueRows = [...new Set(rows)];
  const uniqueCols = [...new Set(cols)];

  if (uniqueRows.length > 1 && uniqueCols.length > 1) {
    return { valid: false, error: "Tiles must be in a straight line" };
  }

  // Check if tiles are consecutive
  if (uniqueRows.length === 1) {
    // Horizontal placement
    const sortedCols = cols.sort((a, b) => a - b);
    for (let i = 1; i < sortedCols.length; i++) {
      if (sortedCols[i] - sortedCols[i - 1] > 1) {
        // Check if there are existing tiles in the gap
        const row = uniqueRows[0];
        let hasGapTiles = false;
        for (let col = sortedCols[i - 1] + 1; col < sortedCols[i]; col++) {
          if (board[row][col] !== null) {
            hasGapTiles = true;
            break;
          }
        }
        if (!hasGapTiles) {
          return { valid: false, error: "Tiles must be consecutive" };
        }
      }
    }
  } else {
    // Vertical placement
    const sortedRows = rows.sort((a, b) => a - b);
    for (let i = 1; i < sortedRows.length; i++) {
      if (sortedRows[i] - sortedRows[i - 1] > 1) {
        // Check if there are existing tiles in the gap
        const col = uniqueCols[0];
        let hasGapTiles = false;
        for (let row = sortedRows[i - 1] + 1; row < sortedRows[i]; row++) {
          if (board[row][col] !== null) {
            hasGapTiles = true;
            break;
          }
        }
        if (!hasGapTiles) {
          return { valid: false, error: "Tiles must be consecutive" };
        }
      }
    }
  }

  // Check if first move covers center square
  const isFirstMove = board.every((row) => row.every((cell) => cell === null));
  if (isFirstMove) {
    const coversCenter = tiles.some((tile) => tile.row === 7 && tile.col === 7);
    if (!coversCenter) {
      return { valid: false, error: "First move must cover center square" };
    }
  }

  return { valid: true };
}

// Calculate word score
export function calculateWordScore(
  board: (string | null)[][],
  tiles: { letter: string; row: number; col: number }[],
): number {
  let totalScore = 0;
  let wordMultiplier = 1;

  tiles.forEach((tile) => {
    const letterScore = getLetterScore(tile.letter);
    let letterMultiplier = 1;

    // Check for bonus squares (simplified - would need full board layout)
    const { row, col } = tile;

    // Triple Word
    if (
      (row === 0 || row === 7 || row === 14) &&
      (col === 0 || col === 7 || col === 14)
    ) {
      if (row === 7 && col === 7) {
        // Center star - double word on first use
        wordMultiplier *= 2;
      } else {
        wordMultiplier *= 3;
      }
    }
    // Double Word
    else if (
      ((row === 1 || row === 13) && (col === 1 || col === 13)) ||
      ((row === 3 || row === 11) && (col === 3 || col === 11)) ||
      ((row === 5 || row === 9) && (col === 5 || col === 9))
    ) {
      wordMultiplier *= 2;
    }
    // Triple Letter
    else if (
      ((row === 1 || row === 13) && (col === 5 || col === 9)) ||
      ((row === 5 || row === 9) && (col === 1 || col === 13))
    ) {
      letterMultiplier = 3;
    }
    // Double Letter
    else if (
      ((row === 0 || row === 14) && (col === 3 || col === 11)) ||
      ((row === 2 || row === 12) && (col === 6 || col === 8)) ||
      ((row === 3 || row === 11) && (col === 0 || col === 7 || col === 14)) ||
      ((row === 6 || row === 8) &&
        (col === 2 || col === 6 || col === 8 || col === 12))
    ) {
      letterMultiplier = 2;
    }

    totalScore += letterScore * letterMultiplier;
  });

  return totalScore * wordMultiplier;
}

// Game timer utilities
export function createTurnTimer(playerId: string, duration: number = 120) {
  return {
    playerId,
    startTime: new Date(),
    duration,
  };
}

export function getRemainingTime(timer: {
  startTime: Date;
  duration: number;
}): number {
  const elapsed = Math.floor((Date.now() - timer.startTime.getTime()) / 1000);
  return Math.max(0, timer.duration - elapsed);
}

export function isTimerExpired(timer: {
  startTime: Date;
  duration: number;
}): boolean {
  return getRemainingTime(timer) === 0;
}
