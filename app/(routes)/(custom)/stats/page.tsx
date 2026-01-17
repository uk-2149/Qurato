"use client";

import { useEffect, useState } from "react";

type Stats = {
  users: {
    total: number;
    new7d: number;
    new30d: number;
    active7d: number;
  };
  courses: {
    total: number;
    saved: number;
  };
  lessons: {
    total: number;
    avgPerCourse: number;
  };
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!stats) return <p>Failed to load stats</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      <h1 className="text-3xl font-bold">Qurato Analytics</h1>

      {/* USERS */}
      <Section title="Users">
        <StatCard label="Total Users" value={stats.users.total} />
        <StatCard label="New (7 days)" value={stats.users.new7d} />
        <StatCard label="New (30 days)" value={stats.users.new30d} />
        <StatCard label="Active (7 days)" value={stats.users.active7d} />
      </Section>

      {/* COURSES */}
      <Section title="Courses">
        <StatCard label="Total Courses" value={stats.courses.total} />
        <StatCard label="Saved Courses" value={stats.courses.saved} />
      </Section>

      {/* LESSONS */}
      <Section title="Lessons">
        <StatCard label="Total Lessons" value={stats.lessons.total} />
        <StatCard
          label="Avg Lessons / Course"
          value={stats.lessons.avgPerCourse}
        />
      </Section>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
      {hint && <p className="text-xs text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="p-12 space-y-6">
      <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
