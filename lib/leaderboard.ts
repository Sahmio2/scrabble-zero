import { prisma } from "./prisma";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  highestWordScore: number;
  winRate: number;
  averageScore: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  totalScore: number;
  highestGameScore: number;
  highestWordScore: number;
  totalWordsPlayed: number;
  longestWord: string;
  bingos: number;
  winRate: number;
  averageScore: number;
  rank?: number;
}

export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  // Get all users with their game data
  const users = await prisma.user.findMany({
    include: {
      games: {
        include: {
          game: true,
        },
      },
    },
  });

  // Calculate stats for each user
  const leaderboard = users.map((user, index) => {
    const games = user.games;
    const gamesPlayed = games.length;
    const gamesWon = games.filter(g => {
      // Determine if player won based on score comparison
      const playerScore = g.score;
      const maxScore = Math.max(...games.map(pg => pg.score));
      return playerScore === maxScore && playerScore > 0;
    }).length;
    
    const totalScore = games.reduce((sum, g) => sum + g.score, 0);
    const highestWordScore = 0; // Would need to track from game moves

    return {
      rank: 0, // Will be assigned after sorting
      userId: user.id,
      name: user.name || "Anonymous",
      avatar: user.image || undefined,
      gamesPlayed,
      gamesWon,
      totalScore,
      highestWordScore,
      winRate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
      averageScore: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
    };
  });

  // Sort by total score descending
  const sorted = leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  // Assign ranks
  sorted.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return sorted.slice(0, limit);
}

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      games: {
        include: {
          game: {
            include: {
              players: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const games = user.games;
  const gamesPlayed = games.length;
  
  // Calculate wins/losses
  let gamesWon = 0;
  let gamesLost = 0;
  let gamesDrawn = 0;
  let highestGameScore = 0;

  for (const gamePlayer of games) {
    const playerScore = gamePlayer.score;
    const allScores = gamePlayer.game.players.map(p => p.score);
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores);

    if (playerScore === maxScore && allScores.filter(s => s === maxScore).length === 1) {
      gamesWon++;
    } else if (playerScore === maxScore) {
      gamesDrawn++;
    } else {
      gamesLost++;
    }

    if (playerScore > highestGameScore) {
      highestGameScore = playerScore;
    }
  }

  const totalScore = games.reduce((sum, g) => sum + g.score, 0);

  return {
    gamesPlayed,
    gamesWon,
    gamesLost,
    gamesDrawn,
    totalScore,
    highestGameScore,
    highestWordScore: 0, // Would track from moves
    totalWordsPlayed: 0, // Would track from moves
    longestWord: "",
    bingos: 0, // Would track from moves
    winRate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
    averageScore: gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0,
  };
}

export async function updatePlayerStats(
  userId: string,
  gameData: {
    score: number;
    won: boolean;
    words?: string[];
    bingos?: number;
  }
): Promise<void> {
  // Stats are calculated from game data
  // This would update a cache or stats table for quick retrieval
  // For now, stats are calculated on-demand from game history
}
