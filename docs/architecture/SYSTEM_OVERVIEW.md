# AI Smart Screener - System Architecture Overview

## 1. Executive Summary

AI Smart Screener is a comprehensive stock trading web application that combines AI-powered stock identification with rule-based filtering to help day traders identify high-potential trading opportunities. The system uses React for the frontend and AWS Amplify Gen 2 with Amplify AI Kit for the backend.

### Key Features
- **Dual-Method AI Screening**: Two parallel screening methods (Scanner-Based + GATE System) for maximum accuracy
- **Filter-Based Screening**: Rule-based queries for High Upside and Undervalued stocks
- **Trade Management**: Manual trade journaling with P&L tracking
- **AI Assistant**: Claude-powered trade analysis and review
- **Admin System**: Granular user access control and screening parameter configuration
- **Glassmorphism UI**: Modern, professional trading interface

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Frontend (Vite + TailwindCSS)               │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │Landing   │ │Dashboard │ │AI Screen │ │Filter    │ │Trade     │   │    │
│  │  │Page      │ │Module    │ │+ Pipeline│ │Screener  │ │Manager   │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                             │    │
│  │  │AI        │ │Trade     │ │Admin     │                             │    │
│  │  │Assistant │ │History   │ │Panel     │                             │    │
│  │  └──────────┘ └──────────┘ └──────────┘                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AWS AMPLIFY GEN 2 LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Amplify Auth  │  │  Amplify Data   │  │ Amplify Storage │             │
│  │   (Cognito)     │  │  (AppSync)      │  │    (S3)         │             │
│  │   + User Groups │  │  + 12 Models    │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                    AMPLIFY AI KIT                            │           │
│  │  ┌─────────────────────┐  ┌─────────────────────┐           │           │
│  │  │ tradeAssistant      │  │  generateFiltered   │           │           │
│  │  │ tradeReviewer       │  │  validateTrade      │           │           │
│  │  └─────────────────────┘  └─────────────────────┘           │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                  AMPLIFY FUNCTIONS (Lambda)                  │           │
│  │  ┌──────────────────────────────────────────────────────┐   │           │
│  │  │  METHOD 1: Scanner-Based    │  METHOD 2: GATE System │   │           │
│  │  │  ├─ step1-scan (8:45 AM)    │  ├─ gate1 (8:45 AM)    │   │           │
│  │  │  ├─ step2-news (9:15 AM)    │  ├─ gate2 (9:25 AM)    │   │           │
│  │  │  └─ step3-tech (9:35 AM)    │  ├─ gate3 (9:35-11 AM) │   │           │
│  │  │                              │  └─ gate4 (event)      │   │           │
│  │  ├──────────────────────────────┼──────────────────────────┤   │           │
│  │  │           intersection-combiner (finds common stocks)   │   │           │
│  │  └──────────────────────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES LAYER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Amazon Bedrock │  │   Polygon.io    │  │    DynamoDB     │             │
│  │  (Claude LLM)   │  │   Market Data   │  │  (Data Store)   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dual-Method AI Screening Architecture

The AI Screening system uses **two parallel methods** that run simultaneously, with stocks that pass BOTH methods receiving the highest priority.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DUAL-METHOD SCREENING PIPELINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│  │      METHOD 1: SCANNER      │    │      METHOD 2: 4-GATE       │        │
│  │    (Runs 3 steps, LOCKS)    │    │    (Continuous monitoring)   │        │
│  ├─────────────────────────────┤    ├─────────────────────────────┤        │
│  │                             │    │                             │        │
│  │  8:45 AM  Pre-Market Scan   │    │  8:45 AM  Gate 1: Universe  │        │
│  │           ↓                 │    │           ↓                 │        │
│  │  9:15 AM  AI News Scoring   │    │  9:25 AM  Gate 2: Technical │        │
│  │           ↓                 │    │           ↓                 │        │
│  │  9:35 AM  Technical Filter  │    │  9:35 AM  Gate 3: Execution │        │
│  │           ⚠️ LOCKS          │    │    ↓ (every 5 min → 11 AM)  │        │
│  │                             │    │  On Pass  Gate 4: Risk      │        │
│  │  Result: Method1Stock[]     │    │                             │        │
│  │                             │    │  Result: Method2Stock[]     │        │
│  └──────────────┬──────────────┘    └──────────────┬──────────────┘        │
│                 │                                   │                        │
│                 └───────────────┬───────────────────┘                        │
│                                 │                                            │
│                                 ▼                                            │
│                  ┌──────────────────────────────┐                           │
│                  │    INTERSECTION COMBINER     │                           │
│                  │   (Runs 9:35 AM - 11:00 AM)  │                           │
│                  │                              │                           │
│                  │  Stocks in BOTH methods get  │                           │
│                  │  priority as A+ quality      │                           │
│                  │                              │                           │
│                  │  Result: AIScreeningResult[] │                           │
│                  └──────────────────────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Lambda Schedule Reference

| Function | ET Time | Frequency | Description |
|----------|---------|-----------|-------------|
| `method1-step1-scan` | 8:45 AM | Once | Pre-market scan (vol, gap, ATR) |
| `method1-step2-news` | 9:15 AM | Once | AI news scoring |
| `method1-step3-technical` | 9:35 AM | Once | Technical filter - **LOCKS M1** |
| `method2-gate1` | 8:45 AM | Once | Pre-market universe |
| `method2-gate2` | 9:25 AM | Once | Technical alignment |
| `method2-gate3` | 9:35-11:00 AM | Every 5 min (17×) | Execution filter |
| `method2-gate4` | On G3 pass | Event-driven | Risk validation |
| `intersection-combiner` | 9:35-11:00 AM | Every 5 min (17×) | Find common stocks |

---

## 4. User Access Control Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ACCESS STATE MACHINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              ┌─────────────┐                                 │
│                              │   VISITOR   │                                 │
│                              │ (no account)│                                 │
│                              └──────┬──────┘                                 │
│                                     │                                        │
│                              Submit Request                                  │
│                                     │                                        │
│                                     ▼                                        │
│                              ┌─────────────┐                                 │
│                              │   PENDING   │◄───────────────────┐           │
│                              │  (waiting)  │                     │           │
│                              └──────┬──────┘                     │           │
│                                     │                            │           │
│                    ┌────────────────┼────────────────┐          │           │
│                    │                │                │          │           │
│                Approve            Reject         Ignore          │           │
│                    │                │                │          │           │
│                    ▼                ▼                │          │           │
│             ┌─────────────┐  ┌─────────────┐        │          │           │
│             │  APPROVED   │  │  REJECTED   │────────┘          │           │
│             │  (active)   │  │  (denied)   │  Can reapply      │           │
│             └──────┬──────┘  └─────────────┘  after 30 days    │           │
│                    │                                            │           │
│                 Revoke                                          │           │
│                    │                                            │           │
│                    ▼                                            │           │
│             ┌─────────────┐                                     │           │
│             │   REVOKED   │─────────────────────────────────────┘           │
│             │  (blocked)  │  Admin can re-approve                           │
│             └─────────────┘                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Feature Permission System

| Feature ID | Name | Description |
|-----------|------|-------------|
| `dashboard` | Dashboard | Main dashboard (always included) |
| `ai_screener` | AI Screener Results | View AI-generated picks |
| `ai_screener_pipeline` | Pipeline View | View screening stages |
| `filter_screener` | Filter Screener | Custom filter screening |
| `filter_high_upside` | High Upside | 100%+ upside stocks |
| `filter_undervalued` | Undervalued | Below analyst targets |
| `suggestions` | Trade Suggestions | AI-recommended setups |
| `open_trades` | Open Trades | Track active positions |
| `trade_history` | Trade History | View closed trades |
| `trade_assistant` | Trade Assistant | AI chat for analysis |
| `trade_reviewer` | Trade Reviewer | AI review of performance |

### Permission Presets

| Preset | Features Included |
|--------|-------------------|
| `FULL_ACCESS` | All 11 features |
| `DASHBOARD_ONLY` | Dashboard only |
| `SCREENING_ONLY` | Dashboard + AI/Filter screening (6 features) |
| `TRADING_ONLY` | Dashboard + Trading features (4 features) |
| `BASIC` | Dashboard + AI Screener + Open Trades + History |
| `CUSTOM` | Admin-selected features |

---

## 5. Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool | 5.x |
| TailwindCSS | Styling + Glassmorphism | 3.x |
| React Query | Server State | 5.x |
| Zustand | Client State | 4.x |
| React Router | Navigation | 6.x |
| react-financial-charts | Stock Charts | Latest |
| Recharts | General Charts | 2.x |
| Sonner | Toast notifications | Latest |

### Backend (AWS Amplify Gen 2)
| Service | Purpose |
|---------|---------|
| Amplify Auth (Cognito) | User authentication, groups (admin/trader/viewer) |
| Amplify Data (AppSync + DynamoDB) | Real-time GraphQL API & 12 data models |
| Amplify AI Kit | AI routes with Amazon Bedrock |
| Amplify Functions (Lambda) | 8 scheduled functions + utilities |
| Amplify Storage (S3) | File storage |
| EventBridge | Scheduled function triggers |

### External APIs
| API | Purpose | Plan |
|-----|---------|------|
| Polygon.io | Stock market data | Starter ($29/mo) |
| Amazon Bedrock | LLM inference (Claude 3.5 Sonnet) | Pay-per-use |

---

## 6. Data Models Summary

| Category | Model | Description |
|----------|-------|-------------|
| **AI Screening** | Method1Stock | Scanner-based results |
| | Method2Stock | GATE system results |
| | AIScreeningResult | Intersection (final results) |
| **Filter Screening** | FilterCriteria | User-defined filter rules |
| | FilteredStock | Filter screening results |
| **Trade Management** | SuggestedStock | Suggestions from filters |
| | Trade | User's logged trades |
| | TradeHistory | Closed trades for analytics |
| **Admin** | UserAccess | User permissions & access |
| | AccessRequest | Pending access requests |
| | ScreeningParameters | Admin-configurable values |
| **Utility** | UserPreferences | User settings |

---

## 7. Data Flow Architecture

### 7.1 AI Screening Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  EventBridge │────▶│ Method 1 & 2 │────▶│  Polygon.io  │
│  Scheduler   │     │   Lambdas    │     │     API      │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Bedrock    │
                     │   Claude     │
                     └──────────────┘
                            │
                            ▼
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       ┌──────────────┐           ┌──────────────┐
       │ Method1Stock │           │ Method2Stock │
       └──────────────┘           └──────────────┘
              │                           │
              └───────────┬───────────────┘
                          ▼
                   ┌──────────────┐
                   │  Combiner    │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │AIScreening   │
                   │Result        │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐     ┌──────────────┐
                   │  AppSync     │────▶│    React     │
                   │ Subscription │     │   Frontend   │
                   └──────────────┘     └──────────────┘
```

### 7.2 Trade Management Flow
```
User Action ──▶ React UI ──▶ AppSync Mutation ──▶ DynamoDB (Trade)
                                    │
                                    ▼
                            AppSync Subscription
                                    │
                                    ▼
                              All Connected Clients
```

### 7.3 Access Request Flow
```
Visitor ──▶ Landing Page ──▶ Request Access Form
                                    │
                                    ▼
                            AccessRequest (PENDING)
                                    │
                                    ▼
                            Admin Reviews in Panel
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
               Approve          Reject          Ignore
                    │               │
                    ▼               ▼
            UserAccess          Rejection Email
            Created             (Can reapply)
```

---

## 8. Security Architecture

### 8.1 Authentication Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▶│  Cognito │────▶│   JWT    │
│  Login   │     │   Auth   │     │  Tokens  │
└──────────┘     └──────────┘     └──────────┘
                                        │
                                        ▼
                               ┌──────────────┐
                               │   AppSync    │
                               │   (Verify)   │
                               └──────────────┘
```

### 8.2 Authorization Rules

| Access Level | Description |
|--------------|-------------|
| **Public** | Landing page, access request form |
| **Authenticated** | Pending approval page only |
| **Approved** | Platform access based on permissions |
| **Admin** | Full platform + Admin panel |

| Model | Owner | Authenticated | Admin |
|-------|-------|---------------|-------|
| Trade | Full CRUD | - | - |
| TradeHistory | Full CRUD | - | - |
| Method1Stock | - | Read | Full CRUD |
| Method2Stock | - | Read | Full CRUD |
| AIScreeningResult | - | Read | Full CRUD |
| UserAccess | Read own | - | Full CRUD |
| AccessRequest | Create | - | Read, Update, Delete |
| ScreeningParameters | - | Read | Full CRUD |

---

## 9. Route Structure

### Public Routes
| Route | Component | Access |
|-------|-----------|--------|
| `/` | HomePage | Everyone |
| `/login` | LoginPage | Everyone |
| `/request-access` | RequestAccessPage | Everyone |
| `/pending-approval` | PendingApprovalPage | Authenticated (pending) |

### Protected Routes (`/app/*`)
| Route | Component | Permission Required |
|-------|-----------|-------------------|
| `/app` | DashboardPage | `dashboard` |
| `/app/ai-screener` | AIScreenerPage | `ai_screener` |
| `/app/ai-screener/pipeline` | PipelinePage | `ai_screener_pipeline` |
| `/app/filter-screener/high-upside` | HighUpsidePage | `filter_high_upside` |
| `/app/filter-screener/undervalued` | UndervaluedPage | `filter_undervalued` |
| `/app/suggestions` | SuggestionsPage | `suggestions` |
| `/app/trades` | OpenTradesPage | `open_trades` |
| `/app/history` | TradeHistoryPage | `trade_history` |
| `/app/assistant` | TradeAssistantPage | `trade_assistant` |
| `/app/reviewer` | TradeReviewerPage | `trade_reviewer` |

### Admin Routes (`/admin/*`)
| Route | Component | Access |
|-------|-----------|--------|
| `/admin` | AdminDashboardPage | Admin only |
| `/admin/access-requests` | AccessRequestsPage | Admin only |
| `/admin/users` | UserManagementPage | Admin only |
| `/admin/parameters` | ScreeningParametersPage | Admin only |

---

## 10. Scalability Considerations

### Frontend
- Code splitting with React.lazy()
- Virtual scrolling for large lists
- Memoization with useMemo/useCallback
- Service workers for caching

### Backend
- DynamoDB on-demand scaling
- Lambda concurrent execution
- AppSync automatic scaling
- CloudFront CDN for static assets

---

## 11. Development Workflow

```
Developer ──▶ Local Code ──▶ npx ampx sandbox ──▶ Personal Cloud Sandbox
                                                          │
                                                          ▼
                                                   Test & Iterate
                                                          │
                                                          ▼
                                              Git Push to Feature Branch
                                                          │
                                                          ▼
                                              PR Preview Environment
                                                          │
                                                          ▼
                                              Merge to Main ──▶ Production
```

---

## 12. Monitoring & Observability

| Tool | Purpose |
|------|---------|
| CloudWatch Logs | Function logging |
| CloudWatch Metrics | Performance metrics |
| X-Ray | Distributed tracing |
| Amplify Console | Deployment monitoring |

---

## 13. Cost Estimation (Monthly)

| Service | Estimated Cost |
|---------|---------------|
| Polygon.io Starter | $29 |
| Amplify Hosting | $5-20 |
| Lambda (8 functions) | $5-15 |
| DynamoDB (12 tables) | $5-25 |
| Bedrock (Claude 3.5 Sonnet) | $20-100 |
| AppSync | $5-15 |
| **Total** | **$69-204** |

*Costs vary based on usage. Bedrock costs depend on AI prompt volume.*
