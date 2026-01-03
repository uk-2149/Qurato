import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/course/getCourse?sId=abc123

export async function GET(req: Request) {
  try {
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

    return NextResponse.json(course);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
