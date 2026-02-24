import React from "react";

type GameMode = "classic" | "private" | "guest";

interface GameRoom {
  id: string;
  code: string;
  mode: GameMode;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: "waiting" | "in-progress" | "finished";
}

interface GameLobbyProps {
  onCreateRoom: (mode: GameMode, maxPlayers: number) => void;
  onJoinRoom: (roomCode: string) => void;
  availableRooms: GameRoom[];
  currentUserId?: string;
}

export function GameLobby({ onCreateRoom, onJoinRoom, availableRooms, currentUserId }: GameLobbyProps) {
  const [selectedMode, setSelectedMode] = React.useState<GameMode>("classic");
  const [maxPlayers, setMaxPlayers] = React.useState(2);
  const [roomCode, setRoomCode] = React.useState("");

  const handleCreateRoom = () => {
    onCreateRoom(selectedMode, maxPlayers);
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Create Game Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Create New Game</h2>
        
        <div className="space-y-6">
          {/* Game Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">Game Mode</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedMode("classic")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === "classic"
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <div className="font-semibold">Classic Mode</div>
                <div className="text-sm opacity-75">2-4 players, matchmaking</div>
              </button>
              
              <button
                onClick={() => setSelectedMode("private")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === "private"
                    ? "border-purple-500 bg-purple-50 text-purple-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <div className="font-semibold">Private Room</div>
                <div className="text-sm opacity-75">Invite friends only</div>
              </button>
              
              <button
                onClick={() => setSelectedMode("guest")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === "guest"
                    ? "border-green-500 bg-green-50 text-green-900"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <div className="font-semibold">Guest Mode</div>
                <div className="text-sm opacity-75">No account required</div>
              </button>
            </div>
          </div>

          {/* Player Count Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              Max Players: {maxPlayers}
            </label>
            <input
              type="range"
              min="2"
              max="4"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
              disabled={selectedMode === "classic"}
            />
            <div className="flex justify-between text-xs text-stone-500 mt-1">
              <span>2 Players</span>
              <span>3 Players</span>
              <span>4 Players</span>
            </div>
          </div>

          {/* Create Room Button */}
          <button
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Room
          </button>
        </div>
      </section>

      {/* Join Game Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Join Existing Game</h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABC123)"
              className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomCode.trim()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              Join Room
            </button>
          </div>
        </div>
      </section>

      {/* Available Rooms Section */}
      <section className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Available Rooms</h2>
        
        {availableRooms.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <div className="text-lg">No active rooms</div>
            <div className="text-sm mt-2">Create a new game or wait for others to join</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {availableRooms.map((room) => (
              <div
                key={room.id}
                className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-stone-900">
                      Room {room.code}
                    </div>
                    <div className="text-sm text-stone-600">
                      Host: {room.hostName} • {room.playerCount}/{room.maxPlayers} players
                    </div>
                    <div className="text-xs text-stone-500 mt-1">
                      Mode: {room.mode} • Status: {room.status}
                    </div>
                  </div>
                  <button
                    onClick={() => onJoinRoom(room.code)}
                    disabled={room.status !== "waiting" || room.playerCount >= room.maxPlayers}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                  >
                    {room.status !== "waiting" ? "In Progress" : 
                     room.playerCount >= room.maxPlayers ? "Full" : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
