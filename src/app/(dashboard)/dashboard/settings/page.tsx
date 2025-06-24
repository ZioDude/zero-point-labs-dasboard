import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Key, Globe, Bell, Shield, Database, Copy } from 'lucide-react'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function SettingsPage() {
  // Get the client's website
  let website = null
  try {
    const client = await prisma.client.findFirst({
      include: {
        website: true
      }
    })
    website = client?.website
  } catch (error) {
    console.error('Error fetching website:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and platform preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Website Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Website Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {website ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website Name</label>
                    <input
                      type="text"
                      defaultValue={website.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domain</label>
                    <input
                      type="text"
                      defaultValue={website.domain}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">API Key</label>
                    <Badge variant={website.isActive ? "default" : "secondary"}>
                      {website.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono">
                      {website.apiKey}
                    </code>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this API key in your website's tracking script
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tracking Script</label>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app'}/analytics.js"></script>
<script>
  Analytics.init('${website.apiKey}');
</script>`}
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard/configure">
                    <Button>Save Changes</Button>
                  </Link>
                  <Button variant="outline">Regenerate API Key</Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No website configured</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your website to start tracking analytics
                </p>
                <Link href="/dashboard/configure">
                  <Button>
                    <Globe className="mr-2 h-4 w-4" />
                    Configure Website
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                defaultValue="Demo User"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                defaultValue="demo@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                type="text"
                defaultValue="Demo Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <Button variant="outline">Update Password</Button>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5" />
              API Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Master API Key</label>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  ak_master_demo_key_123456789
                </code>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Limits</label>
              <p className="text-xs text-muted-foreground">
                1,000 events per minute per website
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Generate New Key
              </Button>
              <Button variant="outline" size="sm">
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive alerts about your analytics
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Weekly Reports</p>
                <p className="text-xs text-muted-foreground">
                  Get weekly analytics summaries
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Security Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Alerts about login attempts and API usage
                </p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <Button variant="outline">Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Retention</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="30">30 days</option>
                <option value="90" selected>90 days</option>
                <option value="365">1 year</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Data</label>
              <p className="text-xs text-muted-foreground">
                Download your analytics data in CSV format
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Analytics
              </Button>
              <Button variant="outline" size="sm">
                Export Forms
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Domain Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Domain Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Allowed Domains</label>
              <p className="text-xs text-muted-foreground">
                Domains that can send analytics data
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  {website ? `*.${website.domain}` : '*.example.com'}
                </code>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  localhost:*
                </code>
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add new domain"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button>Add Domain</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 