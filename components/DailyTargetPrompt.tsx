"use client";

import { Target, X, Pencil, Flame, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type GoalType = "VIDEOS" | "MINUTES";
type ViewState = "EMPTY" | "ACTIVE" | "COMPLETED" | "EDIT";

interface GoalData {
  type: GoalType;
  value: number;
}

interface DailyTargetPromptProps {
  state: ViewState;
  goal: GoalData | null;
  progress: number;
  value: string;
  unit: GoalType;
  setState: (state: ViewState) => void;
  setUnit: (unit: GoalType) => void;
  setValue: (value: string) => void;
  saveGoal: () => Promise<void>;
  loading: boolean;
}

export default function DailyTargetPrompt({
  state,
  goal,
  progress,
  setState,
  setUnit,
  setValue,
  saveGoal,
  loading,
  value,  
  unit,
}: DailyTargetPromptProps) {

  const percent =
    goal?.value ? Math.min(100, Math.round((progress / goal.value) * 100)) : 0;

  return (
    <div
      className={cn(
        "rounded-2xl p-6 mb-8 transition-all duration-300 border shadow-sm",
        state === "COMPLETED"
          ? "bg-emerald-950/30 border-emerald-800/40"
          : "bg-zinc-900 border-zinc-800"
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              state === "COMPLETED"
                ? "bg-emerald-900/40"
                : "bg-blue-950/40"
            )}
          >
            {state === "COMPLETED" ? (
              <CheckCircle2 className="text-emerald-400" size={18} />
            ) : (
              <Target className="text-blue-400" size={20} />
            )}
          </div>

          <h2 className="text-lg font-semibold text-white">
            {state === "EMPTY" && "Set Today's Goal"}
            {state === "ACTIVE" && "Today's Goal"}
            {state === "COMPLETED" && "Goal Completed!"}
            {state === "EDIT" && "Edit Goal"}
          </h2>
        </div>

        {(state === "ACTIVE" || state === "COMPLETED") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setState("EDIT");
              setValue(goal?.value.toString() || "");
              setUnit(goal?.type || "VIDEOS");
            }}
            className="text-zinc-400 hover:text-white"
          >
            <Pencil size={16} />
          </Button>
        )}
      </div>

      {/* EMPTY or EDIT FORM */}
      {(state === "EMPTY" || state === "EDIT") && (
        <div className="space-y-5">
          <Input
            type="number"
            placeholder="e.g. 10"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white h-11"
            disabled={loading}
          />

          <div className="flex bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden h-11">
            {["VIDEOS", "MINUTES"].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u as GoalType)}
                className={cn(
                  "flex-1 text-sm font-medium transition-colors",
                  unit === u
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-750"
                )}
              >
                {u === "VIDEOS" ? "Videos" : "Minutes"}
              </button>
            ))}
          </div>

          <Button
            onClick={saveGoal}
            disabled={loading}
            className="w-full bg-zinc-700 hover:bg-zinc-600 h-12 rounded-xl"
          >
            {loading ? "Saving..." : "Save Goal"}
          </Button>
        </div>
      )}

      {/* ACTIVE STATE */}
      {state === "ACTIVE" && goal && (
        <div className="space-y-4">
          <p className="text-zinc-400">
            Complete{" "}
            <span className="font-semibold text-white">
              {goal.value}{" "}
              {goal.type === "VIDEOS" ? "videos" : "minutes"}
            </span>{" "}
            today
          </p>

          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="text-sm text-zinc-400">
            {progress} / {goal.value}
          </p>
        </div>
      )}

      {/* COMPLETED STATE */}
      {state === "COMPLETED" && goal && (
        <div className="space-y-4">
          <p className="text-emerald-300">
            {progress} / {goal.value}{" "}
            {goal.type === "VIDEOS" ? "videos" : "minutes"} done
          </p>

          <div className="h-2.5 bg-emerald-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-full transition-all duration-700" />
          </div>

          <p className="text-sm text-emerald-400 flex items-center gap-1">
            <Flame size={14} /> Keep the streak alive!
          </p>
        </div>
      )}
    </div>
  );
}