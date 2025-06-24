(function(global) {
  'use strict';

  class Analytics {
    constructor() {
      this.sessionId = this.generateSessionId();
      this.config = {
        apiKey: '',
        endpoint: '',
        autoTrack: true,
        trackPageViews: true,
        trackClicks: true,
        trackForms: true,
        trackPerformance: true,
        debug: false,
      };
      this.isInitialized = false;
      this.userId = null;
    }

    /**
     * Initialize the Analytics SDK
     */
    init(apiKeyOrConfig) {
      if (typeof apiKeyOrConfig === 'string') {
        this.config.apiKey = apiKeyOrConfig;
      } else if (typeof apiKeyOrConfig === 'object') {
        Object.assign(this.config, apiKeyOrConfig);
      }

      if (!this.config.apiKey) {
        console.error('Analytics: API key is required');
        return;
      }

      // Set default endpoint if not provided
      if (!this.config.endpoint) {
        this.config.endpoint = this.getDefaultEndpoint();
      }

      this.isInitialized = true;

      if (this.config.debug) {
        console.log('Analytics initialized with config:', this.config);
      }

      // Auto-track events if enabled
      if (this.config.autoTrack) {
        this.setupAutoTracking();
      }

      // Track initial page view
      if (this.config.trackPageViews) {
        this.trackPageView();
      }

      // Track performance metrics
      if (this.config.trackPerformance) {
        this.trackPerformance();
      }
    }

    /**
     * Track a custom event
     */
    track(eventType, metadata) {
      if (!this.isInitialized) {
        console.warn('Analytics: SDK not initialized. Call Analytics.init() first.');
        return;
      }

      const event = {
        eventType: eventType,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        userId: this.userId,
        metadata: metadata || {}
      };

      this.sendEvent(event);
    }

    /**
     * Track a page view
     */
    trackPageView(url) {
      this.track('pageview', {
        url: url || window.location.href,
        title: document.title,
        path: window.location.pathname
      });
    }

    /**
     * Track a click event
     */
    trackClick(element, metadata) {
      const clickData = {
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className || undefined,
        text: element.textContent ? element.textContent.slice(0, 100) : undefined,
        href: element.href || undefined
      };

      if (metadata) {
        Object.assign(clickData, metadata);
      }

      this.track('click', clickData);
    }

    /**
     * Track a form submission
     */
    trackFormSubmission(form, metadata) {
      const formData = new FormData(form);
      const fields = {};
      let fieldCount = 0;

      // Extract form fields (but not sensitive data)
      for (const [key, value] of formData.entries()) {
        fieldCount++;
        // Skip sensitive fields
        if (!this.isSensitiveField(key)) {
          fields[key] = value;
        }
      }

      const submissionData = {
        formId: form.id || undefined,
        formName: form.name || undefined,
        action: form.action || undefined,
        method: form.method || 'get',
        fieldCount: fieldCount,
        fields: Object.keys(fields).length > 0 ? fields : undefined
      };

      if (metadata) {
        Object.assign(submissionData, metadata);
      }

      this.track('form_submission', submissionData);
    }

    /**
     * Set user ID for tracking
     */
    setUserId(userId) {
      this.userId = userId;
      if (this.config.debug) {
        console.log('Analytics: User ID set to', userId);
      }
    }

    /**
     * Clear user ID
     */
    clearUserId() {
      this.userId = null;
      if (this.config.debug) {
        console.log('Analytics: User ID cleared');
      }
    }

    /**
     * Track performance metrics
     */
    trackPerformance() {
      // Wait for page load
      if (document.readyState === 'complete') {
        this.collectPerformanceMetrics();
      } else {
        const self = this;
        window.addEventListener('load', function() {
          // Delay to ensure all metrics are available
          setTimeout(function() {
            self.collectPerformanceMetrics();
          }, 1000);
        });
      }
    }

    /**
     * Collect and send performance metrics
     */
    collectPerformanceMetrics() {
      if (!window.performance) return;

      const navigation = performance.getEntriesByType('navigation')[0];
      const performanceData = {};

      // Time to First Byte
      if (navigation) {
        performanceData.ttfb = navigation.responseStart - navigation.fetchStart;
      }

      // First Contentful Paint
      const paint = performance.getEntriesByType('paint');
      paint.forEach(function(entry) {
        if (entry.name === 'first-contentful-paint') {
          performanceData.fcp = entry.startTime;
        }
      });

      // Send basic performance data
      if (Object.keys(performanceData).length > 0) {
        this.track('performance', performanceData);
      }
    }

    /**
     * Setup automatic event tracking
     */
    setupAutoTracking() {
      const self = this;

      // Track clicks
      if (this.config.trackClicks) {
        document.addEventListener('click', function(event) {
          if (event.target) {
            self.trackClick(event.target);
          }
        });
      }

      // Track form submissions
      if (this.config.trackForms) {
        document.addEventListener('submit', function(event) {
          if (event.target) {
            self.trackFormSubmission(event.target);
          }
        });
      }

      // Track page visibility changes
      document.addEventListener('visibilitychange', function() {
        self.track('page_visibility', {
          visible: !document.hidden,
          visibilityState: document.visibilityState
        });
      });

      // Track beforeunload (page exit)
      window.addEventListener('beforeunload', function() {
        self.track('page_exit', {
          timeOnPage: Date.now() - self.getSessionStartTime()
        });
      });
    }

    /**
     * Send event to analytics endpoint
     */
    sendEvent(event) {
      const self = this;
      const payload = Object.assign({ apiKey: this.config.apiKey }, event);

      // Use fetch if available, otherwise fallback to XMLHttpRequest
      if (window.fetch) {
        fetch(this.config.endpoint + '/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        .then(function(response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          if (self.config.debug) {
            console.log('Analytics: Event sent successfully', event);
          }
        })
        .catch(function(error) {
          if (self.config.debug) {
            console.error('Analytics: Failed to send event', error, event);
          }
        });
      } else {
        // Fallback for older browsers
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.config.endpoint + '/api/analytics/track');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              if (self.config.debug) {
                console.log('Analytics: Event sent successfully', event);
              }
            } else {
              if (self.config.debug) {
                console.error('Analytics: Failed to send event', xhr.status, event);
              }
            }
          }
        };
        xhr.send(JSON.stringify(payload));
      }
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get the default endpoint based on current domain
     */
    getDefaultEndpoint() {
      // In production, this would be your actual domain
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:3002';
      }
      // Default to your production domain
      return 'https://zero-point-labs-dasboard.vercel.app';
    }

    /**
     * Check if a form field is sensitive and should not be tracked
     */
    isSensitiveField(fieldName) {
      const sensitiveFields = [
        'password',
        'confirm_password',
        'credit_card',
        'creditcard',
        'ccnumber',
        'cvv',
        'ssn',
        'social_security'
      ];
      
      return sensitiveFields.some(function(sensitive) {
        return fieldName.toLowerCase().indexOf(sensitive) !== -1;
      });
    }

    /**
     * Get session start time
     */
    getSessionStartTime() {
      // Extract timestamp from session ID
      const timestamp = this.sessionId.split('_')[1];
      return parseInt(timestamp, 10);
    }
  }

  // Create global instance
  const analytics = new Analytics();

  // Expose to global scope
  if (typeof window !== 'undefined') {
    window.Analytics = analytics;
  }

  // Support for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = analytics;
  }

})(this); 