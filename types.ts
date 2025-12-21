
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SESSION = 'SESSION',
  REPORT = 'REPORT',
  ADMIN = 'ADMIN'
}

export enum AgentRole {
  SUPERVISOR = 'Supervisor',
  TEACHER = 'Teacher',
  HEALTH_SURVEYOR = 'Health Surveyor',
  HR_EXECUTIVE = 'HR Executive'
}

export interface AgentConfig {
  id: string;
  name: string;
  language: string;
  objective: string;
  firstQuestion: string; // New: What the agent says immediately
  contextAndTone: string;
  questions: string[];
  knowledgeBase: string;
}

export interface SessionAnalysis {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  tone: string;
  speakingStyle: string;
  scores: {
    fluency: number; // 1-10
    clarity: number; // 1-10
    engagement: number; // 1-10
    vocabulary: number; // 1-10
  };
  feedback: string;
}

export interface SessionData {
  id: string;
  agentId?: string;
  role: string;
  timestamp: number;
  transcript: TranscriptItem[];
  status: 'active' | 'completed';
  analysis?: SessionAnalysis; // Optional until generated
}

export interface TranscriptItem {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface AudioVisualizerData {
  volume: number;
}
