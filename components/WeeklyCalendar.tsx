"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Activity {
  date: string;
  isTargetMet: boolean;
  videosWatched: number;
}

export default function WeeklyCalendar() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // We just hit stats, the backend prepares the 'weekly' array for us
        const res = await fetch("/api/user/stats");
        const data = await res.json();
        if (data.weekly) {
          setActivities(data.weekly);
        }
      } catch (error) {
        console.error("Failed to fetch weekly stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-24 animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-lg my-8"></div>;

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Weekly Consistency</h3>
          {activities.length > 0 && new Date(activities[activities.length - 1].date).toDateString() === new Date().toDateString() && activities[activities.length - 1].isTargetMet && (
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> GOAL MET
            </span>
          )}
        </div>
        <Link href="/stats" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          See Full History →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {activities.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase text-zinc-400">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>

            <div className={`w-full aspect-square rounded-lg flex items-center justify-center border-2 transition-all duration-300
              ${day.isTargetMet
                ? "bg-emerald-100 border-emerald-500 dark:bg-emerald-500/20 dark:border-emerald-500"
                : day.videosWatched > 0
                  ? "bg-amber-100 border-amber-500 dark:bg-amber-500/20 dark:border-amber-500"
                  : "bg-zinc-50 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"}`}>

              {day.isTargetMet ? (
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
              ) : day.videosWatched > 0 ? (
                <Clock className="text-amber-600 dark:text-amber-400" size={18} />
              ) : (
                <Circle className="text-zinc-300 dark:text-zinc-700" size={18} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}