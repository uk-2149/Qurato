import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import NavBar from "@/components/NavBar";
import AllCourses from "@/components/AllCourses";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  // later replace with real DB calls
//   const createdCourses = [];
//   const savedCourses = [];




  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <NavBar otherPage={false} />

      <div className="w-[92vw] max-w-5xl mx-auto py-8 my-20">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
          Hi {session.user?.name}, ready to learn?
        </h1>

        <AllCourses />
      </div>
    </div>
  );
}
