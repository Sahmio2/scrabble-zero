"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { BoardSquare } from "./BoardSquare";
import { Tile } from "./Tile";
import type { TileData } from "@/lib/gameLogic";
import type { PlacedTile } from "@/lib/scoring";

interface InteractiveBoardProps {
  boardTiles: PlacedTile[];
  rackTiles: TileData[];
  onTilePlace: (tileId: string, row: number, col: number) => void;
  onTileRemove: (tileId: string) => void;
  onTileReorder: (oldIndex: number, newIndex: number) => void;
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
  rackTiles,
  onTilePlace,
  onTileRemove,
  onTileReorder,
  isCurrentPlayerTurn = true,
}: InteractiveBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Reduced from 8 for better responsiveness
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropping on board square
    if (overId.startsWith("square-")) {
      const [, row, col] = overId.split("-").map(Number);
      const tile = rackTiles.find((t) => t.id === activeId);

      if (tile && isCurrentPlayerTurn) {
        onTilePlace(activeId, row, col);
      }
    }
    // Check if dropping back on rack
    else if (overId === "tile-rack") {
      const tile = boardTiles.find((t) => t.id === activeId);
      if (tile) {
        onTileRemove(activeId);
      }
    }
    // Handle rack reordering
    else if (rackTiles.some((t) => t.id === overId)) {
      const oldIndex = rackTiles.findIndex((t) => t.id === activeId);
      const newIndex = rackTiles.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        onTileReorder(oldIndex, newIndex);
      }
    }

    setActiveId(null);
  };

  const getTileAtPosition = (row: number, col: number) => {
    return boardTiles.find((tile) => tile.row === row && tile.col === col);
  };

  const activeTile = activeId
    ? [...rackTiles, ...boardTiles].find((t) => t.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-[#0e3d22] p-2 sm:p-4 lg:p-6 rounded-xl shadow-2xl overflow-x-auto min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div
            className="grid gap-0.5 sm:gap-1 mx-auto bg-[#0e5a30] p-1 sm:p-2 rounded shadow-inner border-4 border-[#0a2e1a]"
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

      <DragOverlay>
        {activeTile ? (
          <Tile
            id={activeTile.id}
            letter={activeTile.letter}
            value={(activeTile as any).points ?? (activeTile as any).value}
            isDraggable={false}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
