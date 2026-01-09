"use client";

import { useMemo, useState } from "react";
import { X, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
}

export default function ShareCourseModal({
  isOpen,
  onClose,
  shareId,
}: ShareCourseModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const base =
      process.env.NEXTAUTH_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/course/${shareId}`;
  }, [shareId]);

  const handleCopy = async () => {
    if (copied) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center
                   bg-black/50 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg rounded-2xl
                     bg-white dark:bg-zinc-900
                     border border-zinc-200 dark:border-zinc-800
                     shadow-2xl p-6"
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-lg
                       text-zinc-400 hover:text-zinc-700
                       dark:hover:text-white
                       hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Share Course
          </h2>

          {/* Input + Copy */}
          <div
            className="flex items-center gap-2 rounded-xl
                       bg-zinc-100 dark:bg-zinc-800
                       border border-zinc-200 dark:border-zinc-700
                       px-4 py-3"
          >
            <input
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-sm
                         text-zinc-700 dark:text-zinc-200
                         outline-none truncate"
            />

            <button
              onClick={handleCopy}
              disabled={copied}
              className={`flex items-center gap-2 px-4 py-2
                          rounded-lg text-sm font-medium transition
                          ${
                            copied
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                              : "bg-indigo-600 text-white hover:bg-indigo-700"
                          }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Hint */}
          <p className="mt-3 text-xs text-zinc-500">
            Anyone with this link can view the course.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
