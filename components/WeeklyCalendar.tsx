"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Activity {
  date: string;
  isTargetMet: boolean;
  videosWatched: number;
  isToday?: boolean;
}

interface WeeklyCalendarProps {
  loading?: boolean;
  activities: Activity[];
}

export default function WeeklyCalendar({ loading, activities }: WeeklyCalendarProps) {

  if (loading) {
    return (
      <div className="my-8">
        <div className="h-28 animate-pulse bg-zinc-800/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="my-8 max-w-full lg:max-w-md xl:max-w-lg mx-auto lg:mx-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            This Week
          </h3>
          {/* {activities.some((a) => a.isToday && a.isTargetMet) && (
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 size={12} /> Goal Met!
            </span>
          )} */}
        </div>
        <Link
          href="/stats"
          className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          See Full History →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-1.5 lg:gap-1.5">
        {activities.map((day, i) => {
          const date = new Date(day.date);
          const isToday =
            day.isToday ?? date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-1"
            >
              <span
                className={`text-[9px] sm:text-[10px] md:text-xs uppercase font-medium tracking-wide
                  ${isToday ? "text-zinc-200 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>

              <div
                className={`relative 
                  w-9 h-9        sm:w-10 sm:h-10 
                  md:w-9 md:h-9 
                  lg:w-8 lg:h-8 
                  xl:w-8 xl:h-8 
                  flex items-center justify-center 
                  rounded-2xl sm:rounded-2xl md:rounded-2xl lg:rounded-3xl 
                  transition-all duration-300 ease-out shadow-sm
                  ${
                    day.isTargetMet
                      ? "bg-emerald-500/15 border border-emerald-500/40 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                      : day.videosWatched > 0
                        ? "bg-amber-500/15 border border-amber-500/40 dark:bg-amber-500/10 dark:border-amber-500/30"
                        : "bg-zinc-800/40 border border-zinc-700/50 dark:bg-zinc-900/40 dark:border-zinc-800/60"
                  }
                  ${isToday 
                    ? "scale-110 ring-2 ring-blue-500/40 ring-offset-2 ring-offset-zinc-950 shadow-md" 
                    : "hover:scale-105 active:scale-95"}`}
              >
                {day.isTargetMet ? (
                  <CheckCircle2
                    className="text-emerald-400 dark:text-emerald-300"
                    size={18}
                    strokeWidth={2.5}
                  />
                ) : day.videosWatched > 0 ? (
                  <Clock
                    className="text-amber-400 dark:text-amber-300"
                    size={18}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Circle
                    className="text-zinc-600 dark:text-zinc-500"
                    size={18}
                    strokeWidth={2}
                  />
                )}

                {isToday && !day.isTargetMet && day.videosWatched === 0 && (
                  <div className="absolute inset-1 rounded-2xl border border-blue-400/30 pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}