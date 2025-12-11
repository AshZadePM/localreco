# Restaurant Aggregation App

This project consists of a React frontend and a Node/Express backend with a restaurant aggregation API that searches Reddit for restaurant mentions and enriches them with sentiment analysis and Google Maps data.

## Features

- **Restaurant Search**: Search Reddit for restaurant discussions across multiple subreddits
- **Sentiment Analysis**: Analyze sentiment of restaurant mentions using NLP
- **Google Maps Integration**: Enrich results with Google Maps place URLs
- **Caching & Throttling**: Respect API limits with intelligent caching and rate limiting
- **Comprehensive Testing**: Unit tests for all data processing pipelines

## Structure

- `frontend/`: React + Vite + TypeScript + TailwindCSS
- `backend/`: Node + Express + TypeScript with REST API

## Prerequisites

- Node.js (v18+)
- npm

## Setup

1. Install dependencies for the root and workspaces:
   ```bash
   npm install
   ```

2. Environment Variables:
   - Copy `backend/.env.example` to `backend/.env` and fill in the values.
     - **REDDIT_CLIENT_ID**: Register an app at https://www.reddit.com/prefs/apps
     - **REDDIT_CLIENT_SECRET**: From your Reddit app registration
     - **GOOGLE_MAPS_API_KEY**: Get from https://developers.google.com/maps
   - Copy `frontend/.env.example` to `frontend/.env` and fill in the values.

## Running Development Server

**Option 1: Docker Compose**

```bash
docker-compose up --build
```

**Option 2: Manual**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## API Documentation

See [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete API documentation.

### Main Endpoint

**POST /api/search** or **GET /api/search**

Search for restaurants in a city with a given query.

Example:
```bash
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"city": "New York", "query": "pizza"}'
```

Response includes:
- Restaurant names with sentiment analysis
- Sentiment scores and labels (positive/neutral/negative)
- Mention counts
- Google Maps URLs
- Source tracking

## Testing

Run all tests with coverage:
```bash
npm test
```

Run backend tests only:
```bash
cd backend
npm test
```

## Linting & Formatting

Run from the root directory:

```bash
npm run lint
npm run format
```

## Building

Build all packages:
```bash
npm run build
```

## Health Check

The frontend calls `/api/health` on the backend. Open http://localhost:3000 to see the status.
