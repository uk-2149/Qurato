import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Validate that userId is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    if (!isValidObjectId) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { authorId: userId },
          {
            savedBy: {
              some: { userId }
            }
          }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        lessons: {
          select: { id: true }
        },
        author: {
          select: { email: true }
        },
      },
    });

    // Fetch progress for all user courses in one query
    const progress = await prisma.userProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map();
    progress.forEach((p) => {
      progressMap.set(p.courseId, p.completedLessons.length);
    });

    const formatted = courses.map((course) => {
      const total = course.lessons.length;
      const completed = progressMap.get(course.id) || 0;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        totalVideos: total,
        completedLessons: completed,
        percentage,
        type: course.author.email === session.user.email ? "created" : "saved",
        shareId: course.shareId,
        source: course.source,
        playlistId: course.playlistId,
        authorId: course.authorId,
      };
    });

    return NextResponse.json({ courses: formatted });
  } catch (error) {
    console.error("Get all courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
