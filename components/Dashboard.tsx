import React, { useEffect, useState } from 'react';
import { AgentConfig, SessionData } from '../types';
import { getSessions, getAgents } from '../services/storage';

interface DashboardProps {
  onStartSession: (agent: AgentConfig) => void;
  onViewReport: (session: SessionData) => void;
  onOpenAdmin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSession, onViewReport, onOpenAdmin }) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedSessions, fetchedAgents] = await Promise.all([
          getSessions(),
          getAgents()
        ]);
        setSessions(fetchedSessions);
        setAgents(fetchedAgents);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-brand-500 text-xl animate-pulse">Loading Vaani Backend...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      
      {/* Hero Section */}
      <div className="flex justify-between items-end border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-500">
            Vani
          </h1>
          <p className="text-xl text-slate-400">
            Universal Indian Multilingual Voice AI Agent
          </p>
        </div>
        <div>
           <button 
             onClick={onOpenAdmin}
             className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-lg border border-slate-600 transition-all shadow-lg hover:shadow-brand-900/20"
           >
             <span>⚙️</span>
             <span>Admin Panel</span>
           </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white border-l-4 border-brand-500 pl-4">Select Agent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Create New Card */}
          <button
              onClick={onOpenAdmin}
              className="group relative flex flex-col items-center justify-center min-h-[180px] bg-slate-900/50 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-6 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-brand-900/50 transition-colors">
                 <span className="text-2xl text-slate-400 group-hover:text-brand-400">+</span>
              </div>
              <h3 className="text-lg font-bold text-slate-300 group-hover:text-white">Create New Agent</h3>
              <p className="text-sm text-slate-500 mt-2">Configure a new persona</p>
          </button>

          {/* Dynamic Agents */}
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onStartSession(agent)}
              className="group relative overflow-hidden bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-brand-500 rounded-xl p-6 transition-all duration-300 text-left shadow-lg hover:shadow-brand-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-400 transition-colors mb-2 truncate">{agent.name}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 h-10 mb-2">{agent.objective}</p>
              <div className="flex gap-2 mb-2">
                 <span className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700">{agent.language}</span>
              </div>
              <div className="mt-4 flex items-center text-brand-500 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                Start Session &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="space-y-6">
         <h2 className="text-2xl font-semibold text-white border-l-4 border-purple-500 pl-4">Recent Reports</h2>
         {sessions.length === 0 ? (
           <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-500">No sessions recorded yet. Start a conversation above.</p>
           </div>
         ) : (
           <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
             <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-900 text-slate-200 uppercase font-medium">
                 <tr>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Role</th>
                   <th className="px-6 py-4">Duration</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700">
                 {sessions.map((session) => (
                   <tr key={session.id} className="hover:bg-slate-750 transition-colors">
                     <td className="px-6 py-4">{new Date(session.timestamp).toLocaleDateString()}</td>
                     <td className="px-6 py-4 text-white font-medium">{session.role}</td>
                     <td className="px-6 py-4">
                       {session.transcript.length > 0 
                         ? Math.round((session.transcript[session.transcript.length-1].timestamp - session.transcript[0].timestamp) / 1000) + 's' 
                         : '0s'}
                     </td>
                     <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                         Completed
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <button 
                         onClick={() => onViewReport(session)}
                         className="text-brand-400 hover:text-brand-300 font-medium"
                       >
                         View Report
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;