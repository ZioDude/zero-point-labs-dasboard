# Analytics SDK Documentation

A lightweight, easy-to-use analytics SDK for tracking user behavior on websites.

## Features

- 📊 **Automatic Page View Tracking** - Track when users visit pages
- 🖱️ **Click Tracking** - Monitor user interactions with elements
- 📝 **Form Submission Tracking** - Capture form data (privacy-safe)
- ⚡ **Performance Metrics** - Web Vitals and load times
- 👤 **User Identification** - Link events to specific users
- 🔒 **Privacy-First** - Filters out sensitive form fields
- 🚀 **Lightweight** - Minimal impact on page load
- 🌐 **Cross-Browser** - Works on all modern browsers

## Quick Start

### 1. Include the SDK

Add this script tag to your HTML `<head>`:

```html
<script src="https://your-analytics-domain.vercel.app/analytics.js"></script>
```

### 2. Initialize

```javascript
// Simple initialization with API key
Analytics.init('your-api-key-here');

// Or with full configuration
Analytics.init({
  apiKey: 'your-api-key-here',
  debug: false,
  trackPageViews: true,
  trackClicks: true,
  trackForms: true,
  trackPerformance: true
});
```

That's it! The SDK will automatically start tracking user interactions.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | **required** | Your unique API key from the dashboard |
| `endpoint` | string | auto-detected | Analytics server endpoint |
| `autoTrack` | boolean | `true` | Enable automatic event tracking |
| `trackPageViews` | boolean | `true` | Track page views automatically |
| `trackClicks` | boolean | `true` | Track click events automatically |
| `trackForms` | boolean | `true` | Track form submissions automatically |
| `trackPerformance` | boolean | `true` | Track performance metrics |
| `debug` | boolean | `false` | Enable console logging for debugging |

## API Reference

### Analytics.init(config)

Initialize the Analytics SDK.

```javascript
// String API key
Analytics.init('ak_your_api_key_here');

// Full configuration object
Analytics.init({
  apiKey: 'ak_your_api_key_here',
  debug: true,
  endpoint: 'https://custom-endpoint.com'
});
```

### Analytics.track(eventType, metadata)

Track a custom event.

```javascript
Analytics.track('button_click', {
  button_name: 'Get Started',
  section: 'hero',
  user_type: 'visitor'
});
```

### Analytics.trackPageView(url)

Manually track a page view.

```javascript
// Track current page
Analytics.trackPageView();

// Track specific URL
Analytics.trackPageView('/custom-page');
```

### Analytics.setUserId(userId)

Associate events with a specific user.

```javascript
Analytics.setUserId('user_12345');
```

### Analytics.clearUserId()

Remove user association from future events.

```javascript
Analytics.clearUserId();
```

## Event Types

### Automatic Events

The SDK automatically tracks these events when enabled:

#### pageview
Triggered when a page loads or `trackPageView()` is called.

```json
{
  "eventType": "pageview",
  "metadata": {
    "url": "https://example.com/page",
    "title": "Page Title",
    "path": "/page"
  }
}
```

#### click
Triggered when users click on elements.

```json
{
  "eventType": "click",
  "metadata": {
    "tagName": "button",
    "id": "hero-cta",
    "className": "btn btn-primary",
    "text": "Get Started",
    "href": "https://example.com/signup"
  }
}
```

#### form_submission
Triggered when forms are submitted.

```json
{
  "eventType": "form_submission",
  "metadata": {
    "formId": "contact-form",
    "formName": "contact",
    "fieldCount": 3,
    "fields": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### performance
Triggered when performance metrics are collected.

```json
{
  "eventType": "performance",
  "metadata": {
    "ttfb": 245.6,
    "fcp": 892.3,
    "lcp": 1205.7
  }
}
```

#### page_visibility
Triggered when page visibility changes.

```json
{
  "eventType": "page_visibility",
  "metadata": {
    "visible": false,
    "visibilityState": "hidden"
  }
}
```

## Privacy & Security

### Sensitive Data Protection

The SDK automatically filters out sensitive form fields:
- `password`
- `credit_card` / `creditcard`
- `cvv`
- `ssn`
- `social_security`

### Data Collection

Only the following data is collected:
- Page URLs and titles
- Click targets (element type, ID, class)
- Form field names and values (excluding sensitive fields)
- Performance metrics
- User agent and referrer
- Session and user IDs (if set)

### GDPR Compliance

To comply with GDPR:

1. **Obtain consent** before initializing the SDK
2. **Provide opt-out** functionality
3. **Respect DNT headers** (implement in your backend)

```javascript
// Example consent implementation
if (userHasConsented()) {
  Analytics.init('your-api-key');
}

// Opt-out functionality
function optOut() {
  // Stop tracking new events
  Analytics.init = function() {}; // Disable initialization
}
```

## Advanced Usage

### Single Page Applications (SPA)

For SPAs, manually track route changes:

```javascript
// React Router example
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useAnalytics() {
  const location = useLocation();
  
  useEffect(() => {
    Analytics.trackPageView(window.location.href);
  }, [location]);
}
```

### E-commerce Tracking

Track e-commerce events:

```javascript
// Product view
Analytics.track('product_view', {
  product_id: 'PROD123',
  product_name: 'Cool T-Shirt',
  category: 'Clothing',
  price: 29.99
});

// Add to cart
Analytics.track('add_to_cart', {
  product_id: 'PROD123',
  quantity: 2,
  value: 59.98
});

// Purchase
Analytics.track('purchase', {
  transaction_id: 'TXN789',
  value: 59.98,
  currency: 'USD',
  items: [
    { product_id: 'PROD123', quantity: 2 }
  ]
});
```

### A/B Testing

Track experiment variations:

```javascript
Analytics.track('experiment_view', {
  experiment_id: 'header_test',
  variation: 'blue_header',
  user_segment: 'returning_visitor'
});
```

### Error Tracking

Track JavaScript errors:

```javascript
window.addEventListener('error', function(event) {
  Analytics.track('javascript_error', {
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno
  });
});
```

## Troubleshooting

### Events Not Appearing

1. **Check API Key**: Ensure your API key is correct
2. **Check Console**: Enable debug mode to see error messages
3. **Check Network**: Look for failed requests in Network tab
4. **Check CORS**: Ensure your domain is allowed

```javascript
// Enable debug mode
Analytics.init({
  apiKey: 'your-api-key',
  debug: true
});
```

### Performance Impact

The SDK is designed to have minimal performance impact:
- Gzipped size: ~8KB
- Async event sending
- No external dependencies
- Efficient event batching

### Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Support

For help and support:
- 📖 [Documentation](https://your-docs-site.com)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)
- 📧 [Email Support](mailto:support@your-domain.com)

## License

MIT License - see LICENSE file for details. 