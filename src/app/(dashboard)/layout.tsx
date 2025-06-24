import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Re-enable authentication after setting up Supabase
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/login')
  // }

  return <DashboardLayout>{children}</DashboardLayout>
} 