# VoiceAgent Project Setup Guide

## Project Overview

This is a Voice AI Agent application (Vaani) with:
- **Frontend**: React + TypeScript + Vite (Port 3000)
- **Backend**: Express.js + MongoDB (Port 5000)
- **AI Service**: Google Gemini Live API

## Environment Variables Setup

### Frontend Environment Variables (.env.local)

Create a `.env.local` file in the root directory with:

```env
# Gemini API Key for voice AI functionality
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (default: http://localhost:5000)
VITE_API_URL=http://localhost:5000
```

### Backend Environment Variables (.env)

Create a `.env` file in the root directory with:

```env
# MongoDB Atlas Connection String
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGO_URI=your_mongodb_connection_string_here

# Server Port (default: 5000)
PORT=5000

# Optional: Gemini API Key (if needed by backend)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Installation Steps

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

The backend requires additional packages. Install them:

```bash
npm install express mongoose cors dotenv
```

### 3. Configure Environment Variables

1. **Frontend**: Create `.env.local` file with your `GEMINI_API_KEY` and `VITE_API_URL`
2. **Backend**: Create `.env` file with your `MONGO_URI` and `PORT`

### 4. Start the Application

#### Option A: Run Both Separately

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Option B: Add npm scripts (Recommended)

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:frontend": "vite",
    "dev:backend": "node server.js",
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Then install concurrently:
```bash
npm install --save-dev concurrently
```

Run both with:
```bash
npm run dev:all
```

## Project Structure

```
VoiceAgent/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Session.tsx
│   ├── ReportView.tsx
│   ├── AdminPanel.tsx
│   └── Visualizer.tsx
├── services/           # Service layer
│   ├── geminiLive.ts   # Gemini Live API integration
│   ├── storage.ts      # API calls to backend
│   └── analysis.ts
├── utils/              # Utility functions
│   └── audio.ts
├── App.tsx             # Main app component
├── server.js           # Express backend server
├── vite.config.ts      # Vite configuration
└── types.ts            # TypeScript type definitions
```

## API Endpoints

The backend provides the following endpoints:

- `GET /api/agents` - Get all agents
- `POST /api/agents` - Save/update an agent
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Save/update a session

## Connection Flow

1. **Frontend** (Port 3000) → Makes API calls to **Backend** (Port 5000)
2. **Backend** (Port 5000) → Connects to **MongoDB Atlas**
3. **Frontend** → Uses **Gemini API** directly for voice interactions

## Troubleshooting

### Backend not connecting
- Ensure MongoDB connection string is correct in `.env`
- Check that backend is running on port 5000
- Verify CORS is enabled in server.js

### Frontend can't reach backend
- Check `VITE_API_URL` in `.env.local` matches backend port
- Ensure backend server is running
- Check browser console for CORS errors

### Gemini API errors
- Verify `GEMINI_API_KEY` is set correctly in `.env.local`
- Check API key has proper permissions
- Ensure network allows WebSocket connections (for Gemini Live)

## Next Steps

1. Set up your MongoDB Atlas cluster
2. Get your Gemini API key from Google AI Studio
3. Create the environment files with your credentials
4. Start both servers and test the connection

