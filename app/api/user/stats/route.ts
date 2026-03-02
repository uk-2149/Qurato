import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getTodayDate, isSameDay } from "@/lib/dateUtils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const userId = session.user.id;

    const activities = await prisma.dailyActivity.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    let currentStreak = 0;
    let longestStreak = 0;
    const today = getTodayDate();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const metDays = activities
      .filter((a) => a.isTargetMet)
      .map((a) => new Date(a.date).getTime())
      .sort((a, b) => b - a);

    if (metDays.length > 0) {
      const lastMetDate = new Date(metDays[0]);
      const isStreakAlive =
        isSameDay(lastMetDate, today) || isSameDay(lastMetDate, yesterday);

      if (isStreakAlive) {
        currentStreak = 1;
        for (let i = 0; i < metDays.length - 1; i++) {
          const curr = new Date(metDays[i]);
          const prev = new Date(metDays[i + 1]);

          const diffTime = Math.abs(curr.getTime() - prev.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    let tempStreak = 0;
    for (let i = 0; i < metDays.length - 1; i++) {
      const curr = new Date(metDays[i]);
      const prev = new Date(metDays[i + 1]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (tempStreak === 0) tempStreak = 1;

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    const totals = activities.reduce(
      (acc, act) => ({
        videos: acc.videos + act.videosWatched,
        minutes: acc.minutes + act.minutesSpent,
      }),
      { videos: 0, minutes: 0 },
    );

    const weeklyData = [];

    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // go back to Sunday

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);

      const activity = activities.find((a) => isSameDay(new Date(a.date), d));

      weeklyData.push({
        date: d.toISOString(),
        isTargetMet: activity ? activity.isTargetMet : false,
        videosWatched: activity ? activity.videosWatched : 0,
        minutesSpent: activity ? activity.minutesSpent : 0,
        // optional: add this for easier frontend highlighting
        isToday: isSameDay(d, today),
      });
    }

    return NextResponse.json({
      streaks: { current: currentStreak, longest: longestStreak },
      lifetime: totals,
      history: activities,
      weekly: weeklyData, // now Sun → Sat
      periodStats: {
        week: {
          videos: activities
            .filter((a) => {
              const d = new Date(a.date);
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(
                now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
              );
              startOfWeek.setHours(0, 0, 0, 0);
              return d >= startOfWeek;
            })
            .reduce((acc, curr) => acc + curr.videosWatched, 0),
          minutes: activities
            .filter((a) => {
              const d = new Date(a.date);
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(
                now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
              );
              startOfWeek.setHours(0, 0, 0, 0);
              return d >= startOfWeek;
            })
            .reduce((acc, curr) => acc + curr.minutesSpent, 0),
        },
        month: {
          videos: activities
            .filter((a) => {
              const d = new Date(a.date);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            })
            .reduce((acc, curr) => acc + curr.videosWatched, 0),
          minutes: activities
            .filter((a) => {
              const d = new Date(a.date);
              const now = new Date();
              return (
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
              );
            })
            .reduce((acc, curr) => acc + curr.minutesSpent, 0),
        },
      },
      insights: {
        mostActiveDay: (() => {
          if (activities.length === 0) return "N/A";

          const bestDay = activities.reduce(
            (prev, current) =>
              prev.videosWatched > current.videosWatched ? prev : current,
            activities[0],
          );

          if (bestDay.videosWatched === 0) return "N/A";

          return new Date(bestDay.date).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "short",
          });
        })(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
