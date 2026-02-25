"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [currentUserId] = useState("1");
  const [userName] = useState("You");

  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [rackTiles, setRackTiles] = useState<TileData[]>([]);

  const {
    socket,
    connected,
    players: socketPlayers,
    currentTurn: serverCurrentTurn,
    timeLeft: serverTimeLeft,
    gameStarted: serverGameStarted,
    lastChallengeResult,
    joinRoom,
    startGame,
    submitMove,
    endTurn,
  } = useSocket(currentRoom?.code);

  const [localGameStarted, setLocalGameStarted] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(120);
  const [localCurrentTurn, setLocalCurrentTurn] = useState(0);

  const gameStarted = serverGameStarted || localGameStarted;
  const currentTurn =
    currentRoom?.mode === "practice" ? localCurrentTurn : serverCurrentTurn;
  const timeLeft =
    currentRoom?.mode === "practice" ? localTimeLeft : serverTimeLeft;

  const localTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentRoom?.mode === "practice" && localGameStarted) {
      if (localTimerRef.current) clearInterval(localTimerRef.current);

      localTimerRef.current = setInterval(() => {
        setLocalTimeLeft((prev) => {
          if (prev <= 0) {
            handlePassTurn();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
    };
  }, [localGameStarted, localCurrentTurn, currentRoom?.mode]);

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

  const handleTilePlace = (tileId: string, row: number, col: number) => {
    const tile = rackTiles.find((t) => t.id === tileId);
    if (tile) {
      setRackTiles((prev) => prev.filter((t) => t.id !== tileId));
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
      setPlacedTiles((prev) => prev.filter((t) => t.id !== tileId));
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
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === currentUserId
          ? { ...player, score: player.score + score }
          : player,
      ),
    );
    setPlacedTiles([]);
  };

  const handleRecallTiles = () => {
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
    if (currentRoom?.mode === "practice") {
      const nextPlayerIndex = (currentTurn + 1) % players.length;
      setLocalCurrentTurn(nextPlayerIndex);
      setLocalTimeLeft(120);
      return;
    }
    if (socket && currentRoom?.code) {
      const nextPlayerIndex = (currentTurn + 1) % players.length;
      endTurn(currentRoom.code, nextPlayerIndex);
    }
  };

  const handleSwapTiles = () => {
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
    const hostPlayer: Player = {
      id: currentUserId,
      name: userName,
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
    const newPlayer: Player = {
      id: currentUserId,
      name: userName,
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
    const tileBag = initializeTileBag();
    const playerRacks = dealInitialTiles(tileBag, players.length);
    const updatedPlayers = players.map((player, index) => {
      let playerRackId = `player-${index}`;
      if (currentRoom.mode === "practice" && player.id === "cpu-player") {
        playerRackId = `player-1`;
      }
      return { ...player, tiles: playerRacks[playerRackId] || [] };
    });
    setPlayers(updatedPlayers);
    setGameState("playing");
    setRackTiles(playerRacks[`player-0`] || []);
    if (socket && currentRoom.code) {
      startGame(currentRoom.code);
    } else if (currentRoom.mode === "practice") {
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

  if (gameState === "lobby") {
    return (
      <div className="min-h-screen bg-[#0e3d22]">
        <Navigation />
        <main className="py-6 px-4">
          <div className="mx-auto max-w-5xl">
            <header className="text-center mb-6">
              <h1 className="text-3xl font-serif font-bold text-[#e8f5e8] sm:text-4xl tracking-tight">
                Scrabble Zero
              </h1>
              <p className="text-sm text-[#a3c9a8] mt-1 font-medium uppercase tracking-widest">
                Premium Scrabble Experience
              </p>
            </header>
            <div className="setup-card bg-[#145a32] border-4 border-[#0a2e1a] rounded-xl p-6 shadow-2xl">
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
        <main className="py-6 px-4">
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
    return (
      <div className="h-screen bg-[#0e3d22] game-container overflow-hidden flex flex-col">
        <div className="bg-[#0a2e1a] border-b border-[#0e5a30] py-1 px-4 shadow-lg z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-badge flex items-center gap-2 px-2.5 py-1 rounded-md transition-all ${
                    index === currentTurn
                      ? "bg-[#c0883e] text-white ring-1 ring-[#d4a04a] shadow-md"
                      : "bg-[#1a5c2a] text-[#a3c9a8] opacity-70"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-[#145a32] border border-[#2d8a54] flex items-center justify-center text-[9px] font-serif font-bold shadow-inner">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold uppercase tracking-tighter leading-none mb-0.5">
                      {player.id === currentUserId ? "You" : player.name}
                    </span>
                    <span
                      className={`player-badge__score px-1.5 py-0 rounded-xs text-[9px] font-serif font-bold ${
                        index === currentTurn ? "bg-[#a06e2c]" : "bg-[#145a32]"
                      }`}
                    >
                      {player.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[#6da87a] text-[9px] font-bold uppercase tracking-widest hidden md:block">
                Room:{" "}
                <span className="text-[#e8f5e8] font-mono">
                  {currentRoom?.code}
                </span>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="bg-[#c94c4c] text-white px-2 py-1 rounded font-bold hover:bg-[#d32f2f] transition-all shadow-sm uppercase text-[8px] tracking-widest"
              >
                Quit
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_280px] gap-0">
            <div className="flex flex-col h-full bg-[#0e3d22] overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-1 overflow-hidden">
                <div className="scale-[0.8] sm:scale-[0.85] lg:scale-[0.9] transition-transform origin-center">
                  <InteractiveBoard
                    boardTiles={placedTiles}
                    rackTiles={rackTiles}
                    onTilePlace={handleTilePlace}
                    onTileRemove={handleTileRemove}
                    onTileReorder={handleTileReorder}
                    isCurrentPlayerTurn={isCurrentPlayerTurn}
                  />
                </div>
              </div>
              <div className="bg-[#145a32] border-t border-[#0a2e1a] p-1.5 lg:p-2 shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
                <div className="max-w-xl mx-auto flex flex-col gap-0.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[7px] uppercase tracking-widest font-bold text-[#a3c9a8]">
                      Your Rack
                    </span>
                    <button
                      onClick={handleRecallTiles}
                      disabled={placedTiles.length === 0}
                      className="text-[#b8dab8] hover:text-white disabled:opacity-30 uppercase text-[7px] font-bold tracking-widest transition-colors"
                    >
                      Recall
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <TileRack
                      tiles={rackTiles}
                      onTileReorder={handleTileReorder}
                      className="min-h-10! p-1!"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col h-full bg-[#0a2e1a] border-l border-[#0e5a30] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {currentRoom && (
                  <div className="scale-90 origin-top">
                    <TurnTimer
                      roomId={currentRoom.code}
                      currentPlayerId={currentUserId}
                      players={players}
                      currentTurn={currentTurn}
                      timeLeft={timeLeft}
                    />
                  </div>
                )}
                <div className="scale-95 origin-top">
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
                {currentRoom && (
                  <div className="scale-90 origin-top">
                    <ChallengeSystem
                      roomId={currentRoom.code}
                      currentUserId={currentUserId}
                      players={players}
                      currentTurn={currentTurn}
                    />
                  </div>
                )}
              </div>
              <div className="h-1/4 border-t border-[#0e5a30]">
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
