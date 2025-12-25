<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1BQz0F6m1LionAu69OkTBFaqTHSOj11Yv

## Run Locally

**Prerequisites:** Node.js, MongoDB Atlas account, Google Gemini API key

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create `.env.local` (frontend):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_API_URL=http://localhost:5000
   ```
   
   Create `.env` (backend):
   ```env
   MONGO_URI=your_mongodb_connection_string_here
   PORT=5000
   ```

3. **Run the application:**
   
   **Terminal 1 - Backend:**
   ```bash
   npm run dev:backend
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open http://localhost:3000 in your browser

### 📖 For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)
