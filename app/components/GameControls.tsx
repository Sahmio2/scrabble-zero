"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ScoreDisplay } from "./ScoreDisplay";
import {
  calculateTotalScore,
  BINGO_BONUS,
  type PlacedTile,
} from "@/lib/scoring";
import {
  validateMove,
  isValidPlacement,
  type WordScore,
} from "@/lib/wordValidation";

import type { TileData } from "@/lib/gameLogic";
import type { DictionaryType } from "@/lib/dictionaries";

interface GameControlsProps {
  roomId: string;
  currentUserId: string;
  placedTiles: PlacedTile[];
  board: (TileData | null)[][];
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
  const [dictionary, setDictionary] = useState<DictionaryType>("ENABLE");

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
      const result = await validateMove(placedTiles, board, dictionary);

      if (!result.isValid) {
        setValidationError(result.errors.join("\n"));
        // Still calculate scores for preview
      } else {
        setValidationError(null);
      }

      // Calculate scores for each word (scores already calculated in validation)
      const scoredWords = result.words.map((word) => ({
        ...word,
        score: word.score, // Score already calculated in wordValidation
      }));

      setWords(scoredWords);
      setTotalScore(calculateTotalScore(scoredWords));
      setIsValidating(false);
    };

    calculateScores();
  }, [placedTiles, board, isFirstMove, dictionary]);

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

  const getButtonClass = (variant: "primary" | "outline" | "danger") => {
    const base =
      "py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-11 shadow-md uppercase tracking-wider text-xs sm:text-sm";

    switch (variant) {
      case "primary":
        return `${base} bg-[#c0883e] text-white hover:bg-[#d4a04a] hover:-translate-y-0.5 hover:shadow-lg focus:ring-[#c0883e]`;
      case "outline":
        return `${base} bg-transparent text-[#b8dab8] border-2 border-[#2d8a54] hover:bg-[#2d8a54]/20 focus:ring-[#2d8a54]`;
      case "danger":
        return `${base} bg-[#c94c4c] text-white hover:bg-[#d32f2f] focus:ring-[#c94c4c]`;
      default:
        return base;
    }
  };

  return (
    <div className="bg-[#145a32] border-t-4 border-[#0a2e1a] shadow-[0_-4px_16px_rgba(0,0,0,0.3)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-sm uppercase tracking-widest font-bold text-[#a3c9a8]">
          Game Controls
        </h3>

        <div className="flex items-center gap-3 bg-[#1e7a46] px-3 py-1.5 rounded-lg border border-[#2d8a54]">
          <label
            className="text-[10px] uppercase tracking-wider font-bold text-[#e8f5e8]"
            htmlFor="dictionary"
          >
            Dictionary
          </label>
          <select
            id="dictionary"
            value={dictionary}
            onChange={(e) => setDictionary(e.target.value as DictionaryType)}
            className="bg-transparent text-[#e8f5e8] font-bold text-xs focus:outline-none appearance-none cursor-pointer pr-4"
          >
            <option value="TWL">TWL</option>
            <option value="SOWPODS">SOWPODS</option>
            <option value="ENABLE">ENABLE</option>
          </select>
        </div>
      </div>

      {/* Score Display */}
      <ScoreDisplay
        words={words}
        totalScore={totalScore}
        isValidating={isValidating}
        bingoBonus={hasBingo}
      />

      {/* Validation Error */}
      {validationError && (
        <div className="bg-[#7a1e1e] border border-[#a02626] rounded-lg p-3 text-xs font-bold text-[#ffe8e8] animate-pulse">
          ⚠️ {validationError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <button
          onClick={handlePlayMove}
          disabled={
            !isCurrentPlayerTurn || placedTiles.length === 0 || !canPlayMove
          }
          className={getButtonClass("primary")}
          aria-label="Play move"
        >
          Play Move
        </button>

        <button
          onClick={onRecallTiles}
          disabled={placedTiles.length === 0}
          className={getButtonClass("outline")}
          aria-label="Recall tiles to rack"
        >
          Recall
        </button>

        <button
          onClick={onSwapTiles}
          disabled={!isCurrentPlayerTurn}
          className={getButtonClass("outline")}
          aria-label="Swap tiles"
        >
          Swap
        </button>

        <button
          onClick={onPassTurn}
          disabled={!isCurrentPlayerTurn}
          className={getButtonClass("outline")}
          aria-label="Pass turn"
        >
          Pass
        </button>
      </div>
    </div>
  );
}
