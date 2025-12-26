# AI SmartScreener

An AI-powered stock screening platform built with React, AWS Amplify Gen 2, and Polygon.io API.

## Features

- **Dual-Method AI Screening**: Two parallel screening methods validate each other
  - Method 1: 3-step scanner (liquidity, catalyst, technical setup)
  - Method 2: 4-gate system (pre-market scan, technical confirmation, price action, risk check)
- **Filter Screening**: Find undervalued stocks and 100%+ upside opportunities
- **Trade Management**: Track open positions, closed trades, and performance metrics
- **AI Assistant**: Get trade analysis, position reviews, and market context
- **Admin Panel**: User management, access control, and screening parameters

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with glassmorphism design
- **Backend**: AWS Amplify Gen 2
  - Authentication: Amazon Cognito
  - Database: AWS AppSync + DynamoDB
  - Functions: AWS Lambda
  - Storage: Amazon S3
- **Data**: Polygon.io API for real-time stock data
- **State Management**: Zustand + React Query

## Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account with Amplify CLI configured
- Polygon.io API key

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd aismartscreener
npm install
```

### 2. Configure Amplify

```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Start the Amplify sandbox (local development)
npx ampx sandbox

# This will:
# - Deploy backend resources to your AWS account
# - Generate amplify_outputs.json with your configuration
# - Watch for changes and hot-reload
```

### 3. Set Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your Polygon API key:

```
VITE_POLYGON_API_KEY=your_polygon_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
aismartscreener/
├── amplify/                    # Amplify backend
│   ├── auth/                   # Cognito configuration
│   │   └── resource.ts
│   ├── data/                   # GraphQL schema
│   │   └── resource.ts
│   ├── storage/                # S3 configuration
│   │   └── resource.ts
│   ├── functions/              # Lambda functions
│   │   └── polygon-fetcher/
│   ├── jobs/                   # Scheduled Lambda jobs
│   │   ├── method1-screener/
│   │   ├── method2-screener/
│   │   ├── results-combiner/
│   │   ├── filter-screener/
│   │   ├── market-scanner/
│   │   └── stock-analyzer/
│   ├── backend.ts              # Backend definition
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── app/                    # App shell
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Glass UI components
│   │   ├── layout/             # Layout components
│   │   ├── forms/              # Form components
│   │   └── auth/               # Auth guards
│   ├── features/               # Feature modules
│   │   ├── landing/            # Home page
│   │   ├── auth/               # Login, Register
│   │   ├── dashboard/          # Main dashboard
│   │   ├── ai-screener/        # AI screening results
│   │   ├── filter-screener/    # Filter-based screening
│   │   ├── trades/             # Trade management
│   │   ├── history/            # Trade history
│   │   ├── ai-assistant/       # AI chat assistant
│   │   ├── admin/              # Admin panel
│   │   ├── settings/           # User settings
│   │   └── profile/            # User profile
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── docs/                       # Documentation
│   ├── features/               # Feature specs
│   ├── architecture/           # Architecture docs
│   └── ui/                     # UI component docs
├── amplify.yml                 # CI/CD configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build

# Amplify
npx ampx sandbox      # Start Amplify sandbox
npx ampx sandbox delete  # Delete sandbox resources
npx ampx generate outputs  # Regenerate outputs
npx ampx pipeline-deploy   # Deploy to production
```

## Data Models

### AI Screening
- `Method1Stock` - Stocks passing Method 1 screening
- `Method2Stock` - Stocks passing Method 2 4-gate system
- `AIScreeningResult` - Combined results from both methods
- `FilteredStock` - Stocks from filter-based screening

### Trade Management
- `Trade` - Active trades
- `TradeHistory` - Closed trades

### User Management
- `UserAccess` - User permissions and access status
- `AccessRequest` - Access request submissions
- `ScreeningParameters` - Configurable screening parameters

### AI Assistant
- `Conversation` - Chat conversations
- `AIMessage` - Individual chat messages

## Screening Schedule (ET)

| Job | Time | Description |
|-----|------|-------------|
| Method 1 Screener | 9:30 AM | 3-step scan |
| Method 2 Screener | 9:35 AM | 4-gate validation |
| Results Combiner | 9:40 AM | Combine and rank |
| Filter Screener | 9:00 AM | Analyst target analysis |

## Deployment

### Production Deployment

1. Push to your connected Git branch
2. Amplify will automatically deploy via `amplify.yml`

Or manually:

```bash
npx ampx pipeline-deploy --branch main --app-id YOUR_APP_ID
```

### Environment Variables in Amplify Console

Set these in the Amplify Console → App settings → Environment variables:
- `POLYGON_API_KEY` - Your Polygon.io API key

## Documentation

See the `/docs` folder for detailed documentation:
- [System Overview](docs/architecture/SYSTEM_OVERVIEW.md)
- [AI Screening](docs/features/AI_SCREENING.md)
- [Trade Management](docs/features/TRADE_MANAGEMENT.md)
- [Admin Panel](docs/features/ADMIN.md)
- [UI Components](docs/ui/UI_OVERVIEW.md)

## License

Private - All rights reserved