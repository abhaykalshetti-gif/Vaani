# Frontend-Backend Connection Summary

## ✅ Changes Made

### 1. Fixed API URL Configuration
- **File**: `services/storage.ts`
- **Change**: Updated API URL from `http://localhost:3000/api` to use environment variable `VITE_API_URL` with fallback to `http://localhost:5000/api`
- **Impact**: Frontend now correctly connects to backend on port 5000

### 2. Backend Environment Variables
- **File**: `server.js`
- **Change**: Added support for `PORT` environment variable (defaults to 5000)
- **Impact**: Backend port is now configurable via `.env` file

### 3. Frontend Environment Configuration
- **File**: `vite.config.ts`
- **Change**: Added `envPrefix: 'VITE_'` to properly load VITE-prefixed environment variables
- **Impact**: Frontend can now read `VITE_API_URL` from `.env.local`

### 4. Package Dependencies
- **File**: `package.json`
- **Change**: Added backend dependencies (express, mongoose, cors, dotenv) and npm scripts
- **Impact**: All required packages are now listed in dependencies

## 🔌 Connection Architecture

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│   Frontend      │ ──────────────────────────> │    Backend      │
│   (Port 3000)   │ <────────────────────────── │   (Port 5000)   │
│                 │         JSON Response        │                 │
└─────────────────┘                             └─────────────────┘
         │                                              │
         │                                              │
         │ Gemini Live API (WebSocket)                 │ MongoDB Atlas
         │                                              │
         ▼                                              ▼
┌─────────────────┐                             ┌─────────────────┐
│  Gemini API     │                             │   MongoDB       │
│  (External)     │                             │   Database      │
└─────────────────┘                             └─────────────────┘
```

## 📝 Required Environment Files

### `.env.local` (Frontend)
```env
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:5000
```

### `.env` (Backend)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
```

## 🚀 How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment files:**
   - Create `.env.local` with your Gemini API key
   - Create `.env` with your MongoDB connection string

3. **Start backend:**
   ```bash
   npm run dev:backend
   # or
   node server.js
   ```

4. **Start frontend (in another terminal):**
   ```bash
   npm run dev
   ```

5. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🔍 Verification Steps

1. **Backend Status:**
   - Check terminal for: `✅ Connected to MongoDB Atlas`
   - Check terminal for: `🚀 Server running on http://localhost:5000`

2. **Frontend Connection:**
   - Open browser console
   - Check for successful API calls to `http://localhost:5000/api`
   - No CORS errors should appear

3. **API Endpoints Test:**
   - `GET http://localhost:5000/api/agents` - Should return agents array
   - `GET http://localhost:5000/api/sessions` - Should return sessions array

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | Get all agents |
| POST | `/api/agents` | Save/update agent |
| GET | `/api/sessions` | Get all sessions |
| POST | `/api/sessions` | Save/update session |

## ⚠️ Troubleshooting

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env.local` matches backend port
- Ensure CORS is enabled in `server.js` (already configured)

### MongoDB connection fails
- Verify `MONGO_URI` in `.env` is correct
- Check MongoDB Atlas network access allows your IP
- Ensure connection string includes database name

### Gemini API errors
- Verify `GEMINI_API_KEY` in `.env.local` is valid
- Check API key has proper permissions
- Ensure network allows WebSocket connections

## 📖 Additional Documentation

- See `SETUP.md` for detailed setup instructions
- See `ENV_SETUP.md` for environment variable reference

