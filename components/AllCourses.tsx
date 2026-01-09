"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import EditCourse from "./EditCourse";
import ShareCourseModal from "./ShareCourse";

type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  totalVideos: number;
  completedLessons: number;
  percentage: number;
  type: "created" | "saved";
  shareId: string;
  source: "youtube" | "custom";
  playlistId?: string;
  authorId: string;
};

type FilterType = "all" | "created" | "saved";

export default function AllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(
    undefined
  );
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/course/getAllCourse");
        const data = await res.json();
        console.log("API RESPONSE:", data);
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleUpdateCourse = (updated: Course) => {
  setCourses((prev) =>
    prev.map((c) =>
      c.id === updated.id
        ? { 
            ...c,          // keep old values (like percentage)
            ...updated,    // override only updated fields
          }
        : c
    )
  );
};


  // const handleCreateCourse = (newCourse: Course) => {
  //   setCourses((prev) => [newCourse, ...prev]);
  // }

  // Context API

  const handleDeleteCourse = async (courseId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone."
    );

    if (!confirmed) return;

    const prevCourses = courses;
    setCourses((c) => c.filter((course) => course.id !== courseId));

    try {
      const res = await fetch(`/api/course/deleteCourse?courseId=${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("The course has been removed successfully.");
    } catch (error) {
      setCourses(prevCourses);

      toast.error("Something went wrong while deleting the course.");
    }
  };

  const filteredCourses = useMemo(() => {
    if (filter === "all") return courses;
    return courses.filter((c) => c.type === filter);
  }, [courses, filter]);

  return (
    <>
      <div className="mt-8 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Your Courses
          </h2>

          {/* FILTERS */}
          <div className="flex gap-2 justify-evenly bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <FilterButton
              label="All"
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label="Created"
              active={filter === "created"}
              onClick={() => setFilter("created")}
            />
            <FilterButton
              label="Saved"
              active={filter === "saved"}
              onClick={() => setFilter("saved")}
            />
          </div>
        </div>

        {/* COURSES */}
        {loading ? (
          <CourseSkeleton />
        ) : filteredCourses.length === 0 ? (
          <EmptyState text="No courses found, Create a course" />
        ) : (
          <CourseGrid
            courses={filteredCourses}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onDelete={handleDeleteCourse}
            setOpen={setOpen}
            setSelectedCourse={setSelectedCourse}
            setShareOpen={setShareOpen}
          />
        )}
      </div>
      <EditCourse
        course={selectedCourse as Course}
        isOpen={open}
        onClose={() => setOpen(false)}
        onUpdated={(updatedCourse) => {
          handleUpdateCourse(updatedCourse);
          setOpen(false);
        }}
      />
      <ShareCourseModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareId={selectedCourse?.shareId || ""}
      />
    </>
  );
}

function CourseSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-pulse"
        >
          <div className="h-40 bg-zinc-200 dark:bg-zinc-800" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm transition ${
        active
          ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow"
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function CourseGrid({
  courses,
  openMenuId,
  setOpenMenuId,
  onDelete,
  setOpen,
  setSelectedCourse,
  setShareOpen,
}: {
  courses: Course[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (courseId: string) => void;
  setOpen: (open: boolean) => void;
  setSelectedCourse: (course: Course | undefined) => void;
  setShareOpen: (open: boolean) => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/course/${course.shareId}`}
          className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 hover:shadow-lg transition"
        >
          <div className="relative h-45 bg-zinc-100 dark:bg-zinc-800 overflow-hidden rounded-t-xl">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400">
                No Thumbnail
              </div>
            )}
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-white line-clamp-2">
                {course.title}
              </h3>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenMenuId(openMenuId === course.id ? null : course.id);
                  }}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="block w-1 h-1 bg-zinc-500 rounded-full mb-0.5" />
                  <span className="block w-1 h-1 bg-zinc-500 rounded-full mb-0.5" />
                  <span className="block w-1 h-1 bg-zinc-500 rounded-full" />
                </button>

                {openMenuId === course.id && (
                  <div
                    className="absolute right-0 mt-2 w-32 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg z-20"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenMenuId(null);
                        setSelectedCourse(course);
                        setOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(null);
                        onDelete(course.id);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setShareOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Share
                    </button>
                  </div>
                )}
              </div>
            </div>

            {course.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {course.description}
              </p>
            )}

            <div className="flex justify-between items-center text-sm text-zinc-500 pt-2">
  <span>
    {course.totalVideos} lessons
    <span className="ml-2 px-2 py-0.5 text-xs rounded-md 
      bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
      {course.percentage}% completed
    </span>
  </span>

  <span className="text-indigo-500 group-hover:underline">
    Open →
  </span>
</div>

          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center text-zinc-500">
      {text}
    </div>
  );
}
