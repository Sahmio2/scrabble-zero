"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

interface TurnTimerProps {
  roomId: string;
  currentPlayerId: string;
  players: Array<{ id: string; name: string }>;
  currentTurn: number;
  timeLeft: number;
}

export function TurnTimer({
  roomId,
  currentPlayerId,
  players,
  currentTurn,
  timeLeft,
}: TurnTimerProps) {
  const isCurrentPlayerTurn = players[currentTurn]?.id === currentPlayerId;
  const currentPlayerName = players[currentTurn]?.name || "Unknown";

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine timer color based on time left
  const getTimerColor = () => {
    if (!isCurrentPlayerTurn) return "text-stone-400";
    if (timeLeft <= 30) return "text-[#dc2626] font-bold animate-pulse";
    return "text-[#a06e2c] font-bold";
  };

  // Get background color for timer
  const getTimerBackground = () => {
    if (isCurrentPlayerTurn) return "bg-white border-[#c0883e]";
    return "bg-stone-50 border-stone-200 opacity-80";
  };

  return (
    <div
      className={`rounded-lg border p-2 sm:p-3 transition-all shadow-sm ${getTimerBackground()}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#145a32] border border-[#2d8a54] flex items-center justify-center text-white font-serif font-bold text-xs shadow-inner">
            {players[currentTurn]?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-[8px] uppercase tracking-wider font-bold text-stone-500 leading-none">
              Turn
            </h3>
            <p className="text-xs font-serif font-bold text-stone-900 flex items-center gap-1 leading-tight">
              {currentPlayerName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[8px] uppercase tracking-wider font-bold text-stone-500 leading-none">
            Time
          </div>
          <div
            className={`text-lg font-mono tabular-nums leading-none ${getTimerColor()}`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar - Thinner */}
      <div className="mt-1.5">
        <div className="w-full bg-stone-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ${
              timeLeft <= 5
                ? "bg-red-500"
                : timeLeft <= 10
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${(timeLeft / 120) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
