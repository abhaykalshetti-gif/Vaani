# 🚀 Quick Start Guide - How to Run VoiceAgent

## Prerequisites
- Node.js installed (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

---

## Step-by-Step Instructions

### Step 1: Install Dependencies

Open terminal in the project root and run:

```bash
npm install
```

This will install all dependencies including:
- Frontend: React, Vite, TypeScript
- Backend: Express, Mongoose, CORS, dotenv
- AI: Google Gemini SDK

---

### Step 2: Set Up Environment Variables

#### Create `.env.local` file (Frontend)

Create a file named `.env.local` in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://localhost:5000
```

**Where to get Gemini API Key:**
- Visit: https://ai.google.dev/
- Sign in with Google account
- Create API key
- Copy and paste it in `.env.local`

#### Create `.env` file (Backend)

Create a file named `.env` in the root directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
PORT=5000
```

**Where to get MongoDB URI:**
- Visit: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password
- Replace `<database>` with your database name (e.g., `vaani`)

---

### Step 3: Run the Application

You need **TWO terminal windows** to run both frontend and backend.

#### Terminal 1 - Start Backend Server

```bash
npm run dev:backend
```

**Expected output:**
```
✅ Connected to MongoDB Atlas
🚀 Server running on http://localhost:5000
```

#### Terminal 2 - Start Frontend

```bash
npm run dev
```

**Expected output:**
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

You should see the **Vaani Dashboard** with:
- Agent selection cards
- Recent reports section
- Admin Panel button

---

## ✅ Verification Checklist

- [ ] Backend shows: `✅ Connected to MongoDB Atlas`
- [ ] Backend shows: `🚀 Server running on http://localhost:5000`
- [ ] Frontend shows: `Local: http://localhost:3000/`
- [ ] Browser opens dashboard without errors
- [ ] No CORS errors in browser console
- [ ] Can see default agents (Supervisor, Teacher)

---

## 🎯 Testing the Connection

1. **Test Backend API:**
   - Open: http://localhost:5000/api/agents
   - Should return JSON array of agents

2. **Test Frontend:**
   - Click on an agent card
   - Should start a voice session
   - Allow microphone permissions when prompted

---

## 🛠️ Troubleshooting

### Backend won't start
- **Error: "Cannot find module 'express'"**
  - Run: `npm install` again
  
- **Error: "MongoDB Connection Error"**
  - Check `.env` file has correct `MONGO_URI`
  - Verify MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for testing)
  - Check password in connection string is correct

### Frontend won't start
- **Error: "Port 3000 already in use"**
  - Change port in `vite.config.ts` or kill process using port 3000

- **Error: "GEMINI_API_KEY is not defined"**
  - Check `.env.local` file exists and has `GEMINI_API_KEY`
  - Restart the dev server after creating `.env.local`

### Frontend can't connect to backend
- **CORS errors in browser console**
  - Verify backend is running on port 5000
  - Check `VITE_API_URL` in `.env.local` is `http://localhost:5000`
  - Restart frontend after changing `.env.local`

### Voice not working
- **Microphone permission denied**
  - Allow microphone access in browser settings
  - Use HTTPS or localhost (required for microphone)

- **Gemini API errors**
  - Verify `GEMINI_API_KEY` is correct
  - Check API key has proper permissions
  - Ensure you have quota/credits in Google Cloud

---

## 📝 Alternative: Run Both Together (Optional)

If you want to run both servers with one command, install `concurrently`:

```bash
npm install --save-dev concurrently
```

Then add to `package.json` scripts:
```json
"dev:all": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
```

Run with:
```bash
npm run dev:all
```

---

## 🎉 You're All Set!

Your VoiceAgent application should now be running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

Start a conversation with an agent and test the voice AI features!

