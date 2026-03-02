"use client";

import NavBar from "@/components/NavBar";
import AllCourses from "@/components/AllCourses";
import DailyTargetPrompt from "@/components/DailyTargetPrompt";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DashboardProps {
  name: string;
}

type GoalType = "VIDEOS" | "MINUTES";
type ViewState = "EMPTY" | "ACTIVE" | "COMPLETED" | "EDIT";

interface GoalData {
  type: GoalType;
  value: number;
}

interface Activity {
  date: string;
  isTargetMet: boolean;
  videosWatched: number;
  isToday?: boolean;
}

export default function Dashboard({ name }: DashboardProps) {

  const [state, setState] = useState<ViewState>("EMPTY");
  const [goal, setGoal] = useState<GoalData | null>(null);

  const [progress, setProgress] = useState(0); // current count
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<GoalType>("VIDEOS");

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await fetch("/api/user/goal-progress");
        const data = await res.json();

        if (!data?.target) {
          setState("EMPTY");
          return;
        }

        setGoal({ type: data.type, value: data.target });
        setProgress(data.completed);

        if (data.isTargetMet) {
          setState("COMPLETED");
        } else {
          setState("ACTIVE");
        }
      } catch {
        setState("EMPTY");
      }
    };

    fetchGoal();
  }, []);

  const saveGoal = async () => {
    const num = Number(value.trim());

    if (!value.trim() || isNaN(num) || num <= 0) {
      toast.error("Enter a valid number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: unit, value: num }),
      });

      if (!res.ok) throw new Error();

      // Re-fetch progress after saving
      const progressRes = await fetch("/api/user/goal-progress");
      const data = await progressRes.json();

      setGoal({ type: data.type, value: data.target });
      setProgress(data.completed);

      if (data.isTargetMet) {
        setState("COMPLETED");
      } else {
        setState("ACTIVE");
      }

      setValue("");

      toast.success("Goal updated!");
    } catch {
      toast.error("Failed to set goal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/user/stats");
      const data = await res.json();
      if (data.weekly) {
        setActivities(data.weekly);
      }
    } catch {
      console.error("Failed to fetch weekly stats");
    }
  };

  fetchStats();
}, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <NavBar otherPage={false} />

      <div className="w-[92vw] max-w-5xl mx-auto py-8 my-20">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
          Hi {name}, ready to learn?
        </h1>

        <div className="flex flex-col-reverse lg:flex-row gap-4 justify-between">
          <div className="lg:w-3/4">
            <AllCourses />
          </div>
          <div className="flex flex-col">
            <DailyTargetPrompt
              state={state}
              goal={goal}
              progress={progress}
              loading={loading}
              value={value}
              unit={unit}
              setValue={setValue}
              setUnit={setUnit}
              saveGoal={saveGoal}
              setState={setState}
            />
            <div className="lg:w-64 xl:w-72 shrink-0">
              <WeeklyCalendar activities={activities} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
