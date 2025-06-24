# Analytics Integration Guide

## Quick Start

To start tracking analytics on your website, add the following script just before the closing `</body>` tag in your HTML:

```html
<script src="http://localhost:3000/analytics.js"></script>
<script>
  Analytics.init('YOUR_API_KEY');
</script>
```

Replace `YOUR_API_KEY` with the API key from your dashboard.

## Integration Methods

### 1. Next.js App Router

Add to your root layout (`app/layout.tsx`):

```tsx
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script 
          src="http://localhost:3000/analytics.js" 
          strategy="afterInteractive" 
        />
        <Script id="analytics-init" strategy="afterInteractive">
          {`Analytics.init('YOUR_API_KEY');`}
        </Script>
      </body>
    </html>
  )
}
```

### 2. Next.js Pages Router

Add to your custom `_app.tsx`:

```tsx
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script 
        src="http://localhost:3000/analytics.js" 
        strategy="afterInteractive" 
      />
      <Script id="analytics-init" strategy="afterInteractive">
        {`Analytics.init('YOUR_API_KEY');`}
      </Script>
    </>
  )
}
```

### 3. Plain HTML

Add before the closing `</body>` tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your content -->
  
  <script src="http://localhost:3000/analytics.js"></script>
  <script>
    Analytics.init('YOUR_API_KEY');
  </script>
</body>
</html>
```

### 4. React (Create React App)

Add to your `public/index.html`:

```html
<script src="http://localhost:3000/analytics.js"></script>
<script>
  Analytics.init('YOUR_API_KEY');
</script>
```

## What Gets Tracked

Once integrated, the analytics SDK automatically tracks:

- **Page Views**: Every page navigation
- **Session Data**: User sessions and duration
- **Device Info**: Browser, OS, device type
- **Referrers**: Where visitors come from
- **Geography**: Country and city (based on IP)

## Custom Events (Coming Soon)

```javascript
// Track custom events
Analytics.track('button_click', {
  button: 'signup',
  location: 'header'
});

// Track form submissions
Analytics.trackForm('contact-form', {
  form_name: 'Contact Us'
});
```

## Troubleshooting

1. **No data showing**: 
   - Check that the API key is correct
   - Ensure the script is loading (check Network tab)
   - Verify your domain matches the configured domain

2. **CORS errors**:
   - Make sure your domain is in the allowed domains list
   - Check that the analytics server is running

3. **Script not loading**:
   - Verify the analytics server URL is correct
   - Check for content blockers or ad blockers

## Privacy & GDPR

The analytics system is designed to be privacy-friendly:
- No cookies are used
- No personal data is collected
- IP addresses are anonymized
- Fully GDPR compliant

## Need Help?

- Check the dashboard for real-time data
- View the browser console for any errors
- Contact support if issues persist 