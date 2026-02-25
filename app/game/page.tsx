"use client";

import React, { useState, useEffect } from "react";
import { GameLobby } from "@/app/components/GameLobby";
import { GameRoom } from "@/app/components/GameRoom";
import { ScrabbleBoard } from "@/app/components/ScrabbleBoard";
import { Navigation } from "@/app/components/Navigation";
import { TurnTimer } from "@/app/components/TurnTimer";
import { GameChat } from "@/app/components/GameChat";
import { ChallengeSystem } from "@/app/components/ChallengeSystem";
import { InteractiveBoard } from "@/app/components/InteractiveBoard";
import { TileRack } from "@/app/components/TileRack";
import { GameControls } from "@/app/components/GameControls";
import { useSocket } from "@/hooks/useSocket";
import {
  generateRoomCode,
  initializeTileBag,
  initializeBoard,
  dealInitialTiles,
  type GameRoom as GameRoomType,
  type Player,
  type TileData,
} from "@/lib/gameLogic";
import type { WordScore } from "@/lib/wordValidation";
import type { PlacedTile } from "@/lib/scoring";

type GameState = "lobby" | "room" | "playing" | "finished";

// Mock data for development
const mockPlayers: Player[] = [
  {
    id: "1",
    name: "You",
    score: 0,
    isHost: true,
    isReady: false,
    tiles: [],
    userId: "1",
  },
  {
    id: "2",
    name: "Player 2",
    score: 0,
    isHost: false,
    isReady: true,
    tiles: [],
    userId: "2",
  },
];

const mockAvailableRooms = [
  {
    id: "room1",
    code: "ABC123",
    mode: "classic" as const,
    hostName: "Alice",
    playerCount: 2,
    maxPlayers: 4,
    status: "waiting" as const,
  },
  {
    id: "room2",
    code: "XYZ789",
    mode: "private" as const,
    hostName: "Bob",
    playerCount: 3,
    maxPlayers: 4,
    status: "in-progress" as const,
  },
];

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("lobby");
  const [currentRoom, setCurrentRoom] = useState<GameRoomType | null>(null);
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [board, setBoard] = useState<(TileData | null)[][]>(initializeBoard());
  const [currentUserId] = useState("1"); // Mock current user ID
  const [userName] = useState("You"); // Mock user name

  // Drag and drop state
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [rackTiles, setRackTiles] = useState<TileData[]>([]);

  // Socket integration
  const {
    socket,
    connected,
    players: socketPlayers,
    currentTurn,
    timeLeft,
    gameStarted,
    lastChallengeResult,
    joinRoom,
    startGame,
    submitMove,
    endTurn,
  } = useSocket(currentRoom?.code);

  useEffect(() => {
    if (!lastChallengeResult?.penalty) return;

    const { playerId, points } = lastChallengeResult.penalty;
    if (!playerId || !points) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, score: Math.max(0, p.score - points) } : p,
      ),
    );
  }, [lastChallengeResult]);

  // Drag and drop handlers
  const handleTilePlace = (tileId: string, row: number, col: number) => {
    const tile = rackTiles.find((t) => t.id === tileId);
    if (tile) {
      // Remove from rack
      setRackTiles((prev) => prev.filter((t) => t.id !== tileId));
      // Add to board
      setPlacedTiles((prev) => [
        ...prev,
        {
          id: tile.id,
          letter: tile.letter,
          points: tile.points,
          row,
          col,
          isBlank: tile.isBlank,
        },
      ]);
    }
  };

  const handleTileRemove = (tileId: string) => {
    const tile = placedTiles.find((t) => t.id === tileId);
    if (tile) {
      // Remove from board
      setPlacedTiles((prev) => prev.filter((t) => t.id !== tileId));
      // Add back to rack
      setRackTiles((prev) => [
        ...prev,
        {
          id: tile.id,
          letter: tile.letter,
          points: tile.points,
          isBlank: tile.isBlank,
        },
      ]);
    }
  };

  const handleTileReorder = (oldIndex: number, newIndex: number) => {
    setRackTiles((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  };

  const handlePlayMove = (score: number, words: WordScore[]) => {
    // Update board with placed tiles
    const newBoard = board.map((r) => [...r]);
    placedTiles.forEach((tile) => {
      newBoard[tile.row][tile.col] = {
        id: tile.id,
        letter: tile.letter,
        points: tile.points,
        isBlank: tile.isBlank,
      };
    });
    setBoard(newBoard);

    // Update player score
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === currentUserId
          ? { ...player, score: player.score + score }
          : player,
      ),
    );

    setPlacedTiles([]);
    // Move to next turn would be handled by socket
  };

  const handleRecallTiles = () => {
    // Move all placed tiles back to rack
    const tilesToRecall = [...placedTiles];
    setPlacedTiles([]);
    setRackTiles((prev) => [
      ...prev,
      ...tilesToRecall.map((tile) => ({
        id: tile.id,
        letter: tile.letter,
        points: tile.points,
        isBlank: tile.isBlank,
      })),
    ]);
  };

  const handlePassTurn = () => {
    if (socket && currentRoom?.code) {
      const nextPlayerIndex = (currentTurn + 1) % players.length;
      endTurn(currentRoom.code, nextPlayerIndex);
    }
  };

  const handleSwapTiles = () => {
    // Implement tile swapping logic
    console.log("Swap tiles not implemented yet");
  };

  const isCurrentPlayerTurn = players[currentTurn]?.id === currentUserId;

  const handleCreateRoom = (
    mode: "classic" | "private" | "guest" | "practice",
    maxPlayers: number,
  ) => {
    const newRoom: GameRoomType = {
      id: "new-room",
      code: generateRoomCode(),
      mode,
      hostId: currentUserId,
      maxPlayers: mode === "practice" ? 2 : maxPlayers,
      status: "waiting",
      players: [],
      createdAt: new Date(),
    };

    setCurrentRoom(newRoom);
    setGameState("room");

    // Initialize players with current user as host
    const hostPlayer: Player = {
      id: currentUserId,
      name: "You",
      score: 0,
      isHost: true,
      isReady: false,
      tiles: [],
      userId: currentUserId,
    };

    if (mode === "practice") {
      const cpuPlayer: Player = {
        id: "cpu-player",
        name: "Computer (CPU)",
        score: 0,
        isHost: false,
        isReady: true,
        tiles: [],
        userId: "cpu",
      };
      setPlayers([hostPlayer, cpuPlayer]);
    } else {
      setPlayers([hostPlayer]);
    }
  };

  const handleJoinRoom = (roomCode: string) => {
    // Mock joining a room
    const room: GameRoomType = {
      id: "joined-room",
      code: roomCode,
      mode: "classic",
      hostId: "host-id",
      maxPlayers: 4,
      status: "waiting",
      players: [],
      createdAt: new Date(),
    };

    setCurrentRoom(room);
    setGameState("room");

    // Add current player to existing players
    const newPlayer: Player = {
      id: currentUserId,
      name: "You",
      score: 0,
      isHost: false,
      isReady: false,
      tiles: [],
      userId: currentUserId,
    };
    setPlayers([...mockPlayers, newPlayer]);
  };

  const handleStartGame = () => {
    if (!currentRoom) return;

    // Initialize game components
    const tileBag = initializeTileBag();
    const playerRacks = dealInitialTiles(tileBag, players.length);

    // Update players with their tiles
    const updatedPlayers = players.map((player, index) => {
      let playerRackId = `player-${index}`;
      // In practice mode, if it's the CPU player, use its specific index or ID
      if (currentRoom.mode === "practice" && player.id === "cpu-player") {
        playerRackId = `player-1`;
      }
      return {
        ...player,
        tiles: playerRacks[playerRackId] || [],
      };
    });

    setPlayers(updatedPlayers);
    setGameState("playing");

    // Initialize current player's rack from dealt TileData
    setRackTiles(playerRacks[`player-0`] || []);

    // Start game via socket
    if (socket && currentRoom.code) {
      startGame(currentRoom.code);
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setPlayers([]);
    setGameState("lobby");
  };

  const handleToggleReady = () => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === currentUserId
          ? { ...player, isReady: !player.isReady }
          : player,
      ),
    );
  };

  // Render different game states
  if (gameState === "lobby") {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-stone-900 sm:text-5xl">
                Scrabble Zero
              </h1>
              <p className="text-base text-stone-600 sm:text-lg mt-2">
                Create or join a game to start playing
              </p>
            </header>

            <GameLobby
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              availableRooms={mockAvailableRooms}
              currentUserId={currentUserId}
            />
          </div>
        </main>
      </>
    );
  }

  if (gameState === "room") {
    if (!currentRoom) return null;

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
          <GameRoom
            roomCode={currentRoom.code}
            players={players}
            isHost={
              players.find((p) => p.id === currentUserId)?.isHost || false
            }
            currentUserId={currentUserId}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onToggleReady={handleToggleReady}
            gameMode={currentRoom.mode}
          />
        </main>
      </>
    );
  }

  if (gameState === "playing") {
    const currentPlayer = players.find((p) => p.id === currentUserId);

    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
          <div className="mx-auto max-w-7xl">
            {/* Game Header */}
            <header className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-stone-900">
                    Room {currentRoom?.code}
                  </h1>
                  <div className="text-stone-600">Game in Progress</div>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Leave Game
                </button>
              </div>
            </header>

            {/* Game Area */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Players Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Turn Timer */}
                {currentRoom && (
                  <TurnTimer
                    roomId={currentRoom.code}
                    currentPlayerId={currentUserId}
                    players={players}
                    currentTurn={currentTurn}
                  />
                )}

                {/* Players List */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Players
                  </h2>
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg border-2 ${
                          player.id === currentUserId
                            ? "border-blue-500 bg-blue-50"
                            : "border-stone-200"
                        }`}
                      >
                        <div className="font-semibold text-stone-900">
                          {player.name}
                          {player.id === currentUserId && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              YOU
                            </span>
                          )}
                          {index === currentTurn && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-stone-600">
                          Score: {player.score}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          Turn {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge System */}
                {currentRoom && (
                  <ChallengeSystem
                    roomId={currentRoom.code}
                    currentUserId={currentUserId}
                    players={players}
                    currentTurn={currentTurn}
                  />
                )}
              </div>

              {/* Game Board */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Game Board
                  </h2>

                  <InteractiveBoard
                    boardTiles={placedTiles}
                    rackTiles={rackTiles}
                    onTilePlace={handleTilePlace}
                    onTileRemove={handleTileRemove}
                    onTileReorder={handleTileReorder}
                    isCurrentPlayerTurn={isCurrentPlayerTurn}
                  />
                </div>

                {/* Player Rack */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-3">
                    Your Tiles
                  </h3>
                  <TileRack
                    tiles={rackTiles}
                    onTileReorder={handleTileReorder}
                  />
                </div>

                {/* Game Controls */}
                <GameControls
                  roomId={currentRoom?.code || ""}
                  currentUserId={currentUserId}
                  placedTiles={placedTiles}
                  board={board}
                  onPlayMove={handlePlayMove}
                  onPassTurn={handlePassTurn}
                  onSwapTiles={handleSwapTiles}
                  onRecallTiles={handleRecallTiles}
                  isCurrentPlayerTurn={isCurrentPlayerTurn}
                  isFirstMove={
                    placedTiles.every((tile) => !board[tile.row][tile.col]) &&
                    placedTiles.some((t) => t.row === 7 && t.col === 7)
                  }
                />
              </div>
            </div>
          </div>
        </main>

        {/* Game Chat */}
        {currentRoom && (
          <GameChat
            roomId={currentRoom.code}
            currentUserId={currentUserId}
            currentUserName={userName}
          />
        )}
      </>
    );
  }

  return null;
}
