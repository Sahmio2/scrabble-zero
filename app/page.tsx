import React from "react";
import { ScrabbleBoard } from "./components/ScrabbleBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-stone-900 sm:text-5xl">
            Scrabble Zero
          </h1>
          <p className="text-base text-stone-600 sm:text-lg">
            Invite friends, make words, and climb the leaderboards in real time.
          </p>
        </header>

        <section className="w-full">
          <ScrabbleBoard />
        </section>

        <section className="w-full">
          <a
            href="/game"
            className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Play Now
          </a>
        </section>
      </div>
    </main>
  );
}
