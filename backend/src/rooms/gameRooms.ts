import { createEmptyBoard } from "../engine/board";
import { generateTileBag } from "../engine/tileBag";
import { redis } from "../redis/client";

export async function getRoom(roomId: string) {
  const roomData = await redis.get(`room:${roomId}`);
  if (!roomData) return null;
  return JSON.parse(roomData);
}

export async function saveRoom(roomId: string, room: any) {
  await redis.set(`room:${roomId}`, JSON.stringify(room));
}

export async function createRoom(roomId: string) {
  const room: any = {
    id: roomId,
    gameId: null,
    board: createEmptyBoard(),
    players: [],
    scores: {},
    racks: {},
    tileBag: generateTileBag(),
    turnIndex: 0
  };

  await saveRoom(roomId, room);
  return room;
}
