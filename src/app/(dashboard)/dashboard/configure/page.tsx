'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Copy, RefreshCw, Save, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ConfigureWebsitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [website, setWebsite] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    isActive: true
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchWebsiteData()
  }, [])

  const fetchWebsiteData = async () => {
    try {
      const response = await fetch('/api/website')
      const data = await response.json()
      
      if (!response.ok) {
        console.error('API Error:', data.error)
        return
      }
      
      setClient(data.client)
      setWebsite(data.website)
      
      if (data.website) {
        setFormData({
          name: data.website.name,
          domain: data.website.domain,
          isActive: data.website.isActive
        })
      }
    } catch (error) {
      console.error('Error fetching website data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (website) {
        // Update existing website
        const response = await fetch('/api/website', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: website.id,
            ...formData
          })
        })

        if (response.ok) {
          const data = await response.json()
          setWebsite(data.website)
          router.push('/dashboard')
        }
      } else {
        // Create new website
        if (!client || !client.id) {
          console.error('No client found. Cannot create website.')
          alert('No client found. Please ensure you are logged in.')
          return
        }
        
        const response = await fetch('/api/website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: client.id,
            ...formData
          })
        })

        if (response.ok) {
          const data = await response.json()
          setWebsite(data.website)
          router.push('/dashboard')
        } else {
          const error = await response.json()
          console.error('Error creating website:', error)
          alert(`Failed to create website: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving website:', error)
      alert('An error occurred while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate the API key? The old key will stop working immediately.')) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/website', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: website.id,
          regenerateApiKey: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setWebsite(data.website)
        setShowApiKey(true)
      }
    } catch (error) {
      console.error('Error regenerating API key:', error)
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Website</h1>
          <p className="text-muted-foreground">
            {website ? 'Update your website configuration' : 'Set up your website for analytics tracking'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Website Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Awesome Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A friendly name for your website
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Domain</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your website's domain (without https://)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (Enable analytics tracking)
              </label>
            </div>
          </CardContent>
        </Card>

        {website && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>API Configuration</CardTitle>
                <Badge variant={website.isActive ? "default" : "secondary"}>
                  {website.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-xs bg-gray-100 px-3 py-2 rounded font-mono">
                    {showApiKey ? website.apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(website.apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-xs text-green-600">Copied to clipboard!</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegenerateApiKey}
                  disabled={saving}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate API Key
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Warning: Regenerating will invalidate the current key immediately
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {website && (
          <Card>
            <CardHeader>
              <CardTitle>Integration Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add this code to your website's HTML, just before the closing &lt;/body&gt; tag:
              </p>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app'}/analytics.js"></script>
<script>
  Analytics.init('${website.apiKey}');
</script>`}
              </pre>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app'}/analytics.js"></script>\n<script>\n  Analytics.init('${website.apiKey}');\n</script>`)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Integration Code
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {website ? 'Save Changes' : 'Create Website'}
              </>
            )}
          </Button>
        </div>
      </form>

      {!website && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">First time setup</p>
                <p>Once you create your website configuration, you'll receive an API key that you'll use to integrate analytics tracking on your website.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 