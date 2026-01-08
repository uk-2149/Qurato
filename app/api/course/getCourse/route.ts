import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET /api/course/getCourse?sId=abc123

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
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    let isSaved = false;
    if (session?.user?.id) {
      try {
        // Validate that userId is a valid MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(session.user.id);
        
        if (isValidObjectId) {
          const savedCourse = await prisma.savedCourse.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: course.id,
              },
            },
          });
          isSaved = !!savedCourse;
        }
      } catch (error) {
        // Silently fail if there's an issue checking saved status
        console.warn("Error checking saved course status:", error);
      }
    }

    return NextResponse.json({
      ...course,
      isSaved,
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