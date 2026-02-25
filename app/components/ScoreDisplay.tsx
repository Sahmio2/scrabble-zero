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
  isValidating = false,
  bingoBonus = false,
}: ScoreDisplayProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
      <h3 className="text-lg font-bold text-stone-900">Move Preview</h3>
      
      {isValidating ? (
        <div className="flex items-center gap-2 text-stone-600">
          <div className="w-4 h-4 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm">Validating words...</span>
        </div>
      ) : words.length === 0 ? (
        <p className="text-stone-500 text-sm">Place tiles to see preview</p>
      ) : (
        <>
          <div className="space-y-2">
            {words.map((word, index) => (
              <div
                key={`${word.word}-${index}`}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  word.isValid
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900 uppercase">
                    {word.word}
                  </span>
                  {!word.isValid && (
                    <span className="text-xs text-red-600">Invalid</span>
                  )}
                </div>
                <span className="font-bold text-stone-700">
                  +{word.score}
                </span>
              </div>
            ))}
          </div>

          {bingoBonus && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-semibold text-amber-800">BINGO! (7 tiles)</span>
              <span className="font-bold text-amber-700">+50</span>
            </div>
          )}

          <div className="border-t border-stone-200 pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                {bingoBonus ? totalScore + 50 : totalScore}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
