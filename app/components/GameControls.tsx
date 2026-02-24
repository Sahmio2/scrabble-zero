"use client";

import React from "react";
import { useSocket } from "@/hooks/useSocket";

interface GameControlsProps {
  roomId: string;
  currentUserId: string;
  placedTiles: Array<{ id: string; letter: string; row: number; col: number }>;
  onPlayMove: () => void;
  onPassTurn: () => void;
  onSwapTiles: () => void;
  onRecallTiles: () => void;
  canPlayMove: boolean;
  isCurrentPlayerTurn: boolean;
}

export function GameControls({
  roomId,
  currentUserId,
  placedTiles,
  onPlayMove,
  onPassTurn,
  onSwapTiles,
  onRecallTiles,
  canPlayMove,
  isCurrentPlayerTurn,
}: GameControlsProps) {
  const { submitMove } = useSocket(roomId);

  const handlePlayMove = () => {
    if (placedTiles.length > 0 && canPlayMove) {
      // Calculate score (simplified for now)
      const score = placedTiles.reduce((total, tile) => {
        // Basic letter scoring - would need proper calculation
        const letterScores: Record<string, number> = {
          'A': 1, 'E': 1, 'I': 1, 'O': 1, 'U': 1, 'L': 1, 'N': 1, 'R': 1, 'S': 1, 'T': 1,
          'D': 2, 'G': 2,
          'B': 3, 'C': 3, 'M': 3, 'P': 3,
          'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
          'K': 5,
          'J': 8, 'X': 8,
          'Q': 10, 'Z': 10,
        };
        return total + (letterScores[tile.letter] || 0);
      }, 0);

      const move = {
        tiles: placedTiles.map(tile => ({
          letter: tile.letter,
          row: tile.row,
          col: tile.col,
        })),
        score,
      };

      submitMove(roomId, move);
      onPlayMove();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-stone-900">Game Controls</h3>
      
      {/* Move Status */}
      <div className="text-sm text-stone-600">
        {placedTiles.length > 0 ? (
          <span className="text-blue-600 font-semibold">
            {placedTiles.length} tile{placedTiles.length > 1 ? 's' : ''} placed
          </span>
        ) : (
          <span>No tiles placed</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handlePlayMove}
          disabled={!isCurrentPlayerTurn || placedTiles.length === 0 || !canPlayMove}
          className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          Play Move
        </button>
        
        <button
          onClick={onRecallTiles}
          disabled={placedTiles.length === 0}
          className="bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          Recall Tiles
        </button>
        
        <button
          onClick={onSwapTiles}
          disabled={!isCurrentPlayerTurn}
          className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          Swap Tiles
        </button>
        
        <button
          onClick={onPassTurn}
          disabled={!isCurrentPlayerTurn}
          className="bg-stone-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-stone-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          Pass Turn
        </button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-stone-500 space-y-1">
        <p>• Drag tiles from your rack to the board</p>
        <p>• Drag tiles back to rack to recall</p>
        <p>• Reorder tiles in your rack</p>
        <p>• Click "Play Move" when ready</p>
      </div>
    </div>
  );
}
