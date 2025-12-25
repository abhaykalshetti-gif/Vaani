# Environment Variables Configuration

## Quick Setup

### Step 1: Create Frontend Environment File

Create `.env.local` in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000
```

### Step 2: Create Backend Environment File

Create `.env` in the root directory:

```env
MONGO_URI=your_mongodb_connection_string_here
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for voice AI | - | Yes |
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` | No |

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | - | Yes |
| `PORT` | Backend server port | `5000` | No |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | - | No |

## How It Works

1. **Frontend** reads `VITE_API_URL` from `.env.local` and uses it in `services/storage.ts` to connect to the backend
2. **Backend** reads `MONGO_URI` from `.env` to connect to MongoDB
3. **Frontend** uses `GEMINI_API_KEY` for direct Gemini Live API calls

## Testing the Connection

1. Start backend: `npm run dev:backend` (or `node server.js`)
2. Start frontend: `npm run dev`
3. Check browser console for API connection status
4. Backend should show: `✅ Connected to MongoDB Atlas` and `🚀 Server running on http://localhost:5000`

