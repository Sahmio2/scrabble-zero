"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Tile } from "./Tile";

interface BoardSquareProps {
  row: number;
  col: number;
  tile?: { id: string; letter: string; value?: number };
  bonus?: "double-word" | "triple-word" | "double-letter" | "triple-letter" | "center";
  isDroppable?: boolean;
  onTileDrop?: (tileId: string, row: number, col: number) => void;
}

export function BoardSquare({ 
  row, 
  col, 
  tile, 
  bonus, 
  isDroppable = true, 
  onTileDrop 
}: BoardSquareProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `square-${row}-${col}`,
    disabled: !isDroppable || !!tile,
  });

  const getBonusClass = () => {
    if (!bonus) return "bg-stone-100 border-stone-300";
    
    switch (bonus) {
      case "double-word":
        return "bg-pink-100 border-pink-400 text-pink-700";
      case "triple-word":
        return "bg-red-100 border-red-400 text-red-700";
      case "double-letter":
        return "bg-blue-100 border-blue-400 text-blue-700";
      case "triple-letter":
        return "bg-purple-100 border-purple-400 text-purple-700";
      case "center":
        return "bg-amber-100 border-amber-400 text-amber-700";
      default:
        return "bg-stone-100 border-stone-300";
    }
  };

  const getBonusText = () => {
    if (!bonus) return "";
    
    switch (bonus) {
      case "double-word":
        return "DW";
      case "triple-word":
        return "TW";
      case "double-letter":
        return "DL";
      case "triple-letter":
        return "TL";
      case "center":
        return "★";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        w-12 h-12 border-2 rounded flex items-center justify-center
        transition-all duration-200 relative
        ${getBonusClass()}
        ${isOver && isDroppable ? "scale-105 shadow-lg" : ""}
        ${tile ? "border-amber-600" : ""}
      `}
    >
      {tile ? (
        <Tile
          id={tile.id}
          letter={tile.letter}
          value={tile.value}
          isDraggable={true}
        />
      ) : (
        <span className="text-xs font-semibold">
          {getBonusText()}
        </span>
      )}
      
      {isOver && isDroppable && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-50 rounded pointer-events-none" />
      )}
    </div>
  );
}
