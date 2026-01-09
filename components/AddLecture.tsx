"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Lesson } from "@/types";

interface Props {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
  onCreated?: (newLessons: Lesson[]) => void;
}

export default function AddLecture({
  isOpen,
  onClose,
  onCreated,
  courseId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [videoLinks, setVideoLinks] = useState<string[]>([""]);

  if (!isOpen) return null;

  const resetForm = () => {
    setVideoLinks([""]);
  };

  const updateVideoLink = (index: number, value: string) => {
    const updated = [...videoLinks];
    updated[index] = value;
    setVideoLinks(updated);

    // auto-add new empty field if last is filled
    if (index === videoLinks.length - 1 && value.trim() !== "") {
      setVideoLinks([...updated, ""]);
    }
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
  try {
    setLoading(true);

    const res = await fetch("/api/lecture/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        videoLinks: videoLinks.filter(Boolean),
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to add lectures");
    }

    const data = await res.json();
    
    console.log("API Response:", data); // Debug log
    
    const lessons = data.addedVideos || data.lessons || [];

    if (!Array.isArray(lessons) || lessons.length === 0) {
      throw new Error("No lessons returned from API");
    }

    toast.success(`${lessons.length} lecture(s) added`);
    
    onCreated?.(lessons);
    resetForm();
    onClose();
  } catch (err) {
    console.error("Add lecture error:", err);
    toast.error(err instanceof Error ? err.message : "Failed to add lectures");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[95%] max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Add new Lecture
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Organize your learning into a distraction-free course
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          {/* <div>
            <label className="text-sm text-zinc-500">Course Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Web3 Mastery"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div> */}

          {/* Video Links */}
          <div className="space-y-3">
            <label className="text-sm text-zinc-500">Video Links</label>

            <div className="space-y-2 mt-2">
              {videoLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={link}
                    onChange={(e) => updateVideoLink(index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2 rounded-lg
                       bg-zinc-100 dark:bg-zinc-800
                       border border-zinc-200 dark:border-zinc-700
                       focus:ring-2 focus:ring-indigo-500
                       transition"
                  />

                  {/* Remove button */}
                  {videoLinks.length > 1 && (
                    <button
                      onClick={() => removeVideoLink(index)}
                      className="p-2 rounded-lg
                         text-zinc-400 hover:text-red-500
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
