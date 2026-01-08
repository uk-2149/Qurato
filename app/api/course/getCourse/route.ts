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
            name: true,
          },
        },
        savedBy: session?.user?.id
          ? {
            where: { userId: session.user.id },
            select: { id: true },
          }
          : false,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...course,
      isSaved: course.savedBy?.length > 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
