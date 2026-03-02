"use client";

import React, { useMemo } from "react";

interface ActivityDay {
  date: string;
  videosWatched: number;
  minutesSpent: number;
  isTargetMet: boolean;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
}

const stripTime = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const formatKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { days, months, totalActiveDays } = useMemo(() => {
    const today = stripTime(new Date());
    const start = new Date(today);
    start.setDate(today.getDate() - 365);

    while (start.getDay() !== 0) {
      start.setDate(start.getDate() - 1);
    }

    const map = new Map<string, ActivityDay>();
    data.forEach((d) => {
      const date = stripTime(new Date(d.date));
      map.set(formatKey(date), d);
    });

    const calendar: {
      date: Date;
      count: number;
      minutes: number;
      met: boolean;
      isToday: boolean;
    }[] = [];

    const cursor = new Date(start);
    while (cursor <= today) {
      const key = formatKey(cursor);
      const entry = map.get(key);

      calendar.push({
        date: new Date(cursor),
        count: entry?.videosWatched ?? 0,
        minutes: entry?.minutesSpent ?? 0,
        met: entry?.isTargetMet ?? false,
        isToday:
          cursor.toDateString() === new Date().toDateString(),
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;

    calendar.forEach((d, i) => {
      const m = d.date.getMonth();
      if (m !== lastMonth && d.date.getDate() <= 7) {
        monthLabels.push({
          col: Math.floor(i / 7),
          label: d.date.toLocaleString("default", { month: "short" }),
        });
        lastMonth = m;
      }
    });

    return {
      days: calendar,
      months: monthLabels,
      totalActiveDays: calendar.filter((d) => d.count > 0).length,
    };
  }, [data]);

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 7) return 3;
    return 4;
  };

  const intensityStyles = [
    "bg-zinc-800/40 border border-zinc-700/30",
    "bg-emerald-900/60",
    "bg-emerald-800/70",
    "bg-emerald-600 shadow-sm shadow-emerald-900/30",
    "bg-emerald-400 shadow-md shadow-emerald-500/40",
  ];

  const SQUARE = 14;
  const GAP = 5;
  const COL_WIDTH = SQUARE + GAP;

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative inline-block w-full py-8 px-4">

        {/* Subtle Background Glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Activity History
            </h3>
            <p className="text-sm text-zinc-500">
              {totalActiveDays} active days this year
            </p>
          </div>
        </div>

        {/* Month Labels */}
        <div className="relative h-6 mb-2">
          {months.map((m) => (
            <div
              key={m.label + m.col}
              className="absolute text-[11px] font-medium text-zinc-400"
              style={{ left: `${m.col * COL_WIDTH}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          {/* Weekday labels */}
          <div className="grid grid-rows-7 gap-[5px] text-[11px] text-zinc-500 font-medium pr-2">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="h-[14px] flex items-center justify-end">
                {d}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-flow-col grid-rows-7 gap-[5px]">
            {days.map((day, idx) => {
              const intensity = getIntensity(day.count);

              return (
                <div
                  key={idx}
                  className={`
                    group relative rounded-md w-[14px] h-[14px]
                    transition-all duration-200 ease-out
                    hover:scale-125 hover:z-20
                    hover:ring-2 hover:ring-emerald-400/30
                    ${intensityStyles[intensity]}
                    ${day.isToday ? "ring-2 ring-blue-500/40" : ""}
                  `}
                  tabIndex={0}
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 z-50">
                    <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/5 rounded-xl px-4 py-3 text-xs shadow-2xl shadow-black/60 w-max">
                      <div className="text-emerald-400 font-semibold text-sm">
                        {day.count} videos
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-1">
                        {day.minutes} min · {day.met ? "Goal achieved" : "Goal missed"}
                      </div>
                      <div className="text-zinc-500 text-[10px] mt-1">
                        {day.date.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center gap-2 text-xs text-zinc-400">
          <span className="opacity-60">Less</span>
          <div className="flex items-center gap-2">
            {intensityStyles.map((cls, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-md ${cls}`}
              />
            ))}
          </div>
          <span className="opacity-60">More</span>
        </div>
      </div>
    </div>
  );
}