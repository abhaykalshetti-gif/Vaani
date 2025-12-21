
import { SessionData, AgentConfig } from '../types';

const API_URL = "http://localhost:3000/api";

const getLocalItem = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LocalStorage save failed", e);
  }
};

export const saveSession = async (session: SessionData): Promise<void> => {
  const sessions = getLocalItem<SessionData[]>('vani_sessions', []);
  const index = sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  setLocalItem('vani_sessions', sessions);

  try {
    await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
  } catch (error) {
    console.warn("Backend unavailable. Session saved locally only.");
  }
};

export const getSessions = async (): Promise<SessionData[]> => {
  try {
    const res = await fetch(`${API_URL}/sessions`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (error) {
    console.warn("Failed to fetch sessions from backend. Using LocalStorage.", error);
    return getLocalItem<SessionData[]>('vani_sessions', []);
  }
};

export const getSessionById = async (id: string): Promise<SessionData | undefined> => {
  const sessions = await getSessions();
  return sessions.find(s => s.id === id);
};

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'default_supervisor',
    name: 'Supervisor',
    language: 'English',
    objective: 'Uncover hidden blockers, celebrate wins, and assess morale.',
    firstQuestion: "Hello! I'm your supervisor. To get started, could you please tell me your name and how your week has been going so far?",
    contextAndTone: 'You are a supportive yet professional Supervisor. Tone: Collaborative, mentorship-focused, solution-oriented.',
    questions: [
      "How confident do you feel about achieving your targets this month?",
      "What were the main challenges you faced recently?",
      "How can the organization support you better?"
    ],
    knowledgeBase: "Company Policies: We support remote work for 2 days a week. Annual leave is 20 days. Mental health support is available via the HR portal."
  },
  {
    id: 'default_teacher',
    name: 'Teacher',
    language: 'Hindi',
    objective: 'Discuss student progress, homework habits, and emotional well-being.',
    firstQuestion: "नमस्ते! मैं आपके बच्चे का शिक्षक हूँ। बातचीत शुरू करने के लिए, क्या आप मुझे अपना नाम बता सकते हैं?",
    contextAndTone: 'You are a caring Teacher speaking to a parent. Tone: Nurturing, patient, clear.',
    questions: [
      "How has the student been managing their homework schedule?",
      "Have you noticed any particular subjects they struggle with?",
      "Is there anything happening at home that might affect their focus?"
    ],
    knowledgeBase: "School opens at 8:00 AM. Parent-teacher meetings happen quarterly. The math curriculum this term covers geometry."
  }
];

export const getAgents = async (): Promise<AgentConfig[]> => {
  try {
    const res = await fetch(`${API_URL}/agents`);
    if (!res.ok) throw new Error("Backend offline");
    const agents = await res.json();
    
    if (agents.length === 0) {
      for (const agent of DEFAULT_AGENTS) {
        fetch(`${API_URL}/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agent)
        }).catch(() => {});
      }
      return DEFAULT_AGENTS;
    }
    return agents;
  } catch (error) {
    const localAgents = getLocalItem<AgentConfig[]>('vani_agents', []);
    return localAgents.length > 0 ? localAgents : DEFAULT_AGENTS;
  }
};

export const saveAgent = async (agent: AgentConfig): Promise<void> => {
  const agents = getLocalItem<AgentConfig[]>('vani_agents', []);
  if (agents.length === 0) {
      agents.push(...DEFAULT_AGENTS.filter(a => a.id !== agent.id));
  }

  const idx = agents.findIndex(a => a.id === agent.id);
  if (idx >= 0) {
    agents[idx] = agent;
  } else {
    agents.push(agent);
  }
  setLocalItem('vani_agents', agents);

  try {
    await fetch(`${API_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    });
  } catch (error) {
    console.error("Failed to save agent to backend (Saved locally):", error);
  }
};

export const deleteAgent = async (id: string): Promise<void> => {
  console.log("Delete not implemented in this version");
};
