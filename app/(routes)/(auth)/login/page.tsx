import Public from "@/components/auth/Public";
import LoginPage from "@/components/Login";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";

  return (
    <Public>
      <LoginPage callbackUrl={callbackUrl} />
    </Public>
  );
}
