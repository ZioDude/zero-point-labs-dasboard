interface AnalyticsConfig {
  apiKey: string
  endpoint?: string
  autoTrack?: boolean
  trackPageViews?: boolean
  trackClicks?: boolean
  trackForms?: boolean
  trackPerformance?: boolean
  debug?: boolean
}

interface AnalyticsEvent {
  eventType: string
  pageUrl?: string
  referrer?: string
  userAgent?: string
  sessionId?: string
  userId?: string
  metadata?: Record<string, any>
}

interface PerformanceData {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

class Analytics {
  private config: AnalyticsConfig
  private sessionId: string
  private userId?: string
  private isInitialized = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.config = {
      apiKey: '',
      endpoint: '',
      autoTrack: true,
      trackPageViews: true,
      trackClicks: true,
      trackForms: true,
      trackPerformance: true,
      debug: false,
    }
  }

  /**
   * Initialize the Analytics SDK
   */
  init(apiKeyOrConfig: string | AnalyticsConfig): void {
    if (typeof apiKeyOrConfig === 'string') {
      this.config.apiKey = apiKeyOrConfig
    } else {
      this.config = { ...this.config, ...apiKeyOrConfig }
    }

    if (!this.config.apiKey) {
      console.error('Analytics: API key is required')
      return
    }

    // Set default endpoint if not provided
    if (!this.config.endpoint) {
      this.config.endpoint = this.getDefaultEndpoint()
    }

    this.isInitialized = true

    if (this.config.debug) {
      console.log('Analytics initialized with config:', this.config)
    }

    // Auto-track events if enabled
    if (this.config.autoTrack) {
      this.setupAutoTracking()
    }

    // Track initial page view
    if (this.config.trackPageViews) {
      this.trackPageView()
    }

    // Track performance metrics
    if (this.config.trackPerformance) {
      this.trackPerformance()
    }
  }

  /**
   * Track a custom event
   */
  track(eventType: string, metadata?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics: SDK not initialized. Call Analytics.init() first.')
      return
    }

    const event: AnalyticsEvent = {
      eventType,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      userId: this.userId,
      metadata,
    }

    this.sendEvent(event)
  }

  /**
   * Track a page view
   */
  trackPageView(url?: string): void {
    this.track('pageview', {
      url: url || window.location.href,
      title: document.title,
      path: window.location.pathname,
    })
  }

  /**
   * Track a click event
   */
  trackClick(element: HTMLElement, metadata?: Record<string, any>): void {
    const clickData = {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      text: element.textContent?.slice(0, 100) || undefined,
      href: (element as HTMLAnchorElement).href || undefined,
      ...metadata,
    }

    this.track('click', clickData)
  }

  /**
   * Track a form submission
   */
  trackFormSubmission(form: HTMLFormElement, metadata?: Record<string, any>): void {
    const formData = new FormData(form)
    const fields: Record<string, any> = {}
    let fieldCount = 0

    // Extract form fields (but not sensitive data)
    for (const [key, value] of formData.entries()) {
      fieldCount++
      // Skip sensitive fields
      if (!this.isSensitiveField(key)) {
        fields[key] = value
      }
    }

    const submissionData = {
      formId: form.id || undefined,
      formName: form.name || undefined,
      action: form.action || undefined,
      method: form.method || 'get',
      fieldCount,
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      ...metadata,
    }

    this.track('form_submission', submissionData)
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId
    if (this.config.debug) {
      console.log('Analytics: User ID set to', userId)
    }
  }

  /**
   * Clear user ID
   */
  clearUserId(): void {
    this.userId = undefined
    if (this.config.debug) {
      console.log('Analytics: User ID cleared')
    }
  }

  /**
   * Track performance metrics
   */
  private trackPerformance(): void {
    // Wait for page load
    if (document.readyState === 'complete') {
      this.collectPerformanceMetrics()
    } else {
      window.addEventListener('load', () => {
        // Delay to ensure all metrics are available
        setTimeout(() => this.collectPerformanceMetrics(), 1000)
      })
    }
  }

  /**
   * Collect and send performance metrics
   */
  private collectPerformanceMetrics(): void {
    if (!('performance' in window)) return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')

    const performanceData: PerformanceData = {}

    // Time to First Byte
    if (navigation) {
      performanceData.ttfb = navigation.responseStart - navigation.fetchStart
    }

    // First Contentful Paint and Largest Contentful Paint
    paint.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        // We'll use FCP as a proxy for LCP if LCP isn't available
        performanceData.lcp = entry.startTime
      }
    })

    // Web Vitals (if available)
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          performanceData.lcp = lastEntry.startTime
          this.sendPerformanceMetric('lcp', lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0] as PerformanceEventTiming
          performanceData.fid = firstInput.processingStart - firstInput.startTime
          this.sendPerformanceMetric('fid', firstInput.processingStart - firstInput.startTime)
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let cls = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value
            }
          }
          performanceData.cls = cls
          this.sendPerformanceMetric('cls', cls)
        }).observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        if (this.config.debug) {
          console.warn('Analytics: Could not observe performance metrics:', error)
        }
      }
    }

    // Send basic performance data
    if (Object.keys(performanceData).length > 0) {
      this.track('performance', performanceData)
    }
  }

  /**
   * Send individual performance metric
   */
  private sendPerformanceMetric(metricType: string, value: number): void {
    // You could implement a separate API endpoint for performance metrics
    // For now, we'll track them as regular events
    this.track('performance_metric', {
      metricType,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
    })
  }

  /**
   * Setup automatic event tracking
   */
  private setupAutoTracking(): void {
    // Track clicks
    if (this.config.trackClicks) {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target) {
          this.trackClick(target)
        }
      })
    }

    // Track form submissions
    if (this.config.trackForms) {
      document.addEventListener('submit', (event) => {
        const target = event.target as HTMLFormElement
        if (target) {
          this.trackFormSubmission(target)
        }
      })
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility', {
        visible: !document.hidden,
        visibilityState: document.visibilityState,
      })
    })

    // Track beforeunload (page exit)
    window.addEventListener('beforeunload', () => {
      this.track('page_exit', {
        timeOnPage: Date.now() - this.getSessionStartTime(),
      })
    })
  }

  /**
   * Send event to analytics endpoint
   */
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          ...event,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      if (this.config.debug) {
        console.log('Analytics: Event sent successfully', event)
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Analytics: Failed to send event', error, event)
      }
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get the default endpoint based on current domain
   */
  private getDefaultEndpoint(): string {
    // In production, this would be your actual domain
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3002'
    }
    // Default to your production domain
    return 'https://your-analytics-domain.vercel.app'
  }

  /**
   * Check if a form field is sensitive and should not be tracked
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'confirm_password',
      'credit_card',
      'creditcard',
      'ccnumber',
      'cvv',
      'ssn',
      'social_security',
    ]
    
    return sensitiveFields.some(sensitive => 
      fieldName.toLowerCase().includes(sensitive)
    )
  }

  /**
   * Get session start time
   */
  private getSessionStartTime(): number {
    // Extract timestamp from session ID
    const timestamp = this.sessionId.split('_')[1]
    return parseInt(timestamp, 10)
  }
}

// Create global instance
const analytics = new Analytics()

// Expose to global scope
if (typeof window !== 'undefined') {
  ;(window as any).Analytics = analytics
}

export default analytics 