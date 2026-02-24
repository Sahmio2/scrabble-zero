"use client";

import React, { useState, useEffect } from "react";
import { GameLobby } from "@/app/components/GameLobby";
import { GameRoom } from "@/app/components/GameRoom";
import { ScrabbleBoard } from "@/app/components/ScrabbleBoard";
import { Navigation } from "@/app/components/Navigation";
import {
  generateRoomCode,
  initializeTileBag,
  initializeBoard,
  dealInitialTiles,
  type GameRoom as GameRoomType,
  type Player,
} from "@/lib/gameLogic";

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
  const [board, setBoard] = useState<(string | null)[][]>(initializeBoard());
  const [currentUserId] = useState("1"); // Mock current user ID

  const handleCreateRoom = (
    mode: "classic" | "private" | "guest",
    maxPlayers: number,
  ) => {
    const newRoom: GameRoomType = {
      id: "new-room",
      code: generateRoomCode(),
      mode,
      hostId: currentUserId,
      maxPlayers,
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
    setPlayers([hostPlayer]);
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
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      tiles: playerRacks[`player-${index}`] || [],
    }));

    setPlayers(updatedPlayers);
    setGameState("playing");
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
              <div className="lg:col-span-1">
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
              </div>

              {/* Game Board */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-stone-900 mb-4">
                    Game Board
                  </h2>
                  <ScrabbleBoard />

                  {/* Player Rack */}
                  {currentPlayer && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-stone-900 mb-3">
                        Your Tiles
                      </h3>
                      <div className="flex gap-2 justify-center">
                        {currentPlayer.tiles.map((tile, index) => (
                          <div
                            key={index}
                            className="w-12 h-12 bg-amber-100 border-2 border-amber-600 rounded-lg flex items-center justify-center font-bold text-amber-900"
                          >
                            {tile}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return null;
}
