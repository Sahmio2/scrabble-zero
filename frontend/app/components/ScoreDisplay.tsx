"use client";

import React from "react";
import type { WordScore } from "@/lib/scoring";

interface ScoreDisplayProps {
  words: WordScore[];
  totalScore: number;
  isValidating?: boolean;
  bingoBonus?: boolean;
}

export function ScoreDisplay({
  words,
  totalScore,
  isValidating,
  bingoBonus,
}: ScoreDisplayProps) {
  return (
    <div className="bg-[#0a2e1a] border border-[#0e5a30] rounded-lg p-1.5 shadow-inner">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {words.length > 0 ? (
            words.map((word, index) => (
              <div
                key={index}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  word.isValid
                    ? "bg-[#1e7a46] text-[#e8f5e8]"
                    : "bg-[#7a1e1e] text-[#ffe8e8]"
                }`}
              >
                <span className="font-serif tracking-tight">{word.word}</span>
                <span className="opacity-60 font-sans">{word.score}</span>
              </div>
            ))
          ) : (
            <span className="text-[10px] text-[#6da87a] italic ml-1">
              No words formed
            </span>
          )}
        </div>

        <div className="flex flex-col items-end min-w-fit">
          <div className="flex items-center gap-1">
            {bingoBonus && (
              <span className="text-[9px] text-[#c0883e] font-bold animate-bounce">
                BINGO!
              </span>
            )}
            <span className="text-xs font-serif font-bold text-[#e8f5e8]">
              {isValidating ? "..." : totalScore}
            </span>
          </div>
          <span className="text-[8px] uppercase tracking-tighter font-bold text-[#6da87a] leading-none">
            Pts
          </span>
        </div>
      </div>
    </div>
  );
}
