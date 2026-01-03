"use client";

import { useEffect, useState } from "react";
import {
  MoreVertical,
  Plus,
  Maximize,
  Minimize,
  Share2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import NavBar from "./NavBar";
import Image from "next/image";

type Lesson = {
  id: string;
  title: string;
  embedUrl: string;
  thumbnail?: string;
  description?: string;
  order: number;
};

type Course = {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  author: { name: string };
};

interface CourseLecturePageProps {
  shareId: string;
}

export default function CourseLecturePage({ shareId }: CourseLecturePageProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [openLessonMenu, setOpenLessonMenu] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [cinema, setCinema] = useState(false);
  const [startAt, setStartAt] = useState(0);

  useEffect(() => {
    if (!shareId) return;

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/course/getCourse?sId=${shareId}`);
        const data = await res.json();

        setCourse(data);
        setCurrentLesson(data.lessons?.[0] || null);
      } catch {
        toast("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [shareId]);

  function timestampToSeconds(ts: string) {
    const parts = ts.split(":").map(Number);

    if (parts.length === 3) {
      const [h, m, s] = parts;
      return h * 3600 + m * 60 + s;
    }

    if (parts.length === 2) {
      const [m, s] = parts;
      return m * 60 + s;
    }

    return 0;
  }

  function parseDescription(text: string, onSeek: (seconds: number) => void) {
    const regex = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)|(https?:\/\/[^\s]+)/g;

    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // TIMESTAMP
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(part)) {
        return (
          <button
            key={i}
            onClick={() => onSeek(timestampToSeconds(part))}
            className="text-indigo-500 hover:underline font-medium"
          >
            {part}
          </button>
        );
      }

      // LINK
      if (part.startsWith("http")) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:underline break-all transition-colors duration-150"
          >
            {part}
          </a>
        );
      }

      // NORMAL TEXT
      return <span key={i}>{part}</span>;
    });
  }

  if (loading) return <LectureSkeleton />;

  if (!course) return <div className="p-8 text-white">Course not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar otherPage={true} />

      {/* GREETING */}
      <div className="px-6 py-8 max-w-7xl mx-auto mt-25 flex items-center justify-between">
        <p className="text-2xl font-semibold">{course.title}</p>
        <div className="flex items-center gap-2">
          <IconButton
            label="Share"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/course/${shareId}`
              );
              toast("Course link copied");
            }}
          >
            <Share2 size={22} />
          </IconButton>

          <IconButton label="Edit" onClick={() => toast("Edit course")}>
            <Pencil size={22} />
          </IconButton>

          <IconButton
            label="Delete"
            danger
            onClick={() => toast("Delete course")}
          >
            <Trash2 size={22} />
          </IconButton>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`max-w-7xl mx-auto px-6 pb-12 ${
          cinema ? "space-y-8" : "grid lg:grid-cols-3 gap-8"
        } overflow-x-scroll`}
      >
        {/* VIDEO SECTION */}
        <div
          className={`space-y-6 ${cinema ? "lg:col-span-3" : "lg:col-span-2"}`}
        >
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl">
            {currentLesson ? (
              <iframe
                key={startAt}
                src={`${currentLesson.embedUrl}?start=${startAt}&autoplay=1`}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                No lecture selected
              </div>
            )}

            {/* Cinema Mode Button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setCinema(!cinema)}
                className="bg-black/70 hover:bg-black/90 p-3 rounded-xl backdrop-blur-sm transition"
              >
                {cinema ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>

          {/* Current Lesson Info */}
          {currentLesson && (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-xl font-semibold">{currentLesson.title}</h3>

              <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {parseDescription(currentLesson.description || "", setStartAt)}
              </p>
            </div>
          )}
        </div>

        {/* LECTURES SIDEBAR - Card Style like Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">
              Lectures ({course.lessons.length})
            </h3>
            <button className="hover:bg-zinc-800 p-2 rounded-lg transition">
              <Plus size={20} />
            </button>
          </div>

          {course.lessons.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No lectures yet. Click + to add one.
            </div>
          ) : (
            <div className="grid gap-1">
              {course.lessons.map((lesson) => {
                const isActive = lesson.id === currentLesson?.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`flex gap-4 p-3 rounded-xl cursor-pointer transition ${
                      isActive
                        ? "bg-purple-500/10"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {/* THUMBNAIL */}
                    <div className="relative w-30 h-22 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold">
                        <Image
                          src={lesson.thumbnail || ""}
                          alt={`${lesson.order + 1}`}
                          fill
                        />
                      </div>
                    </div>

                    {/* META */}
                    <div className="flex-1 min-w-0 w-5">
                      <p
                        className={`font-medium text-sm truncate ${
                          isActive ? "text-purple-400" : ""
                        }`}
                      >
                        {lesson.title}
                      </p>
                    </div>

                    {/* MENU */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenLessonMenu(
                            openLessonMenu === lesson.id ? null : lesson.id
                          );
                        }}
                        className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openLessonMenu === lesson.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50">
                          <MenuItem
                            label="Edit"
                            onClick={() => toast("Edit lecture")}
                          />
                          <MenuItem
                            label="Delete"
                            danger
                            onClick={() => toast("Delete lecture")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LectureSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-zinc-950/80 border-b border-zinc-800 px-6 py-4 animate-pulse">
        <div className="h-8 w-32 bg-zinc-800 rounded-full" />
      </div>
      <div className="px-6 py-8 space-y-8">
        <div className="h-6 w-64 bg-zinc-800 rounded" />
        <div className="aspect-video bg-zinc-900 rounded-2xl" />
      </div>
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 text-sm transition ${
        danger ? "text-red-400 hover:bg-red-900/30" : "hover:bg-zinc-800"
      }`}
    >
      {label}
    </button>
  );
}

function IconButton({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`p-2 rounded-lg transition flex items-center justify-center ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
