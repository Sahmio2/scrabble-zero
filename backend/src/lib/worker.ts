import { Worker } from 'bullmq';
import { prisma } from './prisma';
import { QUEUE_JOBS } from './queue';

const connection = {
  host: 'localhost',
  port: 6379,
};

export const gameWorker = new Worker(
  'game-updates',
  async (job) => {
    const { type, data } = job.data;

    try {
      switch (type) {
        case QUEUE_JOBS.START_GAME: {
          const { roomId, players } = data;
          
          // Ensure users exist
          for (const playerId of players) {
             await prisma.user.upsert({
               where: { email: playerId },
               update: {},
               create: { email: playerId, name: playerId }
             });
          }

          const users = await prisma.user.findMany({
            where: { email: { in: players } }
          });

          const game = await prisma.game.create({
            data: {
              code: roomId,
              mode: "classic",
              status: "active",
              players: {
                create: users.map((u, index) => ({
                  userId: u.id,
                  score: 0,
                  tiles: "", // initial empty or random if needed
                  order: index
                }))
              }
            }
          });

          return { gameId: game.id };
        }

        case QUEUE_JOBS.SAVE_MOVE: {
          const { gameId, playerId, word, score, tiles } = data;
          
          const user = await prisma.user.findUnique({ where: { email: playerId } });
          if (!user) throw new Error(`User ${playerId} not found`);

          await prisma.gameMove.create({
            data: {
              gameId,
              userId: user.id,
              move: word || "", // root schema uses 'move'
              score
            }
          });

          // Also update player tiles in GamePlayer
          if (tiles) {
            await prisma.gamePlayer.updateMany({
              where: { gameId, userId: user.id },
              data: { tiles: JSON.stringify(tiles) }
            });
          }
          break;
        }

        case QUEUE_JOBS.END_GAME: {
          const { gameId, scores } = data;
          
          await prisma.game.update({
            where: { id: gameId },
            data: { status: "finished" }
          });

          // Update player scores
          for (const [playerId, score] of Object.entries(scores)) {
             const user = await prisma.user.findUnique({ where: { email: playerId } });
             if (user) {
               await prisma.gamePlayer.updateMany({
                 where: { gameId, userId: user.id },
                 data: { score: score as number }
               });
             }
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  { connection }
);
