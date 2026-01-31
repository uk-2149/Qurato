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

const stripTime = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { calendarData, months } = useMemo(() => {
    const today = stripTime(new Date());
    
    // Calculate Start Date (365 days ago)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 365);

    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    // Map data
    const dataMap = new Map<string, ActivityDay>();
    data.forEach((item) => {
        const itemDate = stripTime(new Date(item.date));
        dataMap.set(formatDateKey(itemDate), item);
    });

    const days = [];
    const computedMonths = [];
    let current = new Date(startDate);

    // Generate Grid
    while (current <= today) {
      const dateKey = formatDateKey(current);
      const activity = dataMap.get(dateKey);

      days.push({
        date: new Date(current),
        count: activity ? activity.videosWatched : 0,
        met: activity ? activity.isTargetMet : false,
      });

      current.setDate(current.getDate() + 1);
    }

    // Month Labels
    for (let i = 0; i < days.length; i += 7) {
      const weekStart = days[i].date;
      const weekDays = days.slice(i, i + 7);
      const firstDayOfMonth = weekDays.find(d => d.date.getDate() === 1);

      if (firstDayOfMonth) {
        computedMonths.push({
          colIndex: Math.floor(i / 7),
          label: firstDayOfMonth.date.toLocaleString('default', { month: 'short' })
        });
      } else if (i === 0) {
         computedMonths.push({
          colIndex: 0,
          label: weekStart.toLocaleString('default', { month: 'short' })
        });
      }
    }

    return { calendarData: days, months: computedMonths };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-900";
    if (count <= 2) return "bg-emerald-200 dark:bg-emerald-900";
    if (count <= 4) return "bg-emerald-400 dark:bg-emerald-700";
    if (count <= 6) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-emerald-600 dark:bg-emerald-500";
  };

  const SQUARE_SIZE = 12;
  const GAP_SIZE = 4;
  const COL_WIDTH = SQUARE_SIZE + GAP_SIZE;
  const totalCols = Math.ceil(calendarData.length / 7);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-fit pt-8 pb-4 px-2">
        
        {/* Months Row */}
        <div className="flex text-xs text-zinc-400 mb-2 relative h-4">
           <div className="w-8 shrink-0"></div> 
           <div className="relative flex-1">
             {months.map((m, i) => (
                <span 
                    key={`${m.label}-${i}`} 
                    className="absolute text-[10px] font-medium" 
                    style={{ left: `${m.colIndex * COL_WIDTH}px` }}
                >
                    {m.label}
                </span>
             ))}
           </div>
        </div>

        <div className="flex gap-1">
            {/* Days Label Column */}
            <div className="grid grid-rows-7 gap-1 text-[10px] text-zinc-400 font-medium pr-2 h-fit">
                <span className="h-3"></span> {/* Sun */}
                <span className="h-3 leading-[12px]">Mon</span>
                <span className="h-3"></span> {/* Tue */}
                <span className="h-3 leading-[12px]">Wed</span>
                <span className="h-3"></span> {/* Thu */}
                <span className="h-3 leading-[12px]">Fri</span>
                <span className="h-3"></span> {/* Sat */}
            </div>

            {/* The Heatmap Grid */}
            <div 
              className="grid grid-rows-7 grid-flow-col gap-1"
              role="grid"
            >
            {calendarData.map((day, index) => {
                const colIndex = Math.floor(index / 7);
                const isLeftEdge = colIndex < 3; 
                const isRightEdge = colIndex > totalCols - 4;

                let tooltipPos = "left-1/2 -translate-x-1/2"; 
                let arrowPos = "left-1/2 -translate-x-1/2";   

                if (isLeftEdge) {
                    tooltipPos = "left-0 -ml-2"; 
                    arrowPos = "left-2.5"; 
                } else if (isRightEdge) {
                    tooltipPos = "right-0 -mr-2";
                    arrowPos = "right-2.5";
                }

                return (
                    <div
                        key={day.date.toISOString()}
                        className={`w-3 h-3 rounded-[2px] ${getColor(day.count)} relative group`}
                        role="gridcell"
                        aria-label={`${day.count} videos on ${day.date.toDateString()}`}
                    >
                        <div className={`absolute bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none w-max ${tooltipPos}`}>
                            <div className="bg-zinc-900 text-white text-xs rounded-md py-1.5 px-3 shadow-xl border border-zinc-700/50">
                                <span className="font-semibold text-emerald-400">{day.count} videos</span> 
                                <span className="text-zinc-400 ml-1">on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className={`w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700/50 rotate-45 absolute -bottom-1 ${arrowPos}`}></div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-500 pr-4">
          <span>Less</span>
          <div className="flex gap-1">
            <div className={`w-3 h-3 rounded-[2px] ${getColor(0)}`}></div>
            <div className={`w-3 h-3 rounded-[2px] ${getColor(2)}`}></div>
            <div className={`w-3 h-3 rounded-[2px] ${getColor(4)}`}></div>
            <div className={`w-3 h-3 rounded-[2px] ${getColor(6)}`}></div>
            <div className={`w-3 h-3 rounded-[2px] ${getColor(8)}`}></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}