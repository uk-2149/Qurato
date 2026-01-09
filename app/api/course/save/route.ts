import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    if (!isValidObjectId) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.savedCourse.upsert({
      where: {
        userId_courseId: {
          userId: userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId: userId,
        courseId,
      },
    });

    return NextResponse.json(
      { message: "Course saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save course error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
