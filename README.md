# App Stack Scaffold

This project consists of a React frontend and a Node/Express backend.

## Structure

- `frontend/`: React + Vite + TypeScript + TailwindCSS
- `backend/`: Node + Express + TypeScript

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

## Linting & Formatting

Run from the root directory:

```bash
npm run lint
npm run format
```

## Health Check

The frontend calls `/api/health` on the backend. Open http://localhost:3000 to see the status.
