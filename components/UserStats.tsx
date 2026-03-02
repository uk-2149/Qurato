"use client";

import { useEffect, useState } from "react";
import {
  Flame,
  PlayCircle,
  Calendar,
  Target,
  Edit2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import { HistoryEntry, UserStatsData } from "@/types";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl p-8 border bg-zinc-900/60 backdrop-blur-md border-white/5 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export default function UserStats() {
  const [data, setData] = useState<UserStatsData | null>(null);
  const [target, setTarget] = useState<{ type: "VIDEOS" | "MINUTES"; value: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customType, setCustomType] = useState<"VIDEOS" | "MINUTES">("VIDEOS");

  // For highlighting the active goal in the modal presets
  const [currentTarget, setCurrentTarget] = useState<{ type: "VIDEOS" | "MINUTES"; value: number } | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, targetRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/user/target"),
      ]);

      const stats = await statsRes.json();
      const targetData = await targetRes.json();

      console.log(stats);

      setData(stats);
      setTarget(targetData);

      // Also set current target for modal highlighting
      if (targetData?.type && targetData?.value) {
        setCurrentTarget({ type: targetData.type, value: targetData.value });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTarget = async (type: "VIDEOS" | "MINUTES", value: number) => {
    if (value <= 0) {
      toast.error("Invalid goal value");
      return;
    }

    try {
      const res = await fetch("/api/user/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });

      if (res.ok) {
        toast.success("Goal updated");
        setCurrentTarget({ type, value });     // ← update highlight
        setIsEditing(false);
        setCustomValue("");
        fetchData(); // refresh everything
      } else {
        toast.error("Failed to update goal");
      }
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const handleManualSubmit = () => {
    const val = parseInt(customValue.trim(), 10);
    if (isNaN(val) || val < 1) {
      toast.error("Please enter a valid number ≥ 1");
      return;
    }
    handleUpdateTarget(customType, val);
  };

  if (loading) {
    return (
      <>
        <NavBar otherPage={true} />
        <div className="pt-32 text-center animate-pulse text-zinc-400">
          Loading your performance dashboard...
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <NavBar otherPage={true} />
        <div className="pt-32 text-center text-zinc-400">Failed to load history.</div>
      </>
    );
  }

  const goalProgressPercent =
    target && data.today?.completed != null
      ? Math.min(100, Math.round((data.today.completed / target.value) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar otherPage={true} />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-16">
        {/* HEADER */}
        <header>
          <h1 className="text-4xl font-bold">Your Learning Dashboard</h1>
          <p className="text-zinc-500 mt-2">Build consistency. Track momentum. Improve daily.</p>
        </header>

        {/* HERO STREAK SECTION */}
        <section>
          <Card className="relative overflow-hidden">
            <Flame size={120} className="absolute right-10 top-6 opacity-5" />

            <div className="flex items-center justify-between">
              <div>
                <p className="uppercase tracking-wider text-sm text-orange-400 opacity-80">
                  Current Streak
                </p>
                <h2 className="text-6xl font-extrabold mt-3 text-orange-300">
                  {data.streaks?.current ?? 0}
                  <span className="text-2xl ml-2 font-medium">Days</span>
                </h2>
                <p className="mt-4 text-zinc-400 text-sm">
                  Longest streak: {data.streaks?.longest ?? 0} days
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-zinc-500">Momentum matters.</p>
                <p className="text-sm text-zinc-500">Don’t break the chain.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* DAILY GOAL + LIFETIME */}
        <section className="grid md:grid-cols-2 gap-8">
          {/* Daily Goal */}
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <Target size={20} />
                <span className="text-sm uppercase tracking-wider">Daily Goal</span>
              </div>
              <Edit2
                size={16}
                className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                onClick={() => setIsEditing(true)}
              />
            </div>

            {target ? (
              <>
                <h3 className="text-3xl font-bold">
                  {target.value} {target.type === "VIDEOS" ? "Videos" : "Minutes"}
                </h3>

                <div className="h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${goalProgressPercent}%` }}
                  />
                </div>

                <p className="text-sm text-zinc-400 mt-3">
                  {data.today?.completed ?? 0} / {target.value}
                </p>
              </>
            ) : (
              <p className="text-zinc-500">No goal set yet.</p>
            )}
          </Card>

          {/* Lifetime */}
          <Card>
            <div className="flex items-center gap-2 text-blue-400 mb-6">
              <PlayCircle size={20} />
              <span className="text-sm uppercase tracking-wider">Lifetime Learning</span>
            </div>

            <h3 className="text-3xl font-bold">{data.lifetime?.videos ?? 0} Videos</h3>
            <p className="text-sm text-zinc-400 mt-2">
              {Math.round(data.lifetime?.minutes ?? 0)} minutes spent
            </p>
          </Card>
        </section>

        {/* PERFORMANCE OVERVIEW */}
        <section>
          <Card>
            <div className="flex items-center gap-2 mb-8">
              <Calendar size={20} />
              <h2 className="text-lg font-semibold">Performance Overview</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-zinc-500 uppercase">This Week</p>
                <p className="text-2xl font-bold mt-2">
                  {data.periodStats?.week?.videos ?? 0} Videos
                </p>
                <p className="text-sm text-zinc-400">
                  {Math.round(data.periodStats?.week?.minutes ?? 0)} mins
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500 uppercase">This Month</p>
                <p className="text-2xl font-bold mt-2">
                  {data.periodStats?.month?.videos ?? 0} Videos
                </p>
                <p className="text-sm text-zinc-400">
                  {Math.round(data.periodStats?.month?.minutes ?? 0)} mins
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-500 uppercase">Most Active Day</p>
                <p className="text-2xl font-bold mt-2 text-yellow-400">
                  {data.insights?.mostActiveDay || "—"}
                </p>
                <p className="text-sm text-zinc-400">Based on your history</p>
              </div>
            </div>
          </Card>
        </section>

        {/* HEATMAP */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar size={18} /> Activity History
            </h2>
            <span className="text-sm text-zinc-500">
              {data.history?.filter((h: HistoryEntry) => new Date(h.date).getFullYear() === new Date().getFullYear())
                .length ?? 0}{" "}
              active days this year
            </span>
          </div>

          <div>
            <ActivityHeatmap data={(data.history ?? []).map((entry) => ({
              date: entry.date,
              videosWatched: entry.videosWatched ?? 0,
              minutesSpent: entry.minutesSpent ?? 0,
              isTargetMet: entry.isTargetMet ?? false,
            }))} />
          </div>
        </section>
      </div>

      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 transition-opacity duration-300"
          onClick={() => setIsEditing(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
          tabIndex={-1}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md sm:max-w-lg rounded-3xl border border-white/8 bg-zinc-950/95 shadow-2xl backdrop-blur-lg transform scale-100 opacity-100 transition-all duration-300 ease-out"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-white">Set Daily Goal</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Choose a target for videos watched or time spent
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick presets */}
            <div className="px-6 pt-4 pb-6 border-b border-white/5">
              <label className="mb-3 block text-sm font-medium text-zinc-300">Quick Presets</label>

              <div className="space-y-6">
                {/* Videos */}
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Videos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 5, 10].map((v) => (
                      <button
                        key={v}
                        onClick={() => handleUpdateTarget("VIDEOS", v)}
                        className={`
                          group relative rounded-2xl border px-5 py-4 text-center transition-all
                          ${
                            currentTarget?.type === "VIDEOS" && currentTarget.value === v
                              ? "border-sky-500/50 bg-sky-950/40 text-sky-300 shadow-sm"
                              : "border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.98]"
                          }
                        `}
                      >
                        <div className="text-lg font-semibold">{v}</div>
                        <div className="text-xs text-zinc-500">videos</div>

                        {currentTarget?.type === "VIDEOS" && currentTarget.value === v && (
                          <div className="absolute -inset-px rounded-2xl border border-sky-500/30 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minutes */}
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Time</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 30, 60].map((v) => (
                      <button
                        key={v}
                        onClick={() => handleUpdateTarget("MINUTES", v)}
                        className={`
                          group relative rounded-2xl border px-5 py-4 text-center transition-all
                          ${
                            currentTarget?.type === "MINUTES" && currentTarget.value === v
                              ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300 shadow-sm"
                              : "border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.98]"
                          }
                        `}
                      >
                        <div className="text-lg font-semibold">{v}</div>
                        <div className="text-xs text-zinc-500">minutes</div>

                        {currentTarget?.type === "MINUTES" && currentTarget.value === v && (
                          <div className="absolute -inset-px rounded-2xl border border-emerald-500/30 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom goal */}
            <div className="p-6 space-y-5">
              <label className="block text-sm font-medium text-zinc-300">Custom Goal</label>

              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Enter number"
                  className="flex-1 rounded-2xl bg-zinc-900 border border-white/10 px-5 py-4 text-white placeholder-zinc-500 focus:border-sky-600/50 focus:ring-1 focus:ring-sky-600/30 outline-none transition"
                />

                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as "VIDEOS" | "MINUTES")}
                  className="rounded-2xl bg-zinc-900 border border-white/10 px-4 py-4 text-zinc-300 focus:border-sky-600/50 focus:ring-1 focus:ring-sky-600/30 outline-none transition"
                >
                  <option value="VIDEOS">Videos</option>
                  <option value="MINUTES">Minutes</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border-white/10 text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleManualSubmit}
                  disabled={!customValue.trim() || isNaN(Number(customValue)) || Number(customValue) < 1}
                  className="flex-1 bg-linear-to-br from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-950/30 transition-all active:scale-[0.98]"
                >
                  Save Goal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}