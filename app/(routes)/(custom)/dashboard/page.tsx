import Private from "@/components/auth/Private";
import Dashboard from "@/components/Dashboard";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <Private>
      <Dashboard name={session.user.name!} />
    </Private>
  );
}