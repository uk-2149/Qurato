import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fetchPlaylistVideos } from "@/lib/youtube";

interface Video {
  title: string;
  videoId: string;
  description: string;
  embedUrl: string;
  thumbnail: string;
  order: number;
}

function generateRandomString(length: number) {
  const chars = 'abcdefghijlkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    // Pick a random character from the 'chars' string
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randomString;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, playlistId, source } = body;

    if (!title || !source) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (source === "youtube" && !playlistId) {
      return NextResponse.json(
        { error: "Playlist ID required" },
        { status: 400 }
      );
    }

    if (source === "custom") {
        const course = await prisma.course.create({
          data: {
            title,
            description,
            source: "custom",
            totalVideos: 0,
            author: {
                connect: { email: session.user.email },
            },
            shareId: title[0] + generateRandomString(9),
          },
        });
        return NextResponse.json({
            success: true,
            courseId: course.id,
            totalVideos: 0,
        });
    }

    // Fetch playlist videos
    const videos = await fetchPlaylistVideos(playlistId);

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        playlistId,
        source: "youtube",
        totalVideos: videos.length,
        thumbnail: videos[0]?.thumbnail || null,
        author: {
          connect: { email: session.user.email },
        },
        shareId: title[0] + generateRandomString(9),
      },
    });

    // Insert lessons
    await prisma.lesson.createMany({
      data: videos.map((video: Video) => ({
        title: video.title,
        videoId: video.videoId,
        description: video.description,
        thumbnail: video.thumbnail,
        embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
        order: video.order,
        courseId: course.id,
      })),
    });

    return NextResponse.json({
      success: true,
      courseId: course.id,
      totalVideos: videos.length,
    });
  } catch (error) {
    console.error("Create Course Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
