"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ScoreDisplay } from "./ScoreDisplay";
import {
  calculateWordScore,
  calculateTotalMoveScore,
  BINGO_BONUS,
  type PlacedTile,
} from "@/lib/scoring";
import {
  validateMove,
  isValidPlacement,
  type WordScore,
} from "@/lib/wordValidation";

interface GameControlsProps {
  roomId: string;
  currentUserId: string;
  placedTiles: PlacedTile[];
  board: (string | null)[][];
  onPlayMove: (score: number, words: WordScore[]) => void;
  onPassTurn: () => void;
  onSwapTiles: () => void;
  onRecallTiles: () => void;
  isCurrentPlayerTurn: boolean;
  isFirstMove: boolean;
}

export function GameControls({
  roomId,
  currentUserId,
  placedTiles,
  board,
  onPlayMove,
  onPassTurn,
  onSwapTiles,
  onRecallTiles,
  isCurrentPlayerTurn,
  isFirstMove,
}: GameControlsProps) {
  const { submitMove } = useSocket(roomId);
  const [words, setWords] = useState<WordScore[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate scores and validate words when tiles change
  useEffect(() => {
    const calculateScores = async () => {
      if (placedTiles.length === 0) {
        setWords([]);
        setTotalScore(0);
        setValidationError(null);
        return;
      }

      setIsValidating(true);

      // Check placement validity
      const placementCheck = isValidPlacement(placedTiles, board, isFirstMove);
      if (!placementCheck.valid) {
        setValidationError(placementCheck.error || "Invalid placement");
        setWords([]);
        setTotalScore(0);
        setIsValidating(false);
        return;
      }

      // Validate words
      const result = await validateMove(placedTiles, board);

      if (!result.isValid) {
        setValidationError(result.errors.join("\n"));
        // Still calculate scores for preview
      } else {
        setValidationError(null);
      }

      // Calculate scores for each word
      const scoredWords = result.words.map((word) => ({
        ...word,
        score: calculateWordScore(word.tiles, board),
      }));

      setWords(scoredWords);
      setTotalScore(calculateTotalMoveScore(scoredWords));
      setIsValidating(false);
    };

    calculateScores();
  }, [placedTiles, board, isFirstMove]);

  const hasBingo = placedTiles.length === 7;
  const canPlayMove =
    words.length > 0 && words.every((w) => w.isValid) && !validationError;

  const handlePlayMove = () => {
    if (canPlayMove && isCurrentPlayerTurn) {
      const finalScore = hasBingo ? totalScore + BINGO_BONUS : totalScore;

      const move = {
        tiles: placedTiles.map((tile) => ({
          letter: tile.letter,
          row: tile.row,
          col: tile.col,
        })),
        score: finalScore,
      };

      submitMove(roomId, move);
      onPlayMove(finalScore, words);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-bold text-stone-900">Game Controls</h3>

      {/* Score Display */}
      <ScoreDisplay
        words={words}
        totalScore={totalScore}
        isValidating={isValidating}
        bingoBonus={hasBingo}
      />

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      {/* Bingo Notification */}
      {hasBingo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <span className="font-bold text-amber-800">
            🎉 BINGO! +50 points for using all tiles!
          </span>
        </div>
      )}

      {/* Move Status */}
      <div className="text-sm text-stone-600">
        {placedTiles.length > 0 ? (
          <span className="text-blue-600 font-semibold">
            {placedTiles.length} tile{placedTiles.length > 1 ? "s" : ""} placed
          </span>
        ) : (
          <span>No tiles placed</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={handlePlayMove}
          disabled={
            !isCurrentPlayerTurn || placedTiles.length === 0 || !canPlayMove
          }
          className="bg-green-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px]"
          aria-label="Play move"
        >
          Play Move
        </button>

        <button
          onClick={onRecallTiles}
          disabled={placedTiles.length === 0}
          className="bg-amber-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[44px]"
          aria-label="Recall tiles to rack"
        >
          Recall Tiles
        </button>

        <button
          onClick={onSwapTiles}
          disabled={!isCurrentPlayerTurn}
          className="bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
          aria-label="Swap tiles"
        >
          Swap Tiles
        </button>

        <button
          onClick={onPassTurn}
          disabled={!isCurrentPlayerTurn}
          className="bg-stone-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:bg-stone-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 min-h-[44px]"
          aria-label="Pass turn"
        >
          Pass Turn
        </button>
      </div>

      {/* Instructions - hidden on small mobile, visible on larger screens */}
      <div className="hidden sm:block text-xs text-stone-500 space-y-1">
        <p>• Drag tiles from your rack to the board</p>
        <p>• Drag tiles back to rack to recall</p>
        <p>• Reorder tiles in your rack</p>
        <p>• Click "Play Move" when ready</p>
      </div>
    </div>
  );
}
