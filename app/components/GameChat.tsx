"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

interface GameChatProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
}

export function GameChat({
  roomId,
  currentUserId,
  currentUserName,
}: GameChatProps) {
  const { chatMessages, sendChatMessage } = useSocket(roomId);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(roomId, message.trim());
      setMessage("");
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`fixed bottom-4 right-4 w-72 sm:w-80 transition-all ${
        isOpen ? "h-80 sm:h-96" : "h-12"
      } bg-[#0a2e1a] rounded-lg shadow-2xl border border-[#0e5a30] z-40 overflow-hidden`}
      role="complementary"
      aria-label="Game chat"
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between p-3 bg-[#145a32] border-b border-[#0a2e1a] cursor-pointer hover:bg-[#1a5c2a] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
        aria-controls="chat-messages"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
      >
        <h3 className="text-xs uppercase tracking-widest font-bold text-[#e8f5e8]">
          Game Chat
        </h3>
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && !isOpen && (
            <span className="bg-[#c0883e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {chatMessages.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#a3c9a8] transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Chat Content */}
      {isOpen && (
        <div className="flex flex-col h-[calc(100%-48px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0a2e1a] custom-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-center text-[#6da87a] text-xs py-8 font-medium italic">
                No messages yet...
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.playerId === currentUserId ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      msg.playerId === currentUserId
                        ? "bg-[#c0883e] text-white rounded-br-none"
                        : "bg-[#1e7a46] text-[#e8f5e8] rounded-bl-none"
                    } rounded-xl px-3 py-2 shadow-md`}
                  >
                    {msg.playerId !== currentUserId && (
                      <div className="text-[10px] font-bold mb-1 text-[#b8dab8] uppercase tracking-tighter">
                        {msg.playerName}
                      </div>
                    )}
                    <div className="text-sm font-medium leading-relaxed">
                      {msg.message}
                    </div>
                    <div
                      className={`text-[9px] mt-1 font-bold uppercase tracking-tighter ${
                        msg.playerId === currentUserId
                          ? "text-white/70"
                          : "text-[#6da87a]"
                      }`}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#145a32] border-t border-[#0a2e1a]"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-[#0a2e1a] border border-[#0e5a30] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c0883e] text-[#e8f5e8] text-sm placeholder-[#6da87a]"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-[#c0883e] text-white px-3 py-2 rounded-lg hover:bg-[#d4a04a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
