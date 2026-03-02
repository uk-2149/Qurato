import Private from "@/components/auth/Private";
import UserStats from "@/components/UserStats";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <Private>
      <UserStats />
    </Private>
  );
}