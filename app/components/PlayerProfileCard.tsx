"use client";

import React, { useEffect, useState } from "react";
import type { PlayerStats } from "@/lib/leaderboard";

interface PlayerProfileCardProps {
  userId?: string;
  name?: string;
  email?: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

export function PlayerProfileCard({
  userId,
  name = "Anonymous",
  email,
  avatar,
  isCurrentUser = false,
}: PlayerProfileCardProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/leaderboard?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching player stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Avatar */}
      <div className="bg-linear-to-br from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            {email && <p className="text-blue-100">{email}</p>}
            {isCurrentUser && (
              <span className="inline-block mt-2 px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-semibold">
                You
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">
            📊 Statistics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox
              label="Games Played"
              value={stats.gamesPlayed}
              color="blue"
            />
            <StatBox label="Games Won" value={stats.gamesWon} color="green" />
            <StatBox label="Games Lost" value={stats.gamesLost} color="red" />
            <StatBox
              label="Win Rate"
              value={`${stats.winRate}%`}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Score"
              value={stats.totalScore.toLocaleString()}
              icon="🏆"
            />
            <StatCard
              label="Highest Game Score"
              value={stats.highestGameScore.toLocaleString()}
              icon="⭐"
            />
            <StatCard
              label="Average Score"
              value={stats.averageScore.toLocaleString()}
              icon="📈"
            />
          </div>

          {stats.bingos > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-800 font-semibold">
                🎉 {stats.bingos} Bingos (7-letter words played)
              </span>
            </div>
          )}
        </div>
      )}

      {!stats && !loading && (
        <div className="p-6 text-center text-stone-600">
          <p>No game statistics available yet.</p>
          <p className="text-sm mt-2">Play some games to see your stats!</p>
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: "blue" | "green" | "red" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-stone-50 p-4 rounded-lg">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-stone-900">{value}</div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
}
