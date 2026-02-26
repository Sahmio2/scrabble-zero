import React from "react";
import { ScrabbleBoard } from "./components/ScrabbleBoard";
import Link from "next/link";
import { AuthButton } from "./components/AuthButton";

export default function Home() {
  const navLinks = [
    { 
      href: "/leaderboard", 
      label: "Leaderboard",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      href: "/profile", 
      label: "Profile",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      href: "/settings",
      label: "Settings",
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-stone-100 via-stone-200 to-stone-100 p-4 md:p-8 lg:p-12 overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8 min-h-[calc(100vh-6rem)] pt-8 lg:pt-16">
        
        {/* Left Side: Title & Scrabble Board */}
        <section className="w-full lg:w-[60%] flex flex-col items-center lg:items-start xl:items-center px-4">
          <header className="space-y-4 mb-10 text-center lg:text-left xl:text-center w-full">
            <h1 className="text-5xl font-extrabold text-stone-900 sm:text-6xl md:text-7xl tracking-tight">
              Scrabble <span className="text-blue-600">Zero</span>
            </h1>
            <p className="text-lg text-stone-600 sm:text-xl max-w-lg mx-auto lg:mx-0 xl:mx-auto">
              Invite friends, make words, and climb the leaderboards in real time.
            </p>
          </header>

          <div className="scale-[0.85] sm:scale-100 lg:scale-105 xl:scale-110 transform origin-top lg:origin-top-left xl:origin-top transition-transform">
            <ScrabbleBoard />
          </div>
        </section>

        {/* Right Side: Stacked Menus & Action Buttons */}
        <section className="w-full lg:w-[40%] flex flex-col items-stretch justify-center gap-8 px-4 lg:pt-24 mt-4 lg:mt-0">
          
          {/* Stacked Menus */}
          <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white text-stone-700 shadow-sm border border-stone-200 hover:border-blue-400 hover:shadow-md hover:text-blue-600 transition-all w-full group"
              >
                <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {link.icon}
                </div>
                <span className="text-xl font-bold">{link.label}</span>
                <svg className="w-5 h-5 ml-auto text-stone-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-2 pt-6 w-full max-w-sm mx-auto">
            <div className="flex w-full gap-4">
              <Link
                href="/game"
                className="flex-1 flex items-center justify-center text-center bg-blue-600 text-white py-4 px-4 rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
              >
                Play Now
              </Link>
              <Link
                href="/auth/signup"
                className="flex-1 flex items-center justify-center text-center bg-stone-900 text-white py-4 px-4 rounded-2xl font-bold text-lg hover:bg-stone-800 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md"
              >
                Sign Up
              </Link>
            </div>
            
            <Link
              href="/game?guest=true"
              className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4 transition-colors mt-2 font-medium"
            >
              continue as guest
            </Link>
          </div>

        </section>

      </div>
    </main>
  );
}
