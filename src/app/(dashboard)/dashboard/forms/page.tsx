import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Mail, Calendar, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/db'

export default async function FormsPage() {
  let website = null
  let totalSubmissions = 0
  let recentSubmissions: any[] = []

  try {
    // Get the client's website
    const client = await prisma.client.findFirst({
      include: {
        website: true
      }
    })

    if (client?.website) {
      website = client.website

      // Get form submissions stats for this website
      const [totalResult, recentResult] = await Promise.allSettled([
        prisma.formSubmission.count({
          where: { websiteId: website.id }
        }),
        prisma.formSubmission.findMany({
          where: { websiteId: website.id },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ])

      if (totalResult.status === 'fulfilled') {
        totalSubmissions = totalResult.value
      }
      if (recentResult.status === 'fulfilled') {
        recentSubmissions = recentResult.value
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
            <p className="text-muted-foreground">
              {website ? `Form submissions from ${website.name}` : 'Configure your website to track form submissions'}
            </p>
          </div>
        </div>

        {!website && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No website configured</h3>
              <p className="text-muted-foreground text-center">
                Configure your website in settings to start tracking form submissions.
              </p>
            </CardContent>
          </Card>
        )}

        {website && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    All form submissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recentSubmissions.filter((sub: any) => 
                      new Date(sub.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submissions this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. per Day</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(totalSubmissions / 30) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily average (30 days)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No form submissions yet</h3>
                    <p className="text-muted-foreground">
                      Form submissions will appear here when visitors submit forms on your website.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSubmissions.map((submission: any) => (
                      <Card key={submission.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {submission.formName && (
                                <Badge variant="outline">
                                  {submission.formName}
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {new Date(submission.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {submission.fields && (
                            <div className="grid gap-2">
                              {Object.entries(submission.fields as Record<string, any>).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm font-medium capitalize">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {String(value).slice(0, 100)}
                                    {String(value).length > 100 ? '...' : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {submission.pageUrl && (
                            <div className="text-xs text-muted-foreground mt-2">
                              From: {submission.pageUrl}
                            </div>
                          )}
                          
                          {submission.ipAddress && (
                            <div className="text-xs text-muted-foreground">
                              IP: {submission.ipAddress}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error fetching forms:', error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Form Submissions</h1>
            <p className="text-muted-foreground">
              View and manage form submissions from your website.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading form submissions</h3>
            <p className="text-muted-foreground mb-4 text-center">
              An error occurred while fetching form data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
} 