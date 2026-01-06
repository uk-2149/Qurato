import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  extractVideoId,
  fetchPlaylistVideos,
  fetchVideoMetadata,
  parseDuration,
} from "@/lib/youtube";
import { nanoid } from "nanoid";

interface Video {
  title: string;
  videoId: string;
  description: string;
  embedUrl: string;
  thumbnail: string;
  order: number;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, playlistId, source, links } = body;

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
      if (!links || !Array.isArray(links) || links.length === 0) {
        return NextResponse.json(
          { error: "Please provide at least one link" },
          { status: 400 }
        );
      }

      // Extract IDs
      const videoIds = links
        .map(extractVideoId)
        .filter((id): id is string => Boolean(id));

      if (videoIds.length === 0) {
        return NextResponse.json(
          { error: "No valid YouTube video links found" },
          { status: 400 }
        );
      }

      if (videoIds.length > 200) {
        return NextResponse.json(
          { error: "Maximum 200 videos allowed per course" },
          { status: 400 }
        );
      }

      // Fetch metadata in batches
      const videos = await fetchVideoMetadata(videoIds);

      // Normalize lessons
      const lessons = videos.map((video, index) => ({
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
        order: index + 1,
      }));

      const result = await prisma.$transaction(async (tx) => {
        // Create course
        const course = await tx.course.create({
          data: {
            title,
            description,
            source: "custom",
            totalVideos: lessons.length,
            thumbnail: lessons[0]?.thumbnail || null,
            author: {
              connect: { email: session.user.email as string },
            },
            shareId: nanoid(10),
          },
        });

        // Create lessons
        await tx.lesson.createMany({
          data: lessons.map((l) => ({
            ...l,
            courseId: course.id,
          })),
        });

        return course;
      });

      return NextResponse.json({
        success: true,
        courseId: result.id,
        totalVideos: lessons.length,
      });
    }

    // Fetch playlist videos
    const videos = await fetchPlaylistVideos(playlistId);

    const course = await prisma.$transaction(async (tx) => {
      // Create course
      const createdCourse = await tx.course.create({
        data: {
          title,
          description,
          playlistId,
          source: "youtube",
          totalVideos: videos.length,
          thumbnail: videos[0]?.thumbnail || null,
          author: {
            connect: { email: session.user.email as string },
          },
          shareId: nanoid(10),
        },
      });

      // Create lessons
      await tx.lesson.createMany({
        data: videos.map((video: Video) => ({
          title: video.title,
          videoId: video.videoId,
          description: video.description,
          thumbnail: video.thumbnail,
          embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
          order: video.order,
          courseId: createdCourse.id,
        })),
      });

      // ✅ IMPORTANT: return something from the transaction
      return createdCourse;
    });

    return NextResponse.json(
      {
        course,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Create Course Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
