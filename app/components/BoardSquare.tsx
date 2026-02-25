"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Tile } from "./Tile";

interface BoardSquareProps {
  row: number;
  col: number;
  tile?: { id: string; letter: string; value?: number };
  bonus?:
    | "double-word"
    | "triple-word"
    | "double-letter"
    | "triple-letter"
    | "center";
  isDroppable?: boolean;
  onTileDrop?: (tileId: string, row: number, col: number) => void;
}

export function BoardSquare({
  row,
  col,
  tile,
  bonus,
  isDroppable = true,
  onTileDrop,
}: BoardSquareProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `square-${row}-${col}`,
    disabled: !isDroppable || !!tile,
  });

  const getBonusClass = () => {
    if (!bonus) return "bg-[#1e7a46] border-[rgba(0,0,0,0.15)]";

    switch (bonus) {
      case "double-word":
        return "bg-[#e8a87c] border-[#d4a04a] text-[#7b3f00] text-[5px] sm:text-[6px] lg:text-[7px] leading-[1.1] font-bold text-center p-0.5 uppercase";
      case "triple-word":
        return "bg-[#c0392b] border-[#a02626] text-white text-[5px] sm:text-[6px] lg:text-[7px] leading-[1.1] font-bold text-center p-0.5 uppercase";
      case "double-letter":
        return "bg-[#85c1e9] border-[#1a5276] text-[#1a5276] text-[5px] sm:text-[6px] lg:text-[7px] leading-[1.1] font-bold text-center p-0.5 uppercase";
      case "triple-letter":
        return "bg-[#2471a3] border-[#1a2e1a] text-white text-[5px] sm:text-[6px] lg:text-[7px] leading-[1.1] font-bold text-center p-0.5 uppercase";
      case "center":
        return "bg-[#e8a87c] border-[#d4a04a] text-[#7b3f00] text-[10px] lg:text-[14px]";
      default:
        return "bg-[#1e7a46] border-[rgba(0,0,0,0.15)]";
    }
  };

  const getBonusText = () => {
    if (!bonus) return "";

    switch (bonus) {
      case "double-word":
        return "DOUBLE WORD SCORE";
      case "triple-word":
        return "TRIPLE WORD SCORE";
      case "double-letter":
        return "DOUBLE LETTER SCORE";
      case "triple-letter":
        return "TRIPLE LETTER SCORE";
      case "center":
        return "★";
      default:
        return "";
    }
  };

  const getBonusLabel = (bonusType: string) => {
    switch (bonusType) {
      case "double-word":
        return "Double Word";
      case "triple-word":
        return "Triple Word";
      case "double-letter":
        return "Double Letter";
      case "triple-letter":
        return "Triple Letter";
      case "center":
        return "Center Star";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        select-none touch-none w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 border rounded flex items-center justify-center
        transition-all duration-200 relative
        ${getBonusClass()}
        ${isOver && isDroppable ? "scale-105 shadow-lg brightness-110 z-10" : ""}
        ${tile ? "border-amber-600 bg-amber-50 shadow-sm" : ""}
      `}
      aria-label={
        tile
          ? `Square ${row + 1}, ${col + 1} with tile ${tile.letter}`
          : `Empty square ${row + 1}, ${col + 1}${bonus ? ` (${getBonusLabel(bonus)})` : ""}`
      }
      aria-dropeffect={isOver ? "move" : undefined}
      role="gridcell"
    >
      {tile ? (
        <Tile
          id={tile.id}
          letter={tile.letter}
          value={tile.value}
          isDraggable={true}
        />
      ) : (
        <span className="text-[10px] sm:text-xs font-semibold">
          {getBonusText()}
        </span>
      )}

      {isOver && isDroppable && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-50 rounded pointer-events-none" />
      )}
    </div>
  );
}
