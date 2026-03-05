import { Server } from "socket.io";
import { getRoom, createRoom, saveRoom } from "../rooms/gameRooms";
import { validateMove } from "../engine/validateMove";
import { calculateScore } from "../engine/scoreMove";
import { drawTiles } from "../engine/drawTiles";
import { prisma } from "../lib/prisma";

export function registerGameSockets(io: Server) {
  io.on("connection", (socket) => {
    
    // Player joins the room and server authoritative state is created
    socket.on("room:join", async ({ roomId, playerId }: { roomId: string, playerId: string }) => {
      let room = await getRoom(roomId);

      if (!room) {
        room = await createRoom(roomId);
      }

      // Add player if not already in room
      if (!room.players.includes(playerId)) {
        room.players.push(playerId);
        room.scores[playerId] = 0;
        room.racks[playerId] = drawTiles(room.tileBag, 7);
        
        // If it's a new game (gameId is null), and we have players, consider creating a DB record
        // For simplicity, let's create it when the second player joins or game "starts"
        // Here we'll create it if it doesn't exist yet and there's at least one player
        if (!room.gameId) {
          try {
            // Root schema User uses email. We'll use playerId as email for now or mapping.
            // Let's assume playerId is used where email is expected in this simplified context.
            await prisma.user.upsert({
              where: { email: playerId },
              update: {},
              create: { email: playerId, name: playerId }
            });

            const user = await prisma.user.findUnique({ where: { email: playerId } });
            if (user) {
              const dbGame = await prisma.game.create({
                data: {
                  code: roomId,
                  mode: "classic",
                  status: "active",
                  players: {
                    create: [{ 
                        userId: user.id, 
                        score: 0,
                        tiles: JSON.stringify(room.racks[playerId]),
                        order: 0
                    }]
                  }
                }
              });
              room.gameId = dbGame.id;
            }
          } catch (err) {
            console.error("Failed to create DB game record:", err);
          }
        } else {
           try {
             await prisma.user.upsert({
               where: { email: playerId },
               update: {},
               create: { email: playerId, name: playerId }
             });
             const user = await prisma.user.findUnique({ where: { email: playerId } });
             if (user) {
               await prisma.gamePlayer.create({
                 data: {
                   gameId: room.gameId,
                   userId: user.id,
                   score: 0,
                   tiles: JSON.stringify(room.racks[playerId]),
                   order: room.players.length - 1
                 }
               });
             }
           } catch (err) {
             console.error("Failed to add player to DB game record:", err);
           }
        }

        await saveRoom(roomId, room);
      }

      socket.join(roomId);

      // Send the player's personal rack
      socket.emit("rack:update", room.racks[playerId]);

      // Broadcast the shared room state to everyone in the room
      io.to(roomId).emit("room:state", room);
    });

    socket.on("move:submit", async (data: { roomId: string; playerId: string; tiles: any[] }) => {
      const { roomId, playerId, tiles } = data;
      
      const room = await getRoom(roomId);

      if (!room) return;

      // Ensure it's the correct player's turn
      const currentPlayerId = room.players[room.turnIndex];
      if (currentPlayerId !== playerId) {
        socket.emit("move:rejected", { reason: "Not your turn" });
        return;
      }

      // The validateMove function uses { x, y } in the example, so we map them
      const mappedTiles = tiles.map(t => ({ x: t.col, y: t.row, letter: t.letter }));

      const valid = validateMove(room.board, mappedTiles);

      if (!valid) {
        socket.emit("move:rejected", { reason: "Invalid move" });
        return;
      }

      // 1. Update board state
      for (const tile of mappedTiles) {
        room.board[tile.y][tile.x] = tile.letter;
      }

      // 2. Calculate score and update
      const score = calculateScore(tiles);
      room.scores[playerId] = (room.scores[playerId] || 0) + score;

      // Persist move to DB
      if (room.gameId) {
        try {
          const user = await prisma.user.findUnique({ where: { email: playerId } });
          if (user) {
            await prisma.gameMove.create({
              data: {
                gameId: room.gameId,
                userId: user.id,
                move: JSON.stringify(tiles),
                score
              }
            });
            
            // Also update score in GamePlayer record
            await prisma.gamePlayer.updateMany({
              where: { gameId: room.gameId, userId: user.id },
              data: { 
                  score: room.scores[playerId],
                  tiles: JSON.stringify(room.racks[playerId])
              }
            });
          }
        } catch (err) {
          console.error("Failed to persist move to DB:", err);
        }
      }

      // Remove used tiles from the player's rack
      const usedCount = mappedTiles.length;
      for (let i = 0; i < usedCount; i++) {
         room.racks[playerId].pop(); // naive removal
      }

      // 3. Refill Player Rack
      const newTiles = drawTiles(room.tileBag, usedCount);
      room.racks[playerId].push(...newTiles);

      // Update turn index
      room.turnIndex = (room.turnIndex + 1) % room.players.length;

      // Save mutated state back to Redis
      await saveRoom(roomId, room);

      // 4. Send updated rack explicitly to the moving player
      socket.emit("rack:update", room.racks[playerId]);
      
      // Tell other players what the move was explicitly if needed
      io.to(roomId).emit("move:played", { playerId, tiles, score });

      // 5. Broadcast complete state
      io.to(roomId).emit("room:state", room);
      
      // Check if game is finished (all tiles used)
      if (room.tileBag.length === 0 && room.players.every((p: string) => room.racks[p] && room.racks[p].length === 0)) {
         if (room.gameId) {
           await prisma.game.update({
             where: { id: room.gameId },
             data: { status: "finished" }
           });
         }
         io.to(roomId).emit("game:finished", { scores: room.scores });
      }
    });
  });
}

