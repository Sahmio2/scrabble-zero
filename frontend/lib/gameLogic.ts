import type {
  Game,
  GamePlayer,
  GameMove as PrismaGameMove,
  GameInvite,
  User,
} from "@prisma/client";

// Standard Scrabble letter distribution with points
export const LETTER_DISTRIBUTION: Record<
  string,
  { count: number; points: number }
> = {
  A: { count: 9, points: 1 },
  B: { count: 2, points: 3 },
  C: { count: 2, points: 3 },
  D: { count: 4, points: 2 },
  E: { count: 12, points: 1 },
  F: { count: 2, points: 4 },
  G: { count: 3, points: 2 },
  H: { count: 2, points: 4 },
  I: { count: 9, points: 1 },
  J: { count: 1, points: 8 },
  K: { count: 1, points: 5 },
  L: { count: 4, points: 1 },
  M: { count: 2, points: 3 },
  N: { count: 6, points: 1 },
  O: { count: 8, points: 1 },
  P: { count: 2, points: 3 },
  Q: { count: 1, points: 10 },
  R: { count: 6, points: 1 },
  S: { count: 4, points: 1 },
  T: { count: 6, points: 1 },
  U: { count: 4, points: 1 },
  V: { count: 2, points: 4 },
  W: { count: 2, points: 4 },
  X: { count: 1, points: 8 },
  Y: { count: 2, points: 4 },
  Z: { count: 1, points: 10 },
  _: { count: 2, points: 0 }, // Blank tiles
};

// Bonus square configurations
export const SQUARE_CONFIGS = {
  TW: {
    label: "TRIPLE WORD SCORE",
    wordMultiplier: 3,
    color: "bg-[#ff4d4d]", // Red
  },
  DW: {
    label: "DOUBLE WORD SCORE",
    wordMultiplier: 2,
    color: "bg-[#ffb3ba]", // Pink
  },
  TL: {
    label: "TRIPLE LETTER SCORE",
    letterMultiplier: 3,
    color: "bg-[#4da6ff]", // Blue
  },
  DL: {
    label: "DOUBLE LETTER SCORE",
    letterMultiplier: 2,
    color: "bg-[#b3e0ff]", // Light Blue
  },
  center: {
    label: "★",
    wordMultiplier: 2,
    color: "bg-[#ffb3ba]", // Pink/Peach
  },
  normal: {
    label: "",
    color: "bg-[#2e7d32]", // Dark Green
  },
};

// Bonus square positions (using same format as spec)
export const BONUS_SQUARES: Record<string, string> = {
  // Center star
  "7-7": "center",

  // Triple Word squares
  "0-0": "TW",
  "0-7": "TW",
  "0-14": "TW",
  "7-0": "TW",
  "7-14": "TW",
  "14-0": "TW",
  "14-7": "TW",
  "14-14": "TW",

  // Double Word squares
  "1-1": "DW",
  "2-2": "DW",
  "3-3": "DW",
  "4-4": "DW",
  "10-10": "DW",
  "11-11": "DW",
  "12-12": "DW",
  "13-13": "DW",
  "1-13": "DW",
  "2-12": "DW",
  "3-11": "DW",
  "4-10": "DW",
  "10-4": "DW",
  "11-3": "DW",
  "12-2": "DW",
  "13-1": "DW",

  // Triple Letter squares
  "1-5": "TL",
  "1-9": "TL",
  "5-1": "TL",
  "5-5": "TL",
  "5-9": "TL",
  "5-13": "TL",
  "9-1": "TL",
  "9-5": "TL",
  "9-9": "TL",
  "9-13": "TL",
  "13-5": "TL",
  "13-9": "TL",

  // Double Letter squares
  "0-3": "DL",
  "0-11": "DL",
  "2-0": "DL",
  "2-6": "DL",
  "2-8": "DL",
  "2-14": "DL",
  "3-0": "DL",
  "3-7": "DL",
  "3-14": "DL",
  "6-0": "DL",
  "6-6": "DL",
  "6-8": "DL",
  "6-14": "DL",
  "7-3": "DL",
  "7-11": "DL",
  "8-0": "DL",
  "8-6": "DL",
  "8-8": "DL",
  "8-14": "DL",
  "11-0": "DL",
  "11-7": "DL",
  "11-14": "DL",
  "12-0": "DL",
  "12-6": "DL",
  "12-8": "DL",
  "12-14": "DL",
  "14-3": "DL",
  "14-11": "DL",
};

// Challenge timer and penalties
export const CHALLENGE_TIMER_SECONDS = 15;
export const CHALLENGE_PENALTY_POINTS = 10;
export const BINGO_BONUS = 50;

export interface TileData {
  id: string;
  letter: string;
  points: number;
  isBlank?: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  mode: "classic" | "private" | "guest" | "practice";
  hostId: string;
  maxPlayers: number;
  status: "waiting" | "active" | "finished";
  players: GamePlayer[];
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  tiles: TileData[];
  userId: string;
  timeRemaining?: number;
  longestWord?: string;
  bingos?: number;
}

export interface GameMove {
  playerId: string;
  tiles: { letter: string; row: number; col: number; isBlank?: boolean }[];
  words: string[];
  score: number;
  timestamp: Date;
}

export interface GameSettings {
  dictionary: "TWL" | "SOWPODS" | "ENABLE";
  challengeMode: boolean;
  turnTimerMinutes: number;
}

export interface GameState {
  room: GameRoom;
  currentTurn: number;
  board: (TileData | null)[][];
  playerRacks: Record<string, TileData[]>;
  tileBag: TileData[];
  moves: GameMove[];
  settings: GameSettings;
  turnTimer: {
    playerId: string;
    startTime: Date;
    duration: number;
  };
  challengeState?: {
    active: boolean;
    playerIndex: number;
    word: string;
    score: number;
    timeRemaining: number;
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

// Initialize Scrabble tile bag with proper distribution
export function initializeTileBag(): TileData[] {
  const bag: TileData[] = [];
  let idCounter = 0;

  // Create tiles based on LETTER_DISTRIBUTION
  Object.entries(LETTER_DISTRIBUTION).forEach(([letter, { count, points }]) => {
    for (let i = 0; i < count; i++) {
      bag.push({
        id: `tile-${idCounter++}`,
        letter: letter === "_" ? " " : letter, // Blank tiles represented as space
        points: points,
        isBlank: letter === "_",
      });
    }
  });

  // Shuffle using Fisher-Yates algorithm
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }

  return bag;
}

// Draw tiles from the bag
export function drawTiles(tileBag: TileData[], count: number): TileData[] {
  return tileBag.splice(0, Math.min(count, tileBag.length));
}

// Refill player rack to 7 tiles
export function refillPlayerRack(
  playerTiles: TileData[],
  tileBag: TileData[],
): TileData[] {
  const needed = 7 - playerTiles.length;
  const drawn = drawTiles(tileBag, needed);
  return [...playerTiles, ...drawn];
}

// Initialize empty 15x15 board
export function initializeBoard(): (TileData | null)[][] {
  return Array(15)
    .fill(null)
    .map(() => Array(15).fill(null));
}

// Deal initial tiles to players
export function dealInitialTiles(
  tileBag: TileData[],
  playerCount: number,
): Record<string, TileData[]> {
  const racks: Record<string, TileData[]> = {};
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
