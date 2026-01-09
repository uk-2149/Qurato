'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const session = useSession();

  const steps = [
    {
      number: '1',
      title: 'Find a YouTube Playlist',
      desc: 'Discover any educational playlist on YouTube that you want to learn from seriously.',
      icon: '🔍',
    },
    {
      number: '2',
      title: 'Paste the URL',
      desc: 'Copy the playlist link and paste it into Qurato. We instantly turn it into a structured course.',
      icon: '📋',
    },
    {
      number: '3',
      title: 'Learn Distraction-Free',
      desc: 'Watch videos in our clean player — no ads, no recommendations, no comments.',
      icon: '🎯',
    },
    {
      number: '4',
      title: 'Track Your Progress',
      desc: 'Mark lectures complete, see percentages, and resume exactly where you left off.',
      icon: '📊',
    },
  ];

  return (
    <>
      {/* Global classes for light mode */}
      <style jsx global>{`
        html { @apply bg-gray-50 text-gray-900; }
        .dark html { @apply bg-black text-white; }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-black/80 backdrop-blur-lg border-b border-white/10 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.h1
              className="text-2xl md:text-3xl font-bold bg-linear-to-br from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-500 bg-clip-text text-transparent"
            >
              Qurato
            </motion.h1>
            <span
    className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-300 border border-purple-200 dark:border-purple-700/40 translate-y-0.5">
    v1.0
  </span>
            {/* <div className="hidden md:flex space-x-8">
              <a href="#how" className="hover:text-purple-400 transition md:text-lg">How it Works</a>
              <a href="/dashboard" className="hover:text-purple-400 transition md:text-lg">Dashboard</a>
            </div> */}
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle />

            {session?.data?.user ? (
              <button
                onClick={() => redirect("/dashboard")}
                className='px-5 py-2 rounded-full border border-purple-500 hover:bg-purple-500/10 transition md:text-lg'
              >
                Dashboard
              </button>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <a href="/login" className="px-5 py-2 rounded-full border border-purple-500 hover:bg-purple-500/10 transition">
                  Login
                </a>
                <a href="/register" className="px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition">
                  Register
                </a>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            { session?.data?.user ? (
              <div className="md:hidden px-6 pb-4 space-y-4">
                <button
                  onClick={() => redirect("/dashboard")}
                  className='w-full px-5 py-2 rounded-full border border-purple-500 hover:bg-purple-500/10 transition md:text-lg'
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="md:hidden bg-gray-50 dark:bg-black border-t border-gray-800">
            <div className="px-6 py-8 space-y-6 text-center">
              <a href="#how" className="block text-lg">How it Works</a>
              <a href="/dashboard" className="block text-lg">Dashboard</a>
              <a href="/login" className="block px-6 py-3 rounded-full border border-purple-500">Login</a>
              <a href="/register" className="block px-6 py-3 rounded-full bg-purple-600 text-white">Register</a>
            </div>
          </div>
            )}
          </>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Learn from YouTube<br />
            <span className="text-purple-500">Without Distractions</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Turn any YouTube playlist into a focused, trackable course. No ads, no recommendations, no endless scrolling - just pure learning.
          </p>
          {session?.data?.user ? (
            <button
              onClick={() => redirect("/dashboard")}
              className="px-8 py-4 text-lg font-medium rounded-full bg-purple-600 hover:bg-purple-700 text-white transition transform hover:scale-105"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register" // or open create modal
              className="px-8 py-4 text-lg font-medium rounded-full bg-purple-600 hover:bg-purple-700 text-white transition transform hover:scale-105"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="px-8 py-4 text-lg font-medium rounded-full border border-gray-600 hover:border-purple-500 hover:text-purple-500 transition"
            >
              Already have an account? Login
            </a>
          </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-gray-100 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How Qurato Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 bg-white border border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800/40 dark:border-gray-700  dark:shadow-none dark:hover:bg-gray-800/60"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold  bg-purple-600 text-white shadow-md dark:shadow-none">
                  {step.number}
                </div>
                <div className="text-5xl mb-6 mt-6">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© 2026 Qurato. Focused learning for the modern student.</p>
        </div>
      </footer>
    </>
  );
}
