"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-20 h-8 bg-stone-200 rounded-lg animate-pulse"></div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-sm font-semibold text-stone-600">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="text-sm font-medium text-stone-700 hidden sm:block">
            {session.user?.name || "User"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/signin"
        className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/auth/signup"
        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
