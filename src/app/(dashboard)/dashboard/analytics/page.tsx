import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/db'

export default async function AnalyticsPage() {
  // Initialize with fallback values
  let totalEvents = 0
  let uniqueSessions = 0
  let website = null
  let recentEvents: any[] = []
  let hasError = false

  try {
    // Get the client's website
    const client = await prisma.client.findFirst({
      include: {
        website: true
      }
    })

    if (client?.website) {
      website = client.website

      // Get basic analytics stats with timeout protection
      const [eventsResult, sessionsResult, eventsListResult] = await Promise.allSettled([
        prisma.analyticsEvent.count({
          where: { websiteId: website.id }
        }),
        prisma.analyticsEvent.findMany({
          where: { websiteId: website.id },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
        prisma.analyticsEvent.findMany({
          where: { websiteId: website.id },
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ])

      // Process results safely
      if (eventsResult.status === 'fulfilled') {
        totalEvents = eventsResult.value
      }

      if (sessionsResult.status === 'fulfilled') {
        uniqueSessions = sessionsResult.value.length
      }

      if (eventsListResult.status === 'fulfilled') {
        recentEvents = eventsListResult.value
      }
    }

  } catch (error) {
    console.error('Error fetching analytics:', error)
    hasError = true
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {website ? `Analytics for ${website.name}` : 'Configure your website to see analytics'}
          </p>
        </div>
      </div>

      {hasError && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <p className="text-orange-800 text-sm">
              ⚠️ Some analytics data may be temporarily unavailable. Showing available data below.
            </p>
          </CardContent>
        </Card>
      )}

      {!website && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No website configured</h3>
            <p className="text-muted-foreground text-center">
              Configure your website in settings to start tracking analytics.
            </p>
          </CardContent>
        </Card>
      )}

      {website && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All tracked events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Unique visitor sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Website</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{website.domain}</div>
                <p className="text-xs text-muted-foreground">
                  {website.isActive ? 'Active' : 'Inactive'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. per Session</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {uniqueSessions > 0 ? Math.round(totalEvents / uniqueSessions) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Events per session
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground">
                    Events will appear here once your website starts tracking.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{event.eventType}</Badge>
                        <div>
                          <p className="text-sm font-medium">{website.name}</p>
                          <p className="text-xs text-muted-foreground">{event.pageUrl}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.browser} • {event.os}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 