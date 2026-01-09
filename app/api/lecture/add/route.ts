import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  extractVideoId,
  fetchVideoMetadata,
  parseDuration,
} from "@/lib/youtube";

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
    const { courseId, videoLinks } = body;

    if (
      !courseId ||
      !videoLinks ||
      !Array.isArray(videoLinks) ||
      videoLinks.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const videoIds = videoLinks
      .map(extractVideoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return NextResponse.json(
        { error: "No valid YouTube video links found" },
        { status: 400 }
      );
    }

    const videoMetadata = await fetchVideoMetadata(videoIds);

    const existingVideoIds = new Set(course.lessons.map((l) => l.videoId));

    const newVideos = videoMetadata.filter((v) => !existingVideoIds.has(v.id));

    if (newVideos.length === 0) {
      return NextResponse.json(
        { error: "All videos already exist in this course" },
        { status: 400 }
      );
    }

    const baseOrder = course.lessons.length;

    const lessonsData = newVideos.map((video, i) => ({
      title: video.snippet.title,
      videoId: video.id,
      description: video.snippet.description,
      thumbnail:
        video.snippet.thumbnails.maxres?.url ??
        video.snippet.thumbnails.high?.url ??
        video.snippet.thumbnails.medium?.url ??
        null,
      embedUrl: `https://www.youtube.com/embed/${video.id}`,
      duration: parseDuration(video.contentDetails.duration),
      order: baseOrder + i + 1,
    }));

    await prisma.$transaction([
      prisma.lesson.createMany({
        data: lessonsData.map((lesson) => ({
          ...lesson,
          courseId,
        })),
      }),
      prisma.course.update({
        where: { id: courseId },
        data: {
          totalVideos: {
            increment: lessonsData.length,
          },
          thumbnail: course.thumbnail || lessonsData[0]?.thumbnail || null,
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, addedVideos: lessonsData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding lectures:", error);
    return NextResponse.json(
      { error: "Failed to add lectures" },
      { status: 500 }
    );
  }
}
