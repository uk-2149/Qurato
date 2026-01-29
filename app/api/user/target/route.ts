import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { getTodayDate } from "@/lib/dateUtils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.learningTarget.findUnique({
    where: { userId: session.user.id }
  });

  return NextResponse.json(target);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, value } = await req.json();

    if (!["VIDEOS", "MINUTES"].includes(type) || typeof value !== "number" || value <= 0) {
      return NextResponse.json({ error: "Invalid target settings" }, { status: 400 });
    }

    const target = await prisma.learningTarget.upsert({
      where: { userId: session.user.id },
      update: {
        type,
        value,
        lastConfirmedAt: new Date()
      },
      create: {
        userId: session.user.id,
        type,
        value,
        lastConfirmedAt: new Date()
      }
    });

    const today = getTodayDate();
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } }
    });

    if (todayActivity) {
      const isMet = type === "VIDEOS"
        ? todayActivity.videosWatched >= value
        : todayActivity.minutesSpent >= value;

      if (todayActivity.isTargetMet !== isMet) {
        await prisma.dailyActivity.update({
          where: { id: todayActivity.id },
          data: { isTargetMet: isMet }
        });
      }
    }

    return NextResponse.json(target);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update target" }, { status: 500 });
  }
}