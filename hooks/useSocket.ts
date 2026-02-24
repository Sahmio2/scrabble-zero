"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Player {
  id: string;
  name: string;
}

export interface TurnTimer {
  playerId: string;
  startTime: Date;
  duration: number;
}

export interface GameMove {
  tiles: { letter: string; row: number; col: number }[];
  score: number;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface Challenge {
  challengerId: string;
  challengerName: string;
  word: string;
}

export const useSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [turnTimer, setTurnTimer] = useState<TurnTimer | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
      setSocket(null);
    });

    // Room events
    socketInstance.on("room:state", (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    socketInstance.on("player:joined", (data: { playerId: string; name: string; players: Player[] }) => {
      setPlayers(data.players);
    });

    socketInstance.on("player:left", (data: { playerId: string; name: string; players: Player[] }) => {
      setPlayers(data.players);
    });

    // Game events
    socketInstance.on("game:started", (data: { players: Player[]; currentTurn: number; turnTimer: TurnTimer }) => {
      setPlayers(data.players);
      setCurrentTurn(data.currentTurn);
      setTurnTimer(data.turnTimer);
      setGameStarted(true);
      startTimer(data.turnTimer);
    });

    socketInstance.on("turn:changed", (data: { currentTurn: number; turnTimer: TurnTimer }) => {
      setCurrentTurn(data.currentTurn);
      setTurnTimer(data.turnTimer);
      startTimer(data.turnTimer);
    });

    socketInstance.on("turn:start", (timer: TurnTimer) => {
      setTurnTimer(timer);
      startTimer(timer);
    });

    // Move events
    socketInstance.on("move:made", (data: { playerId: string; playerName: string; move: GameMove }) => {
      // Handle move broadcast - will be processed by game component
      console.log("Move made:", data);
    });

    // Chat events
    socketInstance.on("chat:message", (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Challenge events
    socketInstance.on("challenge:received", (challenge: Challenge) => {
      setActiveChallenge(challenge);
    });

    socketInstance.on("challenge:announced", (data: { challengerName: string; word: string }) => {
      console.log("Challenge announced:", data);
    });

    socketInstance.on("challenge:result", (data: { playerId: string; playerName: string; valid: boolean }) => {
      console.log("Challenge result:", data);
      setActiveChallenge(null);
    });

    // Timer warnings
    socketInstance.on("timer:warning", (data: { playerId: string; playerName: string; timeLeft: number }) => {
      console.log("Timer warning:", data);
    });

    return () => {
      socketInstance.disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = (timer: TurnTimer) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const startTime = new Date(timer.startTime).getTime();
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timer.duration - elapsed);
      setTimeLeft(remaining);

      // Send warning if under 10 seconds
      if (remaining === 10 && socket) {
        socket.emit("timer:warning", {
          roomId,
          timeLeft: remaining,
        });
      }

      // Auto-pass if time runs out
      if (remaining === 0 && socket) {
        clearInterval(timerRef.current!);
        // Handle auto-pass logic
        handleAutoPass();
      }
    }, 1000);
  };

  const handleAutoPass = () => {
    if (socket && roomId) {
      // Move to next player
      const nextPlayerIndex = (currentTurn + 1) % players.length;
      socket.emit("turn:end", {
        roomId,
        nextPlayerIndex,
      });
    }
  };

  const joinRoom = (name: string, roomId: string) => {
    if (socket) {
      socket.emit("player:join", { name, roomId });
    }
  };

  const startGame = (roomId: string) => {
    if (socket) {
      socket.emit("game:start", { roomId });
    }
  };

  const submitMove = (roomId: string, move: GameMove) => {
    if (socket) {
      socket.emit("move:submit", { roomId, move });
    }
  };

  const sendChatMessage = (roomId: string, message: string) => {
    if (socket) {
      socket.emit("chat:message", { roomId, message });
    }
  };

  const issueChallenge = (roomId: string, targetPlayerId: string, word: string) => {
    if (socket) {
      socket.emit("challenge:issued", { roomId, targetPlayerId, word });
    }
  };

  const respondToChallenge = (roomId: string, valid: boolean) => {
    if (socket) {
      socket.emit("challenge:respond", { roomId, valid });
    }
  };

  const endTurn = (roomId: string, nextPlayerIndex: number) => {
    if (socket) {
      socket.emit("turn:end", { roomId, nextPlayerIndex });
    }
  };

  return {
    socket,
    connected,
    players,
    currentTurn,
    turnTimer,
    timeLeft,
    chatMessages,
    gameStarted,
    activeChallenge,
    joinRoom,
    startGame,
    submitMove,
    sendChatMessage,
    issueChallenge,
    respondToChallenge,
    endTurn,
  };
};
