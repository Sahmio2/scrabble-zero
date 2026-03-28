import { Queue, RedisOptions } from 'bullmq';

const connection: RedisOptions = {
  host: 'localhost',
  port: 6379,
};

export const gameQueue = new Queue('game-updates', { connection });

export const QUEUE_JOBS = {
  START_GAME: 'START_GAME',
  SAVE_MOVE: 'SAVE_MOVE',
  END_GAME: 'END_GAME',
};
