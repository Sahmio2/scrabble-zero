import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (
  req: NextApiRequest,
  res: NextApiResponse & { socket: any },
) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Game room management
    const gameRooms = new Map<string, Set<string>>();
    const playerData = new Map<string, { name: string; roomId?: string }>();

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Player joins with their name
      socket.on("player:join", (data: { name: string; roomId: string }) => {
        const { name, roomId } = data;

        // Store player data
        playerData.set(socket.id, { name, roomId });

        // Join room
        socket.join(roomId);

        // Add to room tracking
        if (!gameRooms.has(roomId)) {
          gameRooms.set(roomId, new Set());
        }
        gameRooms.get(roomId)!.add(socket.id);

        // Notify room that player joined
        socket.to(roomId).emit("player:joined", {
          playerId: socket.id,
          name,
          players: Array.from(gameRooms.get(roomId) || []).map((id) => ({
            id,
            name: playerData.get(id)?.name || "Unknown",
          })),
        });

        // Send current room state to new player
        socket.emit("room:state", {
          players: Array.from(gameRooms.get(roomId) || []).map((id) => ({
            id,
            name: playerData.get(id)?.name || "Unknown",
          })),
        });
      });

      // Game start
      socket.on("game:start", (data: { roomId: string }) => {
        const { roomId } = data;
        const players = Array.from(gameRooms.get(roomId) || []);

        // Initialize turn order and timer
        const firstPlayer = players[0];
        const turnTimer = {
          playerId: firstPlayer,
          startTime: new Date(),
          duration: 120, // 2 minutes
        };

        io.to(roomId).emit("game:started", {
          players: players.map((id) => ({
            id,
            name: playerData.get(id)?.name || "Unknown",
          })),
          currentTurn: 0,
          turnTimer,
        });

        // Start turn timer for first player
        io.to(firstPlayer).emit("turn:start", turnTimer);
      });

      // Turn management
      socket.on(
        "turn:end",
        (data: { roomId: string; nextPlayerIndex: number }) => {
          const { roomId, nextPlayerIndex } = data;
          const players = Array.from(gameRooms.get(roomId) || []);

          if (nextPlayerIndex < players.length) {
            const nextPlayer = players[nextPlayerIndex];
            const turnTimer = {
              playerId: nextPlayer,
              startTime: new Date(),
              duration: 120,
            };

            io.to(roomId).emit("turn:changed", {
              currentTurn: nextPlayerIndex,
              turnTimer,
            });

            io.to(nextPlayer).emit("turn:start", turnTimer);
          }
        },
      );

      // Move submission
      socket.on(
        "move:submit",
        (data: {
          roomId: string;
          move: {
            tiles: { letter: string; row: number; col: number }[];
            score: number;
          };
        }) => {
          const { roomId, move } = data;
          const playerInfo = playerData.get(socket.id);

          // Broadcast move to all players in room
          io.to(roomId).emit("move:made", {
            playerId: socket.id,
            playerName: playerInfo?.name || "Unknown",
            move,
          });
        },
      );

      // Chat messages
      socket.on("chat:message", (data: { roomId: string; message: string }) => {
        const { roomId, message } = data;
        const playerInfo = playerData.get(socket.id);

        io.to(roomId).emit("chat:message", {
          playerId: socket.id,
          playerName: playerInfo?.name || "Unknown",
          message,
          timestamp: new Date(),
        });
      });

      // Challenge system
      socket.on(
        "challenge:issued",
        (data: { roomId: string; targetPlayerId: string; word: string }) => {
          const { roomId, targetPlayerId, word } = data;
          const challengerInfo = playerData.get(socket.id);

          // Send challenge to target player
          io.to(targetPlayerId).emit("challenge:received", {
            challengerId: socket.id,
            challengerName: challengerInfo?.name || "Unknown",
            word,
          });

          // Notify room of challenge
          socket.to(roomId).emit("challenge:announced", {
            challengerName: challengerInfo?.name || "Unknown",
            word,
          });
        },
      );

      socket.on(
        "challenge:respond",
        (data: { roomId: string; valid: boolean }) => {
          const { roomId, valid } = data;
          const playerInfo = playerData.get(socket.id);

          io.to(roomId).emit("challenge:result", {
            playerId: socket.id,
            playerName: playerInfo?.name || "Unknown",
            valid,
          });
        },
      );

      // Timer warnings
      socket.on(
        "timer:warning",
        (data: { roomId: string; timeLeft: number }) => {
          const { roomId, timeLeft } = data;
          const playerInfo = playerData.get(socket.id);

          // Send warning to room if under 10 seconds
          if (timeLeft <= 10) {
            io.to(roomId).emit("timer:warning", {
              playerId: socket.id,
              playerName: playerInfo?.name || "Unknown",
              timeLeft,
            });
          }
        },
      );

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        const playerInfo = playerData.get(socket.id);

        if (playerInfo?.roomId) {
          // Remove from room
          const room = gameRooms.get(playerInfo.roomId);
          if (room) {
            room.delete(socket.id);

            // Notify room that player left
            socket.to(playerInfo.roomId).emit("player:left", {
              playerId: socket.id,
              name: playerInfo.name,
              players: Array.from(room).map((id) => ({
                id,
                name: playerData.get(id)?.name || "Unknown",
              })),
            });

            // Clean up empty rooms
            if (room.size === 0) {
              gameRooms.delete(playerInfo.roomId);
            }
          }
        }

        playerData.delete(socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
