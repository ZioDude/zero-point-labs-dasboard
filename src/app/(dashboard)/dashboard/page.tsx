import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Globe, FileText, Users, Settings, Copy } from 'lucide-react'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  // Initialize with fallback values
  let website = null
  let totalVisitors = 0
  let formSubmissions = 0
  let teamMembers = 1
  let recentActivity: any[] = []
  let topPages: any[] = []
  
  try {
    // For now, we'll get the first client's website
    // In production, this would be based on the authenticated user's client
    const client = await prisma.client.findFirst({
      include: {
        website: true,
        users: true
      }
    })

    if (client) {
      website = client.website
      teamMembers = client.users.length || 1

      if (website) {
        // Get stats for the website
        const [visitorsResult, formsResult, recentEventsResult] = await Promise.allSettled([
          prisma.analyticsEvent.count({
            where: { websiteId: website.id }
          }),
          prisma.formSubmission.count({
            where: { websiteId: website.id }
          }),
          prisma.analyticsEvent.findMany({
            where: { websiteId: website.id },
            take: 5,
            orderBy: { createdAt: 'desc' }
          })
        ])

        if (visitorsResult.status === 'fulfilled') {
          totalVisitors = visitorsResult.value
        }
        if (formsResult.status === 'fulfilled') {
          formSubmissions = formsResult.value
        }
        if (recentEventsResult.status === 'fulfilled') {
          recentActivity = recentEventsResult.value
        }

        // Get top pages
        try {
          const pageViews = await prisma.analyticsEvent.groupBy({
            by: ['pageUrl'],
            where: { 
              websiteId: website.id,
              eventType: 'pageview',
              pageUrl: { not: null }
            },
            _count: true,
            orderBy: { _count: { pageUrl: 'desc' } },
            take: 4
          })
          topPages = pageViews.map((pv: { pageUrl: string | null; _count: number }) => ({
            url: pv.pageUrl,
            count: pv._count
          }))
        } catch (err) {
          console.error('Error fetching top pages:', err)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your analytics.
        </p>
      </div>

      {/* Website Info Card */}
      {website && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Website</CardTitle>
              <Badge variant={website.isActive ? "default" : "secondary"}>
                {website.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{website.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Domain</p>
                <p className="text-lg font-mono">{website.domain}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">API Key</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono">
                  {website.apiKey}
                </code>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/dashboard/configure">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Website
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!website && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No website configured</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Configure your website to start tracking analytics
            </p>
            <Link href="/dashboard/configure">
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Configure Website
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Status</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{website ? 'Active' : 'Not Set'}</div>
            <p className="text-xs text-muted-foreground">
              {website ? website.domain : 'Configure in settings'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers === 1 ? "You're the owner" : `${teamMembers} members`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((event: any) => (
                  <div key={event.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {event.eventType === 'pageview' ? 'Page view' : event.eventType} 
                        {event.pageUrl && ` on ${event.pageUrl}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No page data yet</p>
            ) : (
              <div className="space-y-4">
                {topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{page.url || '/'}</span>
                    <span className="text-sm text-muted-foreground">{page.count} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 