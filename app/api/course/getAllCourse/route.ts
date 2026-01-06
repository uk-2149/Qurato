import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            author: {
              email: session.user.email,
            },
          },
          {
            savedBy: {
              some: {
                user: {
                  email: session.user.email,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: { email: true },
        },
      },
    });

    // Normalize data
    const formatted = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      totalVideos: course.totalVideos,
      type:
        course.author.email === session.user.email
          ? "created"
          : "saved",
      shareId: course.shareId,
      source: course.source,
      playListId: course.playlistId,
    }));

    return NextResponse.json({ courses: formatted });
  } catch (error) {
    console.error("Get all courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
