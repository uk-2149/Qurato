import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();

    const newUsers7d = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const totalCourses = await prisma.course.count();

    const createdCourses = await prisma.course.count({
      where: { source: "custom" },
    });

    const savedCourses = await prisma.savedCourse.count();

    const totalLessons = await prisma.lesson.count();

    const avgLessons =
      totalCourses === 0 ? 0 : Math.round(totalLessons / totalCourses);

    const activeUsers7d = await prisma.userProgress.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const coursesStarted = await prisma.userProgress.count();

    return NextResponse.json({
      users: {
        total: totalUsers,
        new7d: newUsers7d,
        active7d: activeUsers7d,
      },
      courses: {
        total: totalCourses,
        created: createdCourses,
        saved: savedCourses,
      },
      lessons: {
        total: totalLessons,
        avgPerCourse: avgLessons,
      },
      engagement: {
        coursesStarted,
      },
    });
  } catch (err) {
    console.log("Error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
