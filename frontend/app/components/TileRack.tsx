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
  points?: number;
}

function DraggableTile({ id, letter, points }: DraggableTileProps) {
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
      <Tile id={id} letter={letter} value={points} />
    </div>
  );
}

interface TileRackProps {
  tiles: Array<{ id: string; letter: string; points?: number }>;
  onTileReorder?: (oldIndex: number, newIndex: number) => void;
  onTileReturn?: (tileId: string) => void;
  onShuffle?: () => void;
  className?: string;
}

export function TileRack({
  tiles,
  onTileReorder,
  onTileReturn,
  onShuffle,
  className = "",
}: TileRackProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "tile-rack",
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-[#1e7a46] border-2 border-[#0e5a30] rounded-lg p-3 sm:p-4 min-h-24
        flex items-center justify-center gap-3 flex-wrap
        transition-all duration-200 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
        ${isOver ? "bg-[#2d8a54] scale-[1.02] border-[#6da87a]" : ""}
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
              points={tile.points}
            />
          ))
        )}
      </SortableContext>

      {onShuffle && tiles.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShuffle();
          }}
          className="absolute top-2 right-2 p-1.5 bg-[#2d8a54] hover:bg-[#34a362] text-[#e8f5e8] rounded-md shadow-sm border border-[#0e5a30] transition-colors group"
          title="Shuffle tiles"
        >
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {isOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
