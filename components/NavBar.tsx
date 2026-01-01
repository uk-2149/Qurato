"use client";

import React, { useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NavBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const navItems = [
    { label: 'Create +', href: '#create', highlight: true },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-6xl">
      <div className="backdrop-blur-xl bg-black/80 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            Qurato
          </motion.h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    item.highlight
                      ? 'text-white bg-white/10 dark:bg-white/20'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {item.highlight && (
                    <motion.div
                      layoutId="highlight"
                      className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <ModeToggle />
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-white/10"
            >
              <div className="px-6 py-6 space-y-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                      item.highlight
                        ? 'text-white bg-linear-to-r from-purple-500/20 to-pink-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default NavBar;