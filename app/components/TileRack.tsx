"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Tile } from "./Tile";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableTileProps {
  id: string;
  letter: string;
  value?: number;
}

function DraggableTile({ id, letter, value }: DraggableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Tile id={id} letter={letter} value={value} />
    </div>
  );
}

interface TileRackProps {
  tiles: Array<{ id: string; letter: string; value?: number }>;
  onTileReorder?: (oldIndex: number, newIndex: number) => void;
  onTileReturn?: (tileId: string) => void;
  className?: string;
}

export function TileRack({
  tiles,
  onTileReorder,
  onTileReturn,
  className = "",
}: TileRackProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "tile-rack",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-stone-800 rounded-xl p-3 sm:p-4 min-h-20
        flex items-center justify-center gap-2 flex-wrap
        transition-all duration-200 relative
        ${isOver ? "bg-stone-700 scale-105" : ""}
        ${className}
      `}
      role="region"
      aria-label="Tile rack - drag tiles here to return them"
      aria-dropeffect={isOver ? "move" : undefined}
    >
      <SortableContext
        items={tiles.map((tile) => tile.id)}
        strategy={verticalListSortingStrategy}
      >
        {tiles.length === 0 ? (
          <div className="text-stone-400 text-sm text-center">
            Your tiles will appear here
          </div>
        ) : (
          tiles.map((tile) => (
            <DraggableTile
              key={tile.id}
              id={tile.id}
              letter={tile.letter}
              value={tile.value}
            />
          ))
        )}
      </SortableContext>

      {isOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
