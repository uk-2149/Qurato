"use client";

import React, { useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateCourseModal from "./CreateCourse";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Course } from "@/types";

interface NavBarProps {
  otherPage: boolean;
  handleCreateCourse?: (newCourse: Course) => void;
}

function NavBar({ otherPage, handleCreateCourse }: NavBarProps) {
  //   const [isOpen, setIsOpen] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${
          otherPage
            ? "w-[98vw] max-w-8xl flex items-center justify-center gap-2"
            : "w-[95vw] max-w-6xl"
        }`}
      >
        {/* back button */}
        <Link href="/dashboard">
        <div
          className={`backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden hover:cursor-pointer transition-all ${
            otherPage ? "" : "hidden"
          } px-8 py-6`}
        >
          <button
            className="flex items-center gap-2 text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-200 transition hover:cursor-pointer"
          >
            ←
          </button>
        </div>
        </Link>
        <div
          className={`backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all ${
            otherPage ? "w-[90vw] max-w-7xl" : ""
          }`}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
            >
              Qurato
            </motion.h1>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-8">
              <div className="md:flex items-center gap-6 hidden">
                <motion.button
                  onClick={() => setOpen(true)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative px-4 py-2 rounded-lg font-medium transition-all duration-300 text-zinc-900 dark:text-white bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-900 hover:cursor-pointer"
                >
                  Create +
                  <motion.div
                    layoutId="highlight"
                    className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </motion.button>
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
            {/* <div className="flex items-center gap-4 md:hidden">
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div> */}
          </div>

          {/* Mobile Menu */}
          {/* <AnimatePresence>
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
        </AnimatePresence> */}
        </div>
      </nav>
      <CreateCourseModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={() => window.location.reload()}
      />
    </>
  );
}

export default NavBar;
