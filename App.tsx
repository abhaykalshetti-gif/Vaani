import React, { useState } from 'react';
import { AppView, AgentConfig, SessionData } from './types';
import Dashboard from './components/Dashboard';
import Session from './components/Session';
import ReportView from './components/ReportView';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [currentAgent, setCurrentAgent] = useState<AgentConfig | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

  const handleStartSession = (agent: AgentConfig) => {
    setCurrentAgent(agent);
    setView(AppView.SESSION);
  };

  const handleEndSession = (sessionData: SessionData) => {
    setSelectedSession(sessionData);
    setView(AppView.REPORT);
  };

  const handleViewReport = (sessionData: SessionData) => {
    setSelectedSession(sessionData);
    setView(AppView.REPORT);
  };

  const handleBackToDashboard = () => {
    setView(AppView.DASHBOARD);
    setCurrentAgent(null);
    setSelectedSession(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={handleBackToDashboard}
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-brand-500/20">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Vaani</span>
            </div>
            <div className="flex items-center space-x-4">
               <div className="hidden md:block text-sm text-slate-400">
                  <span className="w-2 h-2 inline-block rounded-full bg-green-500 mr-2"></span>
                  System Operational
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6">
        {view === AppView.DASHBOARD && (
          <Dashboard 
            onStartSession={handleStartSession} 
            onViewReport={handleViewReport} 
            onOpenAdmin={() => setView(AppView.ADMIN)}
          />
        )}
        
        {view === AppView.ADMIN && (
          <AdminPanel 
            onBack={handleBackToDashboard} 
            onSave={handleBackToDashboard}
          />
        )}
        
        {view === AppView.SESSION && currentAgent && (
          <Session 
            agentConfig={currentAgent} 
            onEndSession={handleEndSession} 
          />
        )}
        
        {view === AppView.REPORT && selectedSession && (
          <ReportView 
            session={selectedSession} 
            onBack={handleBackToDashboard} 
          />
        )}
      </main>
    </div>
  );
};

export default App;