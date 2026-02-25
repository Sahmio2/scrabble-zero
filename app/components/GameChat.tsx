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
      } bg-white rounded-lg shadow-xl border border-stone-200 z-40`}
      role="complementary"
      aria-label="Game chat"
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between p-3 bg-stone-100 rounded-t-lg cursor-pointer"
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
        <h3 className="font-semibold text-stone-900">Game Chat</h3>
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && !isOpen && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {chatMessages.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-stone-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-center text-stone-500 text-sm py-8">
                No messages yet. Start a conversation!
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
                    className={`max-w-[80%] ${
                      msg.playerId === currentUserId
                        ? "bg-blue-600 text-white"
                        : "bg-stone-100 text-stone-900"
                    } rounded-lg px-3 py-2`}
                  >
                    {msg.playerId !== currentUserId && (
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {msg.playerName}
                      </div>
                    )}
                    <div className="text-sm wrap-break-word">{msg.message}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.playerId === currentUserId
                          ? "text-blue-100"
                          : "text-stone-500"
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
            className="p-3 border-t border-stone-200"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
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
            <div className="text-xs text-stone-500 mt-1">
              Press Enter to send
            </div>
          </form>
        </>
      )}
    </div>
  );
}
