"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Course } from "@/types";

interface Props {
  course?: Course;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updatedCourse: Course) => void;
}

export default function EditCourseModal({
  course,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);

  const playListLink =
    `https://www.youtube.com/playlist?list=${course?.playlistId}` || "";
  const source = course?.source || "custom";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (course && isOpen) {
      setTitle(course.title);
      setDescription(course.description ?? "");
    }
  }, [course, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!title?.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    if (source === "youtube" && !playListLink.trim()) {
      toast.error("Please enter a YouTube playlist ID.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/course/updateCourse", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course?.id,
          title,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success("Course updated successfully!");

      resetForm();
      onUpdated?.(data.course);
      onClose();
    } catch (error: unknown) {
      toast.error("Unexpected error occurred");
      console.error("Update course error:", error);
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
            Create New Course
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Organize your learning into a distraction-free course
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm text-zinc-500">Course Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Web3 Mastery"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this course about?"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            />
          </div>

          {/* Source */}
          <div>
            <label className="text-sm text-zinc-500">Course Type</label>
            <div className="flex gap-2 mt-2">
              {[source].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-lg text-sm border transition ${
                    source === type
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {type === "youtube" ? "YouTube Playlist" : "Custom Course"}
                </button>
              ))}
            </div>
          </div>

          {/* Playlist */}
          {source === "youtube" && (
            <div>
              <label className="text-sm text-zinc-500">
                YouTube Playlist ID
              </label>
              <input
                value={playListLink}
                readOnly
                placeholder="PLxxxxxx"
                className="w-full mt-1 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
              />
            </div>
          )}
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
            Update Course
          </button>
        </div>
      </div>
    </div>
  );
}
