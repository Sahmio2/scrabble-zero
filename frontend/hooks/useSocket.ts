"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { useSocketContext } from "./SocketContext";
import { useGameStore } from "./useGameStore";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface TurnTimer {
  playerId: string;
  startTime: Date;
  duration: number;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export const useSocket = (roomId?: string) => {
  const { socket, connected } = useSocketContext();
  const store = useGameStore();
  
  // Local time left for current turn
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (store.gameStarted) {
      // Basic timer logic (needs server sync for precision, but okay for UI)
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [store.gameStarted]);

  const joinRoom = (name: string, roomId: string) => {
    if (socket) {
      const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
      const playerName = storedUser.name || name;
      socket.emit("room:join", { roomId, playerId: playerName });
    }
  };

  const startGame = (roomId: string) => {
    if (socket) {
      socket.emit("game:start", { roomId });
    }
  };

  const submitMove = (roomId: string, playerId: string, tilesPlaced: any[]) => {
    if (socket) {
      socket.emit("move:submit", { roomId, playerId, tiles: tilesPlaced });
    }
  };

  const sendChatMessage = (roomId: string, message: string) => {
    if (socket) {
      const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
      socket.emit("chat:message", { roomId, playerId: storedUser.id || "Guest", message });
    }
  };

  const endTurn = (roomId: string, nextPlayerIndex: number) => {
    if (socket) {
      socket.emit("turn:end", { roomId, nextPlayerIndex });
    }
  };

  const passTurn = (roomId: string, playerId: string) => {
    if (socket) {
      socket.emit("pass:turn", { roomId, playerId });
    }
  };

  const exchangeTiles = (roomId: string, playerId: string, tiles: string[]) => {
    if (socket) {
      socket.emit("exchange:tiles", { roomId, playerId, tiles });
    }
  };

  const issueChallenge = (roomId: string, playerId: string, word: string) => {
    if (socket) {
      socket.emit("challenge:issue", { roomId, playerId, word });
    }
  };

  const respondToChallenge = (roomId: string, valid: boolean) => {
    if (socket) {
      socket.emit("challenge:respond", { roomId, valid });
    }
  };

  return {
    socket,
    connected,
    ...store,
    timeLeft,
    joinRoom,
    startGame,
    submitMove,
    sendChatMessage,
    passTurn,
    exchangeTiles,
    endTurn,
    issueChallenge,
    respondToChallenge,
    activeChallenge: (store as any).activeChallenge || null,
    challengeTimeLeft: (store as any).challengeTimeLeft || null,
    lastChallengeResult: store.lastChallengeResult,
  };
};
