"use client";

import { create } from 'zustand';

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  tiles: any[];
  userId: string;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface GameState {
  players: Player[];
  board: any[][] | null;
  scores: Record<string, number>;
  racks: Record<string, any[]>;
  currentTurn: number;
  chatMessages: ChatMessage[];
  gameStarted: boolean;
  lastChallengeResult: any | null;

  setRoomState: (state: any) => void;
  addChatMessage: (message: ChatMessage) => void;
  setGameStarted: (started: boolean) => void;
  updateRack: (playerId: string, rack: any[]) => void;
  setLastChallengeResult: (result: any) => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  board: null,
  scores: {},
  racks: {},
  currentTurn: 0,
  chatMessages: [],
  gameStarted: false,
  lastChallengeResult: null,

  setRoomState: (roomState) => {
    const fullPlayers = roomState.players.map((pid: string, idx: number) => ({
      id: pid,
      name: `Player ${idx + 1} (${pid.slice(0, 4)})`,
      score: roomState.scores[pid] || 0,
      isHost: idx === 0,
      isReady: true,
      tiles: roomState.racks[pid] || [],
      userId: pid,
    }));

    set({
      players: fullPlayers,
      board: roomState.board,
      scores: roomState.scores,
      racks: roomState.racks,
      currentTurn: roomState.turnIndex,
    });
  },

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  setGameStarted: (started) => set({ gameStarted: started }),

  updateRack: (playerId, rack) => set((state) => ({
    racks: { ...state.racks, [playerId]: rack }
  })),

  setLastChallengeResult: (result) => set({ lastChallengeResult: result }),
}));
