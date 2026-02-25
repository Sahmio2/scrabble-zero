"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface TileProps {
  id: string;
  letter: string;
  value?: number;
  isDraggable?: boolean;
  className?: string;
}

export function Tile({
  id,
  letter,
  value,
  isDraggable = true,
  className = "",
}: TileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: !isDraggable,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-xs
        bg-linear-to-br from-[#f7f0d8] to-[#e8dfc4]
        shadow-[1px_1px_2px_rgba(0,0,0,0.35),inset_0_0.5px_0_rgba(255,255,255,0.7)]
        border border-[#c4b896]
        flex items-center justify-center
        transition-all duration-200 cursor-move
        select-none touch-none relative
        ${isDragging ? "scale-105 rotate-2 z-50 shadow-xl opacity-90" : ""}
        ${!isDraggable ? "cursor-default opacity-100 shadow-sm" : "hover:brightness-105 hover:scale-105"}
        ${className}
      `}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`Tile ${letter}${value ? `, ${value} points` : ""}`}
      aria-grabbed={isDragging}
      tabIndex={isDraggable ? 0 : -1}
    >
      <span className="text-sm sm:text-base lg:text-lg font-serif font-bold text-[#1a1a1a] leading-none select-none">
        {letter}
      </span>
      {value !== undefined && (
        <span className="absolute bottom-0.5 right-px text-[7px] lg:text-[8px] font-sans font-bold text-[#4a4a4a] leading-none select-none">
          {value}
        </span>
      )}
    </div>
  );
}
