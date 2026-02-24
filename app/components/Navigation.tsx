"use client";

import React from "react";
import Link from "next/link";
import { AuthButton } from "./AuthButton";

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-stone-900">Scrabble Zero</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link href="/game" className="text-stone-600 hover:text-stone-900 transition-colors">
              Play
            </Link>
            <Link href="/leaderboard" className="text-stone-600 hover:text-stone-900 transition-colors">
              Leaderboard
            </Link>
            <Link href="/friends" className="text-stone-600 hover:text-stone-900 transition-colors">
              Friends
            </Link>
          </div>

          {/* Auth Button */}
          <AuthButton />

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-stone-600 hover:text-stone-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
