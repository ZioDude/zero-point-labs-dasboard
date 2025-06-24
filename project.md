# Client Analytics Dashboard Platform

## Project Overview
A multi-tenant SaaS platform that allows web development clients to access analytics, form submissions, and performance metrics for their website deployed on Vercel. Each client account is connected to one website.

## Tech Stack

### Frontend Dashboard
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Authentication**: NextAuth.js v5 (Auth.js)
- **State Management**: Zustand (for complex state) / React Query for server state
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Authentication Provider**: Supabase Auth
- **File Storage**: Supabase Storage (for exports, etc.)
- **Email**: Resend

### Analytics SDK
- **Language**: Vanilla JavaScript/TypeScript
- **Bundle**: Rollup for minimal size
- **Features**: Event tracking, form capture, performance monitoring

### Deployment & Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry

## Project Structure 
├── README.md
├── next.config.js
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── prisma/
│ ├── schema.prisma
│ └── migrations/
├── src/
│ ├── app/
│ │ ├── (auth)/
│ │ │ ├── login/
│ │ │ └── register/
│ │ ├── (dashboard)/
│ │ │ ├── analytics/
│ │ │ ├── forms/
│ │ │ ├── settings/
│ │ │ └── team/
│ │ ├── api/
│ │ │ ├── analytics/
│ │ │ ├── auth/
│ │ │ └── forms/
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── ui/ (shadcn components)
│ │ ├── charts/
│ │ ├── forms/
│ │ └── layout/
│ ├── lib/
│ │ ├── auth.ts
│ │ ├── db.ts
│ │ ├── supabase.ts
│ │ └── utils.ts
│ ├── hooks/
│ ├── types/
│ └── store/
├── analytics-sdk/
│ ├── src/
│ │ ├── index.ts
│ │ ├── tracker.ts
│ │ └── types.ts
│ ├── dist/
│ ├── package.json
│ └── rollup.config.js
└── docs/
├── integration-guide.md
└── api-reference.md

## Database Schema (Supabase/PostgreSQL)

### Core Tables

```sql
-- Clients (Organizations)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Users (Team members)
CREATE TABLE client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website (One per client)
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- pageview, click, custom
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  session_id VARCHAR(255),
  user_id VARCHAR(255), -- anonymous or identified
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  form_name VARCHAR(255),
  fields JSONB NOT NULL,
  page_url TEXT,
  ip_address INET,
  user_agent TEXT,
  is_spam BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- lcp, fid, cls, ttfb
  value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Core Features

### 1. Authentication & Multi-tenancy
- [ ] Client registration/login
- [ ] Team member management
- [ ] Role-based access control
- [ ] API key generation for the website

### 2. Website Management
- [ ] Configure website details
- [ ] Generate tracking code
- [ ] Domain verification
- [ ] Active/inactive status

### 3. Analytics Dashboard
- [ ] Real-time visitor count
- [ ] Page views over time
- [ ] Top pages
- [ ] Referrer analysis
- [ ] Geographic data
- [ ] Device/browser breakdown
- [ ] Session duration
- [ ] Bounce rate

### 4. Form Management
- [ ] Form submission tracking
- [ ] Lead management interface
- [ ] Export capabilities (CSV/Excel)
- [ ] Spam filtering
- [ ] Email notifications
- [ ] Form field mapping

### 5. Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] Page load times
- [ ] Performance scoring
- [ ] Trend analysis

### 6. Reporting & Exports
- [ ] PDF reports
- [ ] Scheduled email reports
- [ ] Data export functionality
- [ ] Custom date ranges

## Implementation Steps

### Phase 1: Foundation (Week 1)
1. [x] Initialize Next.js 14 project with TypeScript
2. [x] Set up Tailwind CSS and shadcn/ui
3. [x] Configure Supabase connection
4. [x] Set up Prisma with Supabase
5. [x] Create database schema and run migrations
6. [ ] Implement basic authentication with NextAuth.js + Supabase

### Phase 2: Core Dashboard (Week 2)
7. [x] Create dashboard layout components
8. [x] Implement client/website management (modified for single website)
9. [ ] Build API key generation system
10. [x] Create basic analytics data models
11. [ ] Implement multi-tenant middleware

### Phase 3: Analytics SDK (Week 3)
12. [ ] Create analytics SDK package
13. [ ] Implement event tracking
14. [ ] Add form submission capture
15. [ ] Build performance monitoring
16. [ ] Create integration documentation

### Phase 4: Analytics Dashboard (Week 4)
17. [x] Build analytics visualization components
18. [ ] Implement real-time data display
19. [ ] Create filtering and date range selection
20. [ ] Add geographic and device analytics

### Phase 5: Form Management (Week 5)
21. [x] Build form submissions interface
22. [ ] Implement lead management features
23. [ ] Add export functionality
24. [ ] Create spam filtering system
25. [ ] Set up email notifications

### Phase 6: Advanced Features (Week 6)
26. [ ] Add performance monitoring dashboard
27. [ ] Implement reporting system
28. [ ] Create PDF export functionality
29. [x] Add team management features
30. [x] Build settings integration

### Phase 7: Polish & Deploy (Week 7)
31. [ ] Optimize performance and bundle size
32. [ ] Add error handling and monitoring
33. [ ] Create comprehensive documentation
34. [ ] Deploy to Vercel
35. [ ] Set up monitoring and alerts

## Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""

# Email
RESEND_API_KEY=""

# Analytics
NEXT_PUBLIC_APP_URL=""
```

## Key Design Decisions

1. **Single Website per Client**: Each client account is connected to one website only
2. **API-first**: All dashboard features accessible via API
3. **Real-time**: Use Supabase real-time for live analytics
4. **Privacy-focused**: GDPR compliant data collection
5. **Embeddable**: SDK works with any website framework
6. **Scalable**: Designed to handle high-traffic websites

## Success Metrics

- **Technical**: Sub 200ms API response times, 99.9% uptime
- **Business**: Client retention, feature adoption rates
- **User Experience**: Dashboard load times under 2 seconds

---

**Next Steps**: Continue with Phase 1 implementation, focusing on authentication and the analytics SDK.
