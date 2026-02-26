"use client";

import React from "react";
import { BoardSquare } from "./BoardSquare";
import type { PlacedTile } from "@/lib/scoring";

interface InteractiveBoardProps {
  boardTiles: PlacedTile[];
  isCurrentPlayerTurn?: boolean;
}

// Bonus square configuration
const bonusSquares: Record<
  string,
  | "double-word"
  | "triple-word"
  | "double-letter"
  | "triple-letter"
  | "center"
  | undefined
> = {
  "7-7": "center", // Center square

  // Triple Word squares
  "0-0": "triple-word",
  "0-7": "triple-word",
  "0-14": "triple-word",
  "7-0": "triple-word",
  "7-14": "triple-word",
  "14-0": "triple-word",
  "14-7": "triple-word",
  "14-14": "triple-word",

  // Double Word squares
  "1-1": "double-word",
  "1-13": "double-word",
  "2-2": "double-word",
  "2-12": "double-word",
  "3-3": "double-word",
  "3-11": "double-word",
  "4-4": "double-word",
  "4-10": "double-word",
  "10-4": "double-word",
  "10-10": "double-word",
  "11-3": "double-word",
  "11-11": "double-word",
  "12-2": "double-word",
  "12-12": "double-word",
  "13-1": "double-word",
  "13-13": "double-word",

  // Triple Letter squares
  "1-5": "triple-letter",
  "1-9": "triple-letter",
  "5-1": "triple-letter",
  "5-5": "triple-letter",
  "5-9": "triple-letter",
  "5-13": "triple-letter",
  "9-1": "triple-letter",
  "9-5": "triple-letter",
  "9-9": "triple-letter",
  "9-13": "triple-letter",
  "13-5": "triple-letter",
  "13-9": "triple-letter",

  // Double Letter squares
  "0-3": "double-letter",
  "0-11": "double-letter",
  "2-0": "double-letter",
  "2-6": "double-letter",
  "2-8": "double-letter",
  "2-14": "double-letter",
  "3-2": "double-letter",
  "3-7": "double-letter",
  "3-12": "double-letter",
  "6-2": "double-letter",
  "6-6": "double-letter",
  "6-8": "double-letter",
  "6-12": "double-letter",
  "7-3": "double-letter",
  "7-11": "double-letter",
  "8-2": "double-letter",
  "8-6": "double-letter",
  "8-8": "double-letter",
  "8-12": "double-letter",
  "11-2": "double-letter",
  "11-7": "double-letter",
  "11-12": "double-letter",
  "12-0": "double-letter",
  "12-6": "double-letter",
  "12-8": "double-letter",
  "12-14": "double-letter",
  "14-3": "double-letter",
  "14-11": "double-letter",
};

export function InteractiveBoard({
  boardTiles,
  isCurrentPlayerTurn = true,
}: InteractiveBoardProps) {
  const getTileAtPosition = (row: number, col: number) => {
    return boardTiles.find((tile) => tile.row === row && tile.col === col);
  };

  return (
    <div className="bg-[#1a4628] p-2 sm:p-4 lg:p-6 rounded-xl shadow-2xl overflow-x-auto min-h-[50vh] flex items-center justify-center w-full">
      <div className="max-w-4xl w-full mx-auto flex justify-center">
        <div
          className="grid gap-[3px] bg-[#14361d] p-1.5 sm:p-2 rounded-lg shadow-2xl border-[6px] border-[#0e2a15]"
          style={{
            gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
            width: "fit-content",
            minWidth: "min-content",
          }}
          role="grid"
          aria-label="Scrabble game board"
        >
          {Array.from({ length: 15 }, (_, row) =>
            Array.from({ length: 15 }, (_, col) => {
              const tile = getTileAtPosition(row, col);
              const bonus = bonusSquares[`${row}-${col}`];

              return (
                <BoardSquare
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  tile={
                    tile
                      ? {
                          id: tile.id,
                          letter: tile.letter,
                          value: tile.points,
                        }
                      : undefined
                  }
                  bonus={bonus}
                  isDroppable={isCurrentPlayerTurn}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
