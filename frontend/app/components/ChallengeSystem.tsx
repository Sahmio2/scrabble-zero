"use client";

import React, { useState } from "react";
import { useSocket } from "@/hooks/useSocket";

interface ChallengeSystemProps {
  roomId: string;
  currentUserId: string;
  players: Array<{ id: string; name: string }>;
  currentTurn: number;
  lastMove?: { word: string; playerId: string };
}

export function ChallengeSystem({
  roomId,
  currentUserId,
  players,
  currentTurn,
  lastMove,
}: ChallengeSystemProps) {
  const {
    activeChallenge,
    challengeTimeLeft,
    issueChallenge,
    respondToChallenge,
  } = useSocket(roomId);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [challengeWord, setChallengeWord] = useState("");

  const canChallenge = lastMove && lastMove.playerId !== currentUserId;
  const isBeingChallenged =
    activeChallenge && activeChallenge.challengerId !== currentUserId;

  const handleIssueChallenge = () => {
    if (lastMove && canChallenge) {
      issueChallenge(roomId, lastMove.playerId, lastMove.word);
      setShowChallengeDialog(false);
    }
  };

  const handleRespondToChallenge = (valid: boolean) => {
    respondToChallenge(roomId, valid);
  };

  return (
    <>
      {/* Challenge Button - Very Compact */}
      {canChallenge && (
        <div>
          <button
            onClick={() => setShowChallengeDialog(true)}
            className="w-full bg-[#c94c4c] text-white py-1.5 px-3 rounded-lg font-bold hover:bg-[#d32f2f] transition-all shadow-md uppercase text-[10px] tracking-widest"
          >
            🏁 Challenge Word
          </button>
        </div>
      )}

      {/* Active Challenge Dialog - Compact */}
      {isBeingChallenged && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#145a32] border-4 border-[#0a2e1a] rounded-xl shadow-2xl p-4 max-w-sm w-full">
            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#e8f5e8] mb-3 text-center">
              Word Challenge!
            </h3>

            <div className="bg-[#0a2e1a] border border-[#0e5a30] rounded-lg p-3 mb-4 text-center">
              <p className="text-[10px] uppercase font-bold text-[#6da87a] mb-1">
                {activeChallenge.challengerName} challenges:
              </p>
              <p className="text-xl font-serif font-bold text-[#c0883e]">
                "{activeChallenge.word}"
              </p>
            </div>

            {typeof challengeTimeLeft === "number" && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-[10px] uppercase font-bold text-[#a3c9a8]">
                  Time Remaining:
                </span>
                <span
                  className={`text-sm font-mono font-bold ${challengeTimeLeft <= 5 ? "text-red-400 animate-pulse" : "text-[#e8f5e8]"}`}
                >
                  {challengeTimeLeft}s
                </span>
              </div>
            )}

            <div className="grid gap-2">
              <button
                onClick={() => handleRespondToChallenge(true)}
                className="w-full bg-[#c0883e] text-white py-2 rounded font-bold hover:bg-[#d4a04a] transition-all uppercase text-[10px] tracking-widest shadow-md"
              >
                ✅ Valid Word
              </button>
              <button
                onClick={() => handleRespondToChallenge(false)}
                className="w-full bg-[#c94c4c] text-white py-2 rounded font-bold hover:bg-[#d32f2f] transition-all uppercase text-[10px] tracking-widest shadow-md"
              >
                ❌ Invalid Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Confirmation Dialog - Compact */}
      {showChallengeDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#145a32] border-4 border-[#0a2e1a] rounded-xl shadow-2xl p-4 max-w-sm w-full">
            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-[#e8f5e8] mb-3 text-center">
              Issue Challenge
            </h3>

            <div className="bg-[#0a2e1a] border border-[#0e5a30] rounded-lg p-3 mb-4 text-center">
              <p className="text-[10px] uppercase font-bold text-[#6da87a] mb-1">
                Challenging:
              </p>
              <p className="text-xl font-serif font-bold text-[#c0883e]">
                "{lastMove?.word}"
              </p>
            </div>

            <p className="text-[10px] text-center text-[#a3c9a8] mb-4 leading-tight">
              ⚠️ If the word is valid, you lose 10 points. If invalid, the move
              is reversed.
            </p>

            <div className="grid gap-2">
              <button
                onClick={handleIssueChallenge}
                className="w-full bg-[#c0883e] text-white py-2 rounded font-bold hover:bg-[#d4a04a] transition-all uppercase text-[10px] tracking-widest shadow-md"
              >
                Confirm Challenge
              </button>
              <button
                onClick={() => setShowChallengeDialog(false)}
                className="w-full bg-transparent text-[#a3c9a8] border border-[#2d8a54] py-2 rounded font-bold hover:bg-[#2d8a54]/20 transition-all uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Result Notification - Compact */}
      {activeChallenge && activeChallenge.challengerId !== currentUserId && (
        <div className="fixed top-12 right-4 bg-[#c0883e] text-white px-3 py-1.5 rounded-lg shadow-lg z-40 border border-[#d4a04a]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Challenging...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
