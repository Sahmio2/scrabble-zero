import React from "react";
import type { TileData } from "@/lib/gameLogic";

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  tiles: TileData[];
  avatar?: string;
}

interface GameRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  currentUserId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
  gameMode: "classic" | "private" | "guest" | "practice";
}

export function GameRoom({
  roomCode,
  players,
  isHost,
  currentUserId,
  onStartGame,
  onLeaveRoom,
  onToggleReady,
  gameMode,
}: GameRoomProps) {
  const currentPlayer = players.find((p) => p.id === currentUserId);
  const allReady = players.filter((p) => !p.isHost).every((p) => p.isReady);
  const canStart = isHost && players.length >= 2 && allReady;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Room Header */}
      <header className="bg-[#145a32] border-b-2 border-[#0a2e1a] rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#e8f5e8]">
              Room {roomCode}
            </h1>
            <div className="text-[#a3c9a8] font-bold text-[10px] mt-0.5 uppercase tracking-widest">
              {gameMode} • {players.length} Players
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="bg-[#c94c4c] text-white px-3 py-1 rounded-md font-bold hover:bg-[#d32f2f] transition-all shadow-sm uppercase text-[10px]"
          >
            Leave
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Players List */}
          <section className="bg-[#1e7a46] border border-[#0e5a30] rounded-lg shadow-md p-4">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-[#a3c9a8] mb-3">
              Players
            </h2>
            <div className="grid gap-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-md border transition-all ${
                    player.id === currentUserId
                      ? "border-[#c0883e] bg-white shadow-sm"
                      : "border-[#2d8a54] bg-[#145a32]/50 text-[#e8f5e8]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#145a32] border border-[#2d8a54] flex items-center justify-center text-sm font-serif font-bold text-white shadow-inner">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div
                        className={`font-serif font-bold text-sm ${player.id === currentUserId ? "text-stone-900" : "text-[#e8f5e8]"}`}
                      >
                        {player.name}
                        {player.isHost && (
                          <span className="ml-1.5 text-[8px] bg-[#c0883e] text-white px-1.5 py-0 rounded font-sans font-bold uppercase">
                            HOST
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[9px] font-bold uppercase tracking-tighter ${player.id === currentUserId ? "text-stone-500" : "text-[#a3c9a8]"}`}
                      >
                        {player.isReady ? "✓ Ready" : "⏳ Waiting"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Room Instructions */}
          <section className="bg-[#0a2e1a] border border-[#0e5a30] rounded-lg p-4 shadow-inner">
            <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#6da87a] mb-2">
              Rules
            </h3>
            <ul className="text-xs text-[#a3c9a8] space-y-1 font-medium">
              <li className="flex items-center gap-1.5">
                <span className="text-[#c0883e] text-[10px]">★</span> Host
                starts when all ready.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#c0883e] text-[10px]">★</span> Turn time
                limit applies.
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#c0883e] text-[10px]">★</span> Strategic
                use of bonuses is key.
              </li>
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          {/* Game Controls */}
          <section className="bg-white border-2 border-[#c0883e] rounded-lg shadow-lg p-4">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">
              Management
            </h2>

            {isHost ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-md border ${
                    canStart
                      ? "bg-[#e8f5e8] border-[#4ade80]"
                      : "bg-amber-50 border-[#e8a87c]"
                  }`}
                >
                  <div className="font-serif font-bold text-xs text-[#145a32]">
                    {canStart ? "Ready to start!" : "Waiting..."}
                  </div>
                  <div className="text-[10px] text-stone-600 mt-0.5">
                    {players.length < 2 && "Need more players."}
                    {players.length >= 2 &&
                      !allReady &&
                      "Waiting for ready signals."}
                    {players.length >= 2 &&
                      allReady &&
                      "All ready! Start the match."}
                  </div>
                </div>

                <button
                  onClick={onStartGame}
                  disabled={!canStart}
                  className="w-full bg-[#c0883e] text-white py-3 px-4 rounded-lg font-serif font-bold text-lg hover:bg-[#d4a04a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md uppercase tracking-widest"
                >
                  Start Match
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="font-serif font-bold text-blue-900 text-xs">
                    Waiting for host
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">
                    Mark yourself as ready below.
                  </div>
                </div>

                <button
                  onClick={onToggleReady}
                  className={`w-full py-3 px-4 rounded-lg font-serif font-bold text-lg transition-all shadow-md uppercase tracking-widest ${
                    currentPlayer?.isReady
                      ? "bg-[#c94c4c] text-white hover:bg-[#d32f2f]"
                      : "bg-[#c0883e] text-white hover:bg-[#d4a04a]"
                  }`}
                >
                  {currentPlayer?.isReady ? "Cancel" : "Ready"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
