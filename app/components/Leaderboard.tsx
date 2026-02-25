"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/leaderboard";

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard?limit=50");
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        const data = await response.json();
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <p className="text-red-600">Error loading leaderboard: {error}</p>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-stone-600">No players on the leaderboard yet. Start playing to be the first!</p>
      </div>
    );
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-100 border-amber-400 text-amber-800";
      case 2:
        return "bg-slate-100 border-slate-400 text-slate-800";
      case 3:
        return "bg-orange-100 border-orange-400 text-orange-800";
      default:
        return "bg-white border-stone-200";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900">🏆 Leaderboard</h2>
        <p className="text-stone-600 mt-1">Top Scrabble Zero players</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Player
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Games
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Won
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Total Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Avg Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {leaderboard.map((entry) => (
              <tr
                key={entry.userId}
                className={`hover:bg-stone-50 transition-colors ${
                  entry.rank <= 3 ? "font-semibold" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm border-2 ${getRankStyle(
                      entry.rank
                    )}`}
                  >
                    {getRankIcon(entry.rank)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/profile/${entry.userId}`}
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    )}
                    <span className="text-stone-900">{entry.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-stone-700">
                  {entry.gamesPlayed}
                </td>
                <td className="px-4 py-3 text-center text-green-600">
                  {entry.gamesWon}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-sm ${
                      entry.winRate >= 60
                        ? "bg-green-100 text-green-800"
                        : entry.winRate >= 40
                        ? "bg-blue-100 text-blue-800"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {entry.winRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-stone-900">
                  {entry.totalScore.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-stone-700">
                  {entry.averageScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
