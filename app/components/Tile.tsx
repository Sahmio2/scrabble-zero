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

export function Tile({ id, letter, value, isDraggable = true, className = "" }: TileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
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
        w-12 h-12 bg-amber-100 border-2 border-amber-600 rounded-lg 
        flex items-center justify-center font-bold text-amber-900
        shadow-md hover:shadow-lg transition-shadow cursor-move
        select-none touch-none
        ${isDragging ? "scale-105 rotate-2" : ""}
        ${!isDraggable ? "cursor-default opacity-75" : ""}
        ${className}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold">{letter}</span>
        {value !== undefined && (
          <span className="text-xs text-amber-700">{value}</span>
        )}
      </div>
    </div>
  );
}
