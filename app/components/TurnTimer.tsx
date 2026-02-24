"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

interface TurnTimerProps {
  roomId: string;
  currentPlayerId: string;
  players: Array<{ id: string; name: string }>;
  currentTurn: number;
}

export function TurnTimer({ roomId, currentPlayerId, players, currentTurn }: TurnTimerProps) {
  const { timeLeft, turnTimer } = useSocket(roomId);
  const isCurrentPlayerTurn = players[currentTurn]?.id === currentPlayerId;
  const currentPlayerName = players[currentTurn]?.name || "Unknown";

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine timer color based on time left
  const getTimerColor = () => {
    if (!isCurrentPlayerTurn) return "text-stone-600";
    if (timeLeft <= 5) return "text-red-600 font-bold animate-pulse";
    if (timeLeft <= 10) return "text-amber-600 font-semibold";
    return "text-green-600";
  };

  // Get background color for timer
  const getTimerBackground = () => {
    if (!isCurrentPlayerTurn) return "bg-stone-100";
    if (timeLeft <= 5) return "bg-red-50 border-red-200";
    if (timeLeft <= 10) return "bg-amber-50 border-amber-200";
    return "bg-green-50 border-green-200";
  };

  return (
    <div className={`rounded-lg border-2 p-4 transition-all ${getTimerBackground()}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-stone-700 mb-1">Current Turn</h3>
          <p className="text-lg font-semibold text-stone-900">
            {currentPlayerName}
            {isCurrentPlayerTurn && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">YOUR TURN</span>
            )}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-stone-700 mb-1">Time Remaining</div>
          <div className={`text-2xl font-mono ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-stone-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              timeLeft <= 5 ? "bg-red-500" : 
              timeLeft <= 10 ? "bg-amber-500" : 
              "bg-green-500"
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
              ⚠️ Time running out! You'll automatically pass if you don't move quickly!
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
