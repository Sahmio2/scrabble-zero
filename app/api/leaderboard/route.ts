import { NextResponse } from "next/server";
import { getLeaderboard, getPlayerStats } from "@/lib/leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  try {
    if (userId) {
      // Get specific player stats
      const stats = await getPlayerStats(userId);
      if (!stats) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }
      return NextResponse.json(stats);
    } else {
      // Get leaderboard
      const leaderboard = await getLeaderboard(limit);
      return NextResponse.json(leaderboard);
    }
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
