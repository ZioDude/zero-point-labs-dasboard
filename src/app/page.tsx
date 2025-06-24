import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function HomePage() {
  // TODO: Re-enable authentication redirect after setting up Supabase
  // const session = await getServerSession(authOptions)
  // if (session) {
  //   redirect('/dashboard')
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Analytics Pro
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Professional analytics dashboard for your clients
        </p>
        <p className="text-gray-500 mb-8">
          Track website analytics, form submissions, and performance metrics all in one place.
        </p>
        <Link href="/login">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}
