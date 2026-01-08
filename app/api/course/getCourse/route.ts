import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

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

    // Build the include object conditionally
    const includeConfig: Prisma.CourseInclude = {
      lessons: {
        orderBy: { order: "asc" },
      },
      author: {
        select: {
          name: true,
        },
      },
    };

    // Only add savedBy if user is authenticated
    if (session?.user?.id) {
      includeConfig.savedBy = {
        where: { userId: session.user.id },
        select: { id: true },
      };
    }

    const course = await prisma.course.findUnique({
      where: { shareId },
      include: includeConfig,
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if saved (handle both authenticated and unauthenticated cases)
    const isSaved = session?.user?.id 
      ? (course.savedBy && course.savedBy.length > 0)
      : false;

    return NextResponse.json({
      ...course,
      isSaved,
    });
  } catch (err) {
    console.error("Error in getCourse:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}