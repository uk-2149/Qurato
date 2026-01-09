import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lectureId, courseId } = await req.json();

    if (!lectureId || !courseId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Find or create progress row for this course
    let progress = await prisma.userProgress.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          courseId,
          completedLessons: [lectureId],
          currentLessonId: lectureId,
        },
      });

      return NextResponse.json(progress);
    }

    // Toggle completed state
    const isAlreadyCompleted = progress.completedLessons.includes(lectureId);

    const updated = await prisma.userProgress.update({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
      data: {
        completedLessons: isAlreadyCompleted
          ? progress.completedLessons.filter((l) => l !== lectureId)
          : [...progress.completedLessons, lectureId],
        currentLessonId: lectureId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
