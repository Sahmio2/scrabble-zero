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
    if (!bonus) return "bg-[#1e5a32]";

    switch (bonus) {
      case "double-word":
        return "bg-[#f09c85] text-[#111]";
      case "triple-word":
        return "bg-[#d3443a] text-white";
      case "double-letter":
        return "bg-[#96c4d8] text-[#111]";
      case "triple-letter":
        return "bg-[#3f65b8] text-white";
      case "center":
        return "bg-[#d9945b] text-[#111]";
      default:
        return "bg-[#1e5a32]";
    }
  };

  const getBonusText = () => {
    if (!bonus) return null;

    switch (bonus) {
      case "double-word":
        return <>DOUBLE<br />WORD<br />SCORE</>;
      case "triple-word":
        return <>TRIPLE<br />WORD<br />SCORE</>;
      case "double-letter":
        return <>DOUBLE<br />LETTER<br />SCORE</>;
      case "triple-letter":
        return <>TRIPLE<br />LETTER<br />SCORE</>;
      case "center":
        return <span className="text-xl sm:text-2xl pt-1">★</span>;
      default:
        return null;
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
        select-none touch-none w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 flex items-center justify-center
        transition-all duration-200 relative
        ${getBonusClass()}
        ${isOver && isDroppable ? "scale-105 shadow-lg brightness-110 z-10" : ""}
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
        <span className="text-[4px] sm:text-[5px] lg:text-[6px] font-black text-center leading-[1] uppercase tracking-tighter">
          {getBonusText()}
        </span>
      )}

      {isOver && isDroppable && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-50 rounded pointer-events-none" />
      )}
    </div>
  );
}
