"use client";
import { useState, useEffect } from "react";
import { Target, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DailyTargetPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTarget = async () => {
      const res = await fetch("/api/user/target");
      const data = await res.json();
      if (!data || new Date(data.lastConfirmedAt).toDateString() !== new Date().toDateString()) {
        setShow(true);
      }
    };
    fetchTarget();
  }, []);

  const setGoal = async (type: "VIDEOS" | "MINUTES", value: number) => {
    setLoading(true);
    try {
      await fetch("/api/user/target", {
        method: "POST",
        body: JSON.stringify({ type, value }),
      });
      toast.success("Daily target set!");
      setShow(false);
    } catch (err) {
      toast.error("Failed to set goal");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-8 relative animate-in fade-in slide-in-from-top-4 duration-500">
      <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
        <X size={18} />
      </button>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Target className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Set your goal for today</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button variant="outline" onClick={() => setGoal("VIDEOS", 2)} disabled={loading}>2 Videos</Button>
        <Button variant="outline" onClick={() => setGoal("VIDEOS", 5)} disabled={loading}>5 Videos</Button>
        <Button className="bg-zinc-900 dark:bg-white text-white dark:text-black" onClick={() => setGoal("MINUTES", 30)} disabled={loading}>30 Minutes</Button>
      </div>
    </div>
  );
}