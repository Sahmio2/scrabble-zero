"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PlayerProfileCard } from "@/app/components/PlayerProfileCard";
import { Navigation } from "@/app/components/Navigation";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <PlayerProfileCard userId={userId} />
        </div>
      </main>
    </>
  );
}
