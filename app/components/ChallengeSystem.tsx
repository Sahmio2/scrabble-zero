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
  lastMove 
}: ChallengeSystemProps) {
  const { activeChallenge, issueChallenge, respondToChallenge } = useSocket(roomId);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [challengeWord, setChallengeWord] = useState("");

  const canChallenge = lastMove && lastMove.playerId !== currentUserId;
  const isBeingChallenged = activeChallenge && activeChallenge.challengerId !== currentUserId;

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
      {/* Challenge Button */}
      {canChallenge && (
        <div className="mb-4">
          <button
            onClick={() => setShowChallengeDialog(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            🏁 Challenge Word
          </button>
        </div>
      )}

      {/* Active Challenge Dialog */}
      {isBeingChallenged && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Word Challenge!</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-stone-700">
                <span className="font-semibold">{activeChallenge.challengerName}</span> has challenged the word:
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-2 text-center">
                "{activeChallenge.word}"
              </p>
            </div>

            <div className="text-sm text-stone-600 mb-6">
              If the word is valid, the challenger loses their turn. If invalid, your move will be reversed.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRespondToChallenge(true)}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                ✅ Valid Word
              </button>
              <button
                onClick={() => handleRespondToChallenge(false)}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                ❌ Invalid Word
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Confirmation Dialog */}
      {showChallengeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-stone-900 mb-4">Issue Challenge</h3>
            
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
              <p className="text-stone-700 mb-2">
                You are challenging the word played by:
              </p>
              <p className="font-semibold text-stone-900">
                {players.find(p => p.id === lastMove?.playerId)?.name}
              </p>
              <p className="text-2xl font-bold text-stone-900 mt-3 text-center">
                "{lastMove?.word}"
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                ⚠️ If the word is valid, you will lose your next turn. If invalid, the move will be reversed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleIssueChallenge}
                className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Issue Challenge
              </button>
              <button
                onClick={() => setShowChallengeDialog(false)}
                className="flex-1 bg-stone-200 text-stone-700 py-3 px-4 rounded-lg font-semibold hover:bg-stone-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Result Notification */}
      {activeChallenge && activeChallenge.challengerId !== currentUserId && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">Challenge in progress...</span>
          </div>
        </div>
      )}
    </>
  );
}
