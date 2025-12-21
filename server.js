
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://megharajdandgavhal2004_db_user:3ehkLRSzxSENbOdN@cluster0.mniohon.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schemas
const AgentSchema = new mongoose.Schema({
  id: String,
  name: String,
  language: String,
  objective: String,
  firstQuestion: String, // SYNCED: Added missing field
  contextAndTone: String,
  questions: [String],
  knowledgeBase: String,
  customAnalysisRequirements: String // SYNCED: Added missing field
});

const SessionSchema = new mongoose.Schema({
  id: String,
  agentId: String,
  role: String,
  timestamp: Number,
  transcript: Array,
  status: String,
  analysis: Object 
});

const Agent = mongoose.model('Agent', AgentSchema);
const Session = mongoose.model('Session', SessionSchema);

// --- API Routes ---

// Get All Agents
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save/Update Agent
app.post('/api/agents', async (req, res) => {
  try {
    const { id } = req.body;
    // Upsert: Update if exists, Insert if not
    const agent = await Agent.findOneAndUpdate({ id }, req.body, { upsert: true, new: true });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ timestamp: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save/Update Session
app.post('/api/sessions', async (req, res) => {
  try {
    const { id } = req.body;
    const session = await Session.findOneAndUpdate({ id }, req.body, { upsert: true, new: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
