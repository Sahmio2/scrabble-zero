import React from "react";
import { Leaderboard } from "@/app/components/Leaderboard";
import { Navigation } from "@/app/components/Navigation";

export const metadata = {
  title: "Leaderboard | Scrabble Zero",
  description: "Top Scrabble Zero players and rankings",
};

export default function LeaderboardPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
        <div className="mx-auto max-w-5xl">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-stone-900 sm:text-5xl">
              🏆 Leaderboard
            </h1>
            <p className="text-base text-stone-600 sm:text-lg mt-2">
              See who&apos;s dominating the board
            </p>
          </header>

          <Leaderboard />
        </div>
      </main>
    </>
  );
}
