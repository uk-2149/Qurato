"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy, PlayCircle, Calendar, Target, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import ActivityHeatmap from "@/components/ActivityHeatmap";

function StatCard({ label, value, hint, icon: Icon, colorClass, action }: any) {
  return (
    <div className={`p-6 rounded-2xl border relative ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 opacity-80">
          <Icon size={20} />
          <span className="font-medium text-sm">{label}</span>
        </div>
        {action}
      </div>
      <p className="text-4xl font-bold">{value}</p>
      {hint && <p className="text-sm opacity-60 mt-1">{hint}</p>}
    </div>
  );
}

export default function UserStatsPage() {
  const [data, setData] = useState<any>(null);
  const [target, setTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [customValue, setCustomValue] = useState<string>("");
  const [customType, setCustomType] = useState<"VIDEOS" | "MINUTES">("VIDEOS");

  const fetchData = async () => {
    try {
      const [statsRes, targetRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/user/target")
      ]);
      const statsData = await statsRes.json();
      const targetData = await targetRes.json();
      setData(statsData);
      setTarget(targetData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTarget = async (type: "VIDEOS" | "MINUTES", value: number) => {
    if (value <= 0) {
      toast.error("Please enter a valid number greater than 0");
      return;
    }
    try {
      const res = await fetch("/api/user/target", {
        method: "POST",
        body: JSON.stringify({ type, value }),
      });
      if (res.ok) {
        toast.success("Goal updated successfully!");
        setIsEditing(false);
        setCustomValue("");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to update goal");
    }
  };

  const handleManualSubmit = () => {
    const val = parseInt(customValue);
    if (isNaN(val)) {
      toast.error("Please enter a number");
      return;
    }
    handleUpdateTarget(customType, val);
  };

  if (loading) return (
    <>
      <NavBar otherPage={true} />
      <div className="pt-32 text-center animate-pulse">Loading your stats...</div>
    </>
  );

  if (!data) return (
    <>
      <NavBar otherPage={true} />
      <div className="pt-32 text-center">Failed to load history.</div>
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <NavBar otherPage={true} />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 space-y-12">

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Your Learning Journey</h1>
            <p className="text-zinc-500 mt-2">Track your consistency and celebrate your milestones.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Current Streak"
            value={`${data.streaks.current} Days`}
            icon={Flame}
            colorClass="bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
          />

          <StatCard
            label="Longest Streak"
            value={`${data.streaks.longest} Days`}
            icon={Trophy}
            colorClass="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          />

          <StatCard
            label="Daily Goal"
            value={target ? `${target.value} ${target.type === "VIDEOS" ? "Videos" : "Mins"}` : "None"}
            hint="Your current target"
            icon={Target}
            colorClass="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            action={
              <button onClick={() => setIsEditing(true)} className="hover:bg-emerald-200/50 p-1 rounded-md transition-colors">
                <Edit2 size={16} />
              </button>
            }
          />

          <StatCard
            label="Total Learning"
            value={`${data.lifetime.videos} Videos`}
            hint={`${Math.round(data.lifetime.minutes)} mins spent`}
            icon={PlayCircle}
            colorClass="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="This Week"
            value={`${data.periodStats?.week.videos || 0} Videos`}
            hint={`${Math.round(data.periodStats?.week.minutes || 0)} mins spent`}
            icon={Calendar}
            colorClass="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
          />

          <StatCard
            label="This Month"
            value={`${data.periodStats?.month.videos || 0} Videos`}
            hint={`${Math.round(data.periodStats?.month.minutes || 0)} mins spent`}
            icon={Calendar}
            colorClass="bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300"
          />

          <StatCard
            label="Most Active Day"
            value={data.insights?.mostActiveDay || "N/A"}
            hint="Based on your history"
            icon={Flame}
            colorClass="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
          />
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Update Daily Goal</h3>
                  <p className="text-sm text-zinc-500">Choose a preset or set a custom target.</p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => handleUpdateTarget("VIDEOS", 2)}>
                  <Target size={18} className="text-indigo-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">2 Videos</span>
                    <span className="text-xs text-zinc-500 font-normal">Light pace</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => handleUpdateTarget("VIDEOS", 5)}>
                  <Target size={18} className="text-indigo-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">5 Videos</span>
                    <span className="text-xs text-zinc-500 font-normal">Dedicated</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => handleUpdateTarget("MINUTES", 30)}>
                  <PlayCircle size={18} className="text-emerald-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">30 Mins</span>
                    <span className="text-xs text-zinc-500 font-normal">Daily habit</span>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => handleUpdateTarget("MINUTES", 60)}>
                  <PlayCircle size={18} className="text-emerald-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">60 Mins</span>
                    <span className="text-xs text-zinc-500 font-normal">Intensive</span>
                  </div>
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200 dark:border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Or Custom</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Target Value</label>
                    <input
                      type="number"
                      min="1"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Unit</label>
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <button
                        onClick={() => setCustomType("VIDEOS")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${customType === "VIDEOS"
                            ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                      >
                        Videos
                      </button>
                      <button
                        onClick={() => setCustomType("MINUTES")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${customType === "MINUTES"
                            ? "bg-white dark:bg-zinc-700 shadow-sm text-emerald-600 dark:text-emerald-300"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          }`}
                      >
                        Mins
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleManualSubmit}
                  disabled={!customValue}
                  className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Set Custom Goal
                </Button>
              </div>

            </div>
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
              <Calendar size={20} /> Activity History
            </h2>
            <div className="text-sm text-zinc-500">
              {data.history.filter((h: any) => new Date(h.date).getFullYear() === new Date().getFullYear()).length} days active this year
            </div>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-black overflow-hidden">
            <ActivityHeatmap data={data.history} />
          </div>
        </section>

      </div>
    </div>
  );
}
