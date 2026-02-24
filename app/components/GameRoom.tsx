import React from "react";

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  tiles: string[];
}

interface GameRoomProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  currentUserId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onToggleReady: () => void;
  gameMode: "classic" | "private" | "guest";
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
  const currentPlayer = players.find(p => p.id === currentUserId);
  const allReady = players.filter(p => !p.isHost).every(p => p.isReady);
  const canStart = isHost && players.length >= 2 && allReady;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Room Header */}
      <header className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Room {roomCode}</h1>
            <div className="text-stone-600 mt-1">
              Mode: {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} • 
              {players.length} players
            </div>
          </div>
          <button
            onClick={onLeaveRoom}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Leave Room
          </button>
        </div>
      </header>

      {/* Players List */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Players</h2>
        <div className="grid gap-3">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                player.id === currentUserId
                  ? "border-blue-500 bg-blue-50"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-sm font-semibold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-stone-900">
                    {player.name}
                    {player.isHost && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">HOST</span>}
                    {player.id === currentUserId && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">YOU</span>}
                  </div>
                  <div className="text-sm text-stone-600">
                    {player.isReady ? "✓ Ready" : "⏳ Not Ready"}
                  </div>
                </div>
              </div>
              <div className="text-sm text-stone-500">
                Player {index + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Game Controls */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Game Controls</h2>
        
        {isHost ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              canStart 
                ? "bg-green-50 border border-green-200" 
                : "bg-amber-50 border border-amber-200"
            }`}>
              <div className="font-semibold text-stone-900">
                {canStart ? "Ready to start!" : "Waiting for players..."}
              </div>
              <div className="text-sm text-stone-600 mt-1">
                {players.length < 2 && "Need at least 2 players to start"}
                {players.length >= 2 && !allReady && "Waiting for all players to be ready"}
                {players.length >= 2 && allReady && "All players are ready - you can start the game!"}
              </div>
            </div>
            
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-stone-900">Waiting for host to start</div>
              <div className="text-sm text-stone-600 mt-1">
                Mark yourself as ready when you're prepared to play
              </div>
            </div>
            
            <button
              onClick={onToggleReady}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                currentPlayer?.isReady
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {currentPlayer?.isReady ? "Cancel Ready" : "Mark as Ready"}
            </button>
          </div>
        )}
      </section>

      {/* Room Instructions */}
      <section className="bg-stone-50 rounded-xl p-6">
        <h3 className="font-semibold text-stone-900 mb-2">How to Play</h3>
        <ul className="text-sm text-stone-600 space-y-1">
          <li>• The host starts the game when all players are ready</li>
          <li>• Each player has 2 minutes per turn</li>
          <li>• Form words using your 7 tiles and the board</li>
          <li>• Score points based on letter values and bonus squares</li>
          <li>• First player to use all their tiles wins!</li>
        </ul>
      </section>
    </div>
  );
}
