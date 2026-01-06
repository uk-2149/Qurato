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
import { redirect } from "next/navigation";
import EditCourseModal from "./EditCourse";
import { Course, Lesson } from "@/types";
import ShareCourseModal from "./ShareCourse";
import AddLecture from "./AddLecture";

interface CourseLecturePageProps {
  shareId: string;
}

type CourseWithLessons = Course & {
  lessons: Lesson[];
};

export default function CourseLecturePage({ shareId }: CourseLecturePageProps) {
  const [course, setCourse] = useState<CourseWithLessons | null>(null);
  const [openLessonMenu, setOpenLessonMenu] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [cinema, setCinema] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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

  function toBaseCourse(course: CourseWithLessons): Course {
    const { lessons, ...baseCourse } = course;
    return baseCourse;
  }

  const handleDeleteCourse = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );

    if (!confirmed) return;

    const courseId = course?.id;

    try {
      const res = await fetch(`/api/course/deleteCourse?courseId=${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("The course has been removed successfully.");
      setTimeout(() => {
        redirect("/dashboard");
      }, 1000);
    } catch (error) {
      console.log("Error occured while deleting:", error);
      toast.error("Something went wrong while deleting the course.");
    }
  };

    const handleDeleteLesson = async (courseId: string, lessonId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/lecture/delete?lessonId=${lessonId}&courseId=${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      const data = await res.json();
      setCourse((prev) =>
  prev
    ? {
        ...prev,
        lessons: prev.lessons.filter(
          (lesson) => lesson.id !== lessonId
        ),
        totalVideos: Math.max(
          (prev.totalVideos ?? prev.lessons.length) - 1,
          0
        ),
      }
    : prev
);
      toast.success("The course has been removed successfully.");
    } catch (error) {
      console.error("Error occured while deleting:", error);
      toast.error("Something went wrong while deleting the course.");
    }
  };

  const handleLecturesAdded = (newLessons: Lesson[]) => {
  setCourse((prev) =>
    prev
      ? {
          ...prev,
          lessons: [...prev.lessons, ...newLessons],
        }
      : prev
  );

  if (!currentLesson && newLessons.length) {
    setCurrentLesson(newLessons[0]);
  }
};


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
            className="text-indigo-500 hover:underline font-medium hover:cursor-pointer"
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
            className="text-indigo-500 hover:underline break-all transition-colors duration-150 hover:cursor-pointer"
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
    <>
      <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white">
        <NavBar otherPage={true} />

        {/* GREETING */}
        <div className="px-6 py-8 max-w-7xl mx-auto mt-25 flex items-center justify-between">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white">
            {course.title}
          </p>

          <div className="flex items-center gap-2">
            <IconButton
              label="Share"
              onClick={() => setShareOpen(true)}
            >
              <Share2 size={22} />
            </IconButton>

            <IconButton label="Edit" onClick={() => setOpen(true)}>
              <Pencil size={22} />
            </IconButton>

            <IconButton label="Delete" danger onClick={handleDeleteCourse}>
              <Trash2 size={22} />
            </IconButton>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div
          className={`max-w-7xl mx-auto px-6 pb-12 ${
            cinema ? "space-y-8" : "grid lg:grid-cols-3 gap-8"
          }`}
        >
          {/* VIDEO SECTION */}
          <div
            className={`space-y-6 ${
              cinema ? "lg:col-span-3" : "lg:col-span-2"
            }`}
          >
            <div className="group relative bg-zinc-100 dark:bg-black rounded-xl overflow-hidden aspect-video shadow-xl">
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
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setCinema(!cinema)}
                  className="bg-white/80 dark:bg-black/70 
           hover:bg-white dark:hover:bg-black/90
           border border-zinc-200 dark:border-zinc-800
           p-3 rounded-xl backdrop-blur-sm transition"
                >
                  {cinema ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>

            {/* Current Lesson Info */}
            {currentLesson && (
              <div
                className="bg-zinc-100 dark:bg-zinc-900/50
                border border-zinc-200 dark:border-zinc-800
                rounded-xl p-6 space-y-3"
              >
                <h3 className="text-xl font-semibold">{currentLesson.title}</h3>

                <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {parseDescription(
                    currentLesson.description || "",
                    setStartAt
                  )}
                </p>
              </div>
            )}
          </div>

          {/* LECTURES SIDEBAR - Card Style like Dashboard */}
          <div
            className="space-y-4 
                bg-zinc-50 dark:bg-transparent
                rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">
                Lectures ({course.lessons.length})
              </h3>
              <button className="group hover:bg-zinc-800 p-2 rounded-lg transition hover:text-white"
              onClick={() => setAddOpen(true)}
              >
                <Plus size={20} />
              </button>
            </div>

            {course.lessons?.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                No lectures yet. Click + to add one.
              </div>
            ) : (
              <div className="grid gap-1">
                {course.lessons?.map((lesson) => {
                  const isActive = lesson.id === currentLesson?.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`flex gap-4 p-3 rounded-lg cursor-pointer transition ${
                        isActive
                          ? "bg-purple-500/10 dark:bg-purple-500/20 border-l-4 border-purple-500"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {/* THUMBNAIL */}
                      <div className="relative w-30 h-22 aspect-video rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800">
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
                            isActive
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-zinc-800 dark:text-zinc-200"
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
                            {/* <MenuItem
                              label="Edit"
                              onClick={() => toast("Edit lecture")}
                            /> */}
                            <MenuItem
                              label="Delete"
                              danger
                              onClick={() => handleDeleteLesson(course.id, lesson.id)}
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
      <EditCourseModal
        course={course ? toBaseCourse(course) : undefined}
        isOpen={open}
        onClose={() => setOpen(false)}
        onUpdated={(updatedCourse) => {
          setCourse((prev) =>
            prev
              ? {
                  ...prev,
                  ...updatedCourse, // updates title, description, etc
                }
              : prev
          );
          setOpen(false);
        }}
      />
      <ShareCourseModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareId={shareId}
      />
      <AddLecture
  isOpen={addOpen}
  onClose={() => setAddOpen(false)}
  courseId={course.id}
  onCreated={handleLecturesAdded}
/>
    </>
  );
}

function LectureSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Floating Navbar Skeleton */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-6xl">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />

          {/* Navbar */}
          <div
            className="flex-1 h-14 rounded-2xl bg-white/80 dark:bg-zinc-900/80 
                          border border-zinc-200 dark:border-zinc-800
                          shadow-lg animate-pulse"
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="pt-28 px-6 max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* LEFT: Video + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course title */}
          <div className="h-7 w-72 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

          {/* Video player */}
          <div className="aspect-video rounded-2xl bg-zinc-200 dark:bg-zinc-900 animate-pulse" />

          {/* Description card */}
          <div
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800
                          bg-white dark:bg-zinc-900 p-6 space-y-4 animate-pulse"
          >
            <div className="h-5 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>

        {/* RIGHT: Lecture List */}
        <aside className="space-y-4">
          {/* Lectures header */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>

          {/* Lecture items */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-3 rounded-xl
                           bg-white dark:bg-zinc-900
                           border border-zinc-200 dark:border-zinc-800
                           animate-pulse"
              >
                {/* Thumbnail */}
                <div className="w-28 aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-800" />

                {/* Title */}
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-3/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>

                {/* Menu dots */}
                <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        </aside>
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

export function IconButton({
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
          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
