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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Room Header */}
      <header className="bg-[#145a32] border-b-4 border-[#0a2e1a] rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#e8f5e8]">
              Room {roomCode}
            </h1>
            <div className="text-[#a3c9a8] font-bold text-sm mt-1 uppercase tracking-widest">
              Mode: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} •{" "}
              {players.length} Players
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="bg-[#c94c4c] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#d32f2f] transition-all shadow-md uppercase text-xs"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Players List */}
      <section className="bg-[#1e7a46] border-2 border-[#0e5a30] rounded-xl shadow-lg p-6">
        <h2 className="text-sm uppercase tracking-widest font-bold text-[#a3c9a8] mb-4">
          Players
        </h2>
        <div className="grid gap-3">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                player.id === currentUserId
                  ? "border-[#c0883e] bg-white shadow-md scale-[1.01]"
                  : "border-[#2d8a54] bg-[#145a32]/50 text-[#e8f5e8]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#145a32] border-2 border-[#2d8a54] flex items-center justify-center text-xl font-serif font-bold text-white shadow-inner">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    className={`font-serif font-bold text-lg ${player.id === currentUserId ? "text-stone-900" : "text-[#e8f5e8]"}`}
                  >
                    {player.name}
                    {player.isHost && (
                      <span className="ml-2 text-[10px] bg-[#c0883e] text-white px-2 py-0.5 rounded font-sans font-bold uppercase">
                        HOST
                      </span>
                    )}
                    {player.id === currentUserId && (
                      <span className="ml-2 text-[10px] bg-[#2d8a54] text-white px-2 py-0.5 rounded font-sans font-bold uppercase">
                        YOU
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xs font-bold uppercase tracking-tighter ${player.id === currentUserId ? "text-stone-500" : "text-[#a3c9a8]"}`}
                  >
                    {player.isReady ? "✓ Ready to Play" : "⏳ Waiting..."}
                  </div>
                </div>
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-widest ${player.id === currentUserId ? "text-stone-400" : "text-[#2d8a54]"}`}
              >
                Player {index + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Game Controls */}
      <section className="bg-white border-2 border-[#c0883e] rounded-xl shadow-xl p-6">
        <h2 className="text-sm uppercase tracking-widest font-bold text-stone-400 mb-4">
          Game Management
        </h2>

        {isHost ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                canStart
                  ? "bg-[#e8f5e8] border-[#4ade80]"
                  : "bg-amber-50 border-[#e8a87c]"
              }`}
            >
              <div className="font-serif font-bold text-[#145a32]">
                {canStart
                  ? "Ready to start the match!"
                  : "Setup in progress..."}
              </div>
              <div className="text-sm text-stone-600 mt-1">
                {players.length < 2 && "Need at least one more player to begin"}
                {players.length >= 2 &&
                  !allReady &&
                  "Waiting for participants to mark themselves ready"}
                {players.length >= 2 &&
                  allReady &&
                  "All systems go! You may now start the game."}
              </div>
            </div>

            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full bg-[#c0883e] text-white py-4 px-6 rounded-lg font-serif font-bold text-xl hover:bg-[#d4a04a] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg uppercase tracking-widest"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="font-serif font-bold text-blue-900">
                Waiting for host to begin
              </div>
              <div className="text-sm text-blue-700 mt-1">
                Ensure you are prepared, then mark yourself as ready below.
              </div>
            </div>

            <button
              onClick={onToggleReady}
              className={`w-full py-4 px-6 rounded-lg font-serif font-bold text-xl transition-all shadow-lg uppercase tracking-widest ${
                currentPlayer?.isReady
                  ? "bg-[#c94c4c] text-white hover:bg-[#d32f2f]"
                  : "bg-[#c0883e] text-white hover:bg-[#d4a04a]"
              }`}
            >
              {currentPlayer?.isReady ? "Cancel Ready" : "Mark as Ready"}
            </button>
          </div>
        )}
      </section>

      {/* Room Instructions */}
      <section className="bg-[#0a2e1a] border-2 border-[#0e5a30] rounded-xl p-6 shadow-inner">
        <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#6da87a] mb-3">
          House Rules
        </h3>
        <ul className="text-sm text-[#a3c9a8] space-y-2 font-medium">
          <li className="flex items-center gap-2">
            <span className="text-[#c0883e]">★</span> The host initiates the
            match once all players signal readiness.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#c0883e]">★</span> Each participant has a set
            time limit per turn.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#c0883e]">★</span> Form high-scoring words
            using your rack and existing board tiles.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-[#c0883e]">★</span> Strategic use of premium
            squares is key to victory.
          </li>
        </ul>
      </section>
    </div>
  );
}
