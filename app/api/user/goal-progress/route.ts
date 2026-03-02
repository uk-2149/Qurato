import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get target
    const target = await prisma.learningTarget.findUnique({
      where: { userId },
    });

    if (!target) {
      return NextResponse.json({
        type: null,
        target: 0,
        completed: 0,
        percent: 0,
        isTargetMet: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const completed =
      target.type === "VIDEOS"
        ? activity?.videosWatched ?? 0
        : activity?.minutesSpent ?? 0;

    const percent =
      target.value > 0
        ? Math.min(100, Math.round((completed / target.value) * 100))
        : 0;

    return NextResponse.json({
      type: target.type,
      target: target.value,
      completed,
      percent,
      isTargetMet: completed >= target.value,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch goal progress" },
      { status: 500 }
    );
  }
}