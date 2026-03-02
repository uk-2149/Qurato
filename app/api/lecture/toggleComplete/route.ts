import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getTodayDate } from "@/lib/dateUtils";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId, courseId } = await req.json();

    if (!lectureId || !courseId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userId = session.user.id;

    // Fetch Lesson and Target in parallel
    const [lesson, target] = await Promise.all([
      prisma.lesson.findUnique({ where: { id: lectureId } }),
      prisma.learningTarget.findUnique({ where: { userId } })
    ]);

    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    let durationInSeconds = lesson.duration || 0;

    if (durationInSeconds === 0) {
      try {
        // Import internally to avoid top-level issues if any
        const { fetchVideoMetadata, parseDuration } = await import("@/lib/youtube");
        const meta = await fetchVideoMetadata([lesson.videoId]);
        if (meta && meta[0]) {
          durationInSeconds = parseDuration(meta[0].contentDetails.duration);
          // Update the lesson permanently
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: { duration: durationInSeconds }
          });
        }
      } catch (err) {
        console.warn("Failed to auto-heal duration", err);
      }
    }

    // Handle Progress
    const progress = await prisma.userProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const isAlreadyCompleted = progress?.completedLessons.includes(lectureId) ?? false;
    const isMarkingComplete = !isAlreadyCompleted;

    // Update or Create Progress
    const updatedProgress = await prisma.userProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {
        completedLessons: isMarkingComplete
          ? { push: lectureId }
          : { set: progress!.completedLessons.filter((id) => id !== lectureId) },
        currentLessonId: lectureId,
      },
      create: {
        userId,
        courseId,
        completedLessons: [lectureId],
        currentLessonId: lectureId,
      },
    });

    // Handle Daily Activity Stats
    const today = getTodayDate();
    const durationInMinutes = Math.floor(durationInSeconds / 60);

    // Upsert the activity for today
    const activity = await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        videosWatched: { increment: isMarkingComplete ? 1 : -1 },
        minutesSpent: { increment: isMarkingComplete ? durationInMinutes : -durationInMinutes },
      },
      create: {
        userId,
        date: today,
        videosWatched: isMarkingComplete ? 1 : 0,
        minutesSpent: isMarkingComplete ? durationInMinutes : 0,
        isTargetMet: false,
      }
    });

    // Check if Target is Met (After the update)
    if (target) {
      const isMet = target.type === "VIDEOS"
        ? activity.videosWatched >= target.value
        : activity.minutesSpent >= target.value;

      // Only update DB if the status actually changed
      if (activity.isTargetMet !== isMet) {
        await prisma.dailyActivity.update({
          where: { id: activity.id },
          data: { isTargetMet: isMet }
        });
      }
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("Progress Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
