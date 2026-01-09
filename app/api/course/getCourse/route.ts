import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get("sId");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    // Fetch course with lessons
    const course = await prisma.course.findUnique({
      where: { shareId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let isSaved = false;
    let progressData: {
      completedLessons: string[];
      currentLessonId: string | null;
    } = {
      completedLessons: [],
      currentLessonId: null,
    };

    // Check if logged in
    if (session?.user?.id) {
      const userId = session.user.id;

      // Ensure valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);

      if (isValidObjectId) {
        // Check Saved Status
        try {
          const savedCourse = await prisma.savedCourse.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
          });

          isSaved = !!savedCourse;
        } catch (err) {
          console.warn("Error checking saved:", err);
        }

        // Check Progress
        try {
          const progress = await prisma.userProgress.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
          });

          if (progress) {
            progressData = {
              completedLessons: progress.completedLessons ?? [],
              currentLessonId: progress.currentLessonId ?? null,
            };
          }
        } catch (err) {
          console.warn("Error fetching progress:", err);
        }
      }
    }

    return NextResponse.json({
      ...course,
      isSaved,
      ...progressData,
    });
  } catch (err) {
    console.error("Error in getCourse:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
