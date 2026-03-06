"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/hooks/SocketContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SocketProvider>{children}</SocketProvider>
    </SessionProvider>
  );
}
