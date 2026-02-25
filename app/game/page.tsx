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
    gameStarted: serverGameStarted,
    lastChallengeResult,
    joinRoom,
    startGame,
    submitMove,
    endTurn,
  } = useSocket(currentRoom?.code);

  const [localGameStarted, setLocalGameStarted] = useState(false);
  const gameStarted = serverGameStarted || localGameStarted;

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
    turnDuration: number,
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
    } else if (currentRoom.mode === "practice") {
      // Mock socket behavior for practice mode to enable local play
      setLocalGameStarted(true);
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
      <div className="min-h-screen bg-[#0e3d22]">
        <Navigation />
        <main className="py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-[#e8f5e8] sm:text-5xl tracking-tight">
                Scrabble Zero
              </h1>
              <p className="text-base text-[#a3c9a8] sm:text-lg mt-2 font-medium uppercase tracking-widest">
                Premium Scrabble Experience
              </p>
            </header>

            <div className="setup-card bg-[#145a32] border-4 border-[#0a2e1a] rounded-xl p-8 shadow-2xl">
              <GameLobby
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                availableRooms={mockAvailableRooms}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (gameState === "room") {
    if (!currentRoom) return null;

    return (
      <div className="min-h-screen bg-[#0e3d22]">
        <Navigation />
        <main className="py-10 px-4">
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
      </div>
    );
  }

  if (gameState === "playing") {
    const currentPlayer = players.find((p) => p.id === currentUserId);

    return (
      <div className="min-h-screen bg-[#0e3d22] game-container">
        <Navigation />

        {/* Scoreboard Area */}
        <div className="bg-[#0a2e1a] border-b-2 border-[#0e5a30] py-3 px-4 shadow-lg sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-4 scrollbar-hide">
            <div className="flex items-center gap-3 min-w-max">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-badge flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    index === currentTurn
                      ? "bg-[#c0883e] text-white ring-2 ring-[#d4a04a] shadow-lg"
                      : "bg-[#1a5c2a] text-[#a3c9a8] opacity-80"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#145a32] border-2 border-[#2d8a54] flex items-center justify-center text-sm font-serif font-bold shadow-inner">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-tighter leading-none mb-1">
                      {player.id === currentUserId ? "You" : player.name}
                    </span>
                    <span
                      className={`player-badge__score px-2 py-0.5 rounded text-xs font-serif font-bold ${
                        index === currentTurn ? "bg-[#a06e2c]" : "bg-[#145a32]"
                      }`}
                    >
                      {player.score}
                    </span>
                  </div>
                  {index === currentTurn && (
                    <span className="animate-pulse text-[#d4a04a]">▶</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="text-[#6da87a] text-xs font-bold uppercase tracking-widest hidden sm:block">
                Room:{" "}
                <span className="text-[#e8f5e8] font-mono">
                  {currentRoom?.code}
                </span>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="bg-[#c94c4c] text-white px-3 py-1.5 rounded font-bold hover:bg-[#d32f2f] transition-all shadow-md uppercase text-[10px] tracking-widest"
              >
                Quit
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_350px] gap-0 lg:h-[calc(100vh-120px)]">
            {/* Left side: Board and Rack */}
            <div className="flex flex-col h-full overflow-hidden bg-[#0e3d22]">
              <div className="board-area flex-1 flex items-center justify-center p-4 relative overflow-auto custom-scrollbar">
                <InteractiveBoard
                  boardTiles={placedTiles}
                  rackTiles={rackTiles}
                  onTilePlace={handleTilePlace}
                  onTileRemove={handleTileRemove}
                  onTileReorder={handleTileReorder}
                  isCurrentPlayerTurn={isCurrentPlayerTurn}
                />
              </div>

              {/* Player Rack and Quick Controls */}
              <div className="controls-area bg-[#145a32] border-t-4 border-[#0a2e1a] p-4 lg:p-6 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
                <div className="max-w-3xl mx-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#a3c9a8]">
                      Your Tile Rack
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#6da87a]">
                      {7 - rackTiles.length} / 7 Placed
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full">
                      <TileRack
                        tiles={rackTiles}
                        onTileReorder={handleTileReorder}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleRecallTiles}
                        disabled={placedTiles.length === 0}
                        className="bg-transparent text-[#b8dab8] border-2 border-[#2d8a54] hover:bg-[#2d8a54]/20 p-3 rounded-lg font-bold transition-all disabled:opacity-30 uppercase text-[10px] tracking-widest"
                        title="Recall all tiles"
                      >
                        Recall
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Sidebar with controls, timer, chat */}
            <div className="lg:border-l-4 border-[#0a2e1a] bg-[#0e3d22] flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Turn Timer & Status */}
                {currentRoom && (
                  <TurnTimer
                    roomId={currentRoom.code}
                    currentPlayerId={currentUserId}
                    players={players}
                    currentTurn={currentTurn}
                  />
                )}

                {/* Main Game Actions */}
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

                {/* Challenge Logic */}
                {currentRoom && (
                  <div className="challenge-area">
                    <ChallengeSystem
                      roomId={currentRoom.code}
                      currentUserId={currentUserId}
                      players={players}
                      currentTurn={currentTurn}
                    />
                  </div>
                )}
              </div>

              {/* Embedded Chat at bottom of sidebar */}
              <div className="h-1/3 min-h-[250px] border-t-2 border-[#0a2e1a]">
                {currentRoom && (
                  <GameChat
                    roomId={currentRoom.code}
                    currentUserId={currentUserId}
                    currentUserName={userName}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
