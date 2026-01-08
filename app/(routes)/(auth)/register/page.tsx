import Public from '@/components/auth/Public'
import RegisterPage from '@/components/Register'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {

  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";
  
  return (
    <Public>
        <RegisterPage callbackUrl={callbackUrl} />
    </Public>
  )
}