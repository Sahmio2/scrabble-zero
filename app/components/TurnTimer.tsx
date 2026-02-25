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
      className={`rounded-lg border-2 p-4 transition-all shadow-md ${getTimerBackground()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#145a32] border-2 border-[#2d8a54] flex items-center justify-center text-white font-serif font-bold shadow-inner">
            {players[currentTurn]?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-0.5">
              Current Turn
            </h3>
            <p className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
              {currentPlayerName}
              {isCurrentPlayerTurn && (
                <span className="text-[10px] bg-[#c0883e] text-white px-2 py-0.5 rounded font-sans font-bold uppercase tracking-tighter">
                  YOUR TURN
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-0.5">
            Time Remaining
          </div>
          <div className={`text-2xl font-mono tabular-nums ${getTimerColor()}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
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

      {/* Warning message */}
      {isCurrentPlayerTurn && timeLeft <= 10 && (
        <div className="mt-3 text-sm">
          {timeLeft <= 5 ? (
            <div className="text-red-600 font-semibold">
              ⚠️ Time running out! You'll automatically pass if you don't move
              quickly!
            </div>
          ) : (
            <div className="text-amber-600">
              ⏰ Hurry up! Less than 10 seconds remaining.
            </div>
          )}
        </div>
      )}

      {/* Pass button for current player */}
      {isCurrentPlayerTurn && (
        <div className="mt-4">
          <button
            className="w-full bg-stone-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-stone-700 transition-colors"
            onClick={() => {
              // Handle pass turn
              const nextPlayerIndex = (currentTurn + 1) % players.length;
              // This will be handled by the parent component
            }}
          >
            Pass Turn
          </button>
        </div>
      )}
    </div>
  );
}
