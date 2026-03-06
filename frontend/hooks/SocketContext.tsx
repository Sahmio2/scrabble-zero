"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore } from "./useGameStore";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { setRoomState, addChatMessage, setGameStarted, updateRack } = useGameStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const socketInstance = io("http://localhost:4000", {
      auth: { token }
    });

    socketInstance.on("connect", () => {
      setConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on("room:state", (state) => {
      setRoomState(state);
    });

    socketInstance.on("chat:message", (message) => {
      addChatMessage(message);
    });

    socketInstance.on("game:started", () => {
      setGameStarted(true);
    });

    socketInstance.on("challenge:result", (result) => {
      const { setLastChallengeResult } = useGameStore.getState();
      setLastChallengeResult(result);
    });

    socketInstance.on("rack:update", (rack) => {
      // Need playerId context here if possible, or assume it's for current user
      // For now, let's just log it or handle it in useSocket
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [setRoomState, addChatMessage, setGameStarted, updateRack]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
