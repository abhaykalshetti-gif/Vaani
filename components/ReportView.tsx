
import React from 'react';
import { SessionData } from '../types';

interface ReportViewProps {
  session: SessionData;
  onBack: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ session, onBack }) => {
  const { analysis } = session;

  const handleDownload = () => {
    let content = `VANI AI - CONVERSATION REPORT\n`;
    content += `============================\n`;
    content += `Role: ${session.role}\n`;
    content += `Date: ${new Date(session.timestamp).toLocaleString()}\n\n`;
    
    if (analysis) {
        content += `ANALYSIS\n--------\n`;
        content += `Sentiment: ${analysis.sentiment}\n`;
        content += `Tone: ${analysis.tone}\n`;
        content += `Summary: ${analysis.summary}\n\n`;
        content += `INSIGHTS\n--------\n${analysis.customInsights}\n\n`;
    }

    content += `TRANSCRIPT\n----------\n`;
    session.transcript.forEach(t => {
        content += `[${t.speaker.toUpperCase()}]: ${t.text}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vani-report-${session.id.slice(0,5)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
          <span>Back to Dashboard</span>
        </button>
        <button onClick={handleDownload} className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-brand-500/20 transition-all">
          Download Report
        </button>
      </div>

      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
        <div className="border-b border-slate-700 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-3xl font-black text-white">{session.role} Analysis</h1>
              <p className="text-slate-400 mt-1">{new Date(session.timestamp).toLocaleString()}</p>
           </div>
           <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${analysis?.sentiment === 'Positive' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                {analysis?.sentiment || 'Neutral'}
              </span>
           </div>
        </div>

        {analysis ? (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                        <h3 className="text-brand-400 font-bold text-[10px] uppercase tracking-widest mb-4">Executive Summary</h3>
                        <p className="text-slate-200 leading-relaxed text-sm">{analysis.summary}</p>
                    </div>
                    <div className="bg-indigo-900/10 p-6 rounded-2xl border border-indigo-500/20">
                        <h3 className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mb-4">Tone & Delivery</h3>
                        <p className="text-white text-base font-bold mb-1">{analysis.tone}</p>
                        <p className="text-slate-400 text-xs italic">{analysis.speakingStyle}</p>
                    </div>
                </div>

                <div className="bg-brand-500/5 border border-brand-500/20 p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    </div>
                    <h3 className="text-brand-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                      {session.agentId ? 'Targeted Analysis & Insights' : 'General Insights'}
                    </h3>
                    <p className="text-white text-base leading-relaxed">{analysis.customInsights}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-bold text-sm border-l-2 border-brand-500 pl-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(analysis.scores).map(([key, val]) => (
                          <div key={key} className="bg-slate-900/80 p-4 rounded-xl text-center border border-slate-700/50 group hover:border-brand-500/50 transition-colors">
                              <p className="text-slate-500 text-[10px] uppercase mb-1">{key}</p>
                              <p className="text-2xl font-black text-white group-hover:text-brand-400 transition-colors">{val as number}/10</p>
                          </div>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-700 border-dashed">
                    <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-3">Actionable Feedback</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.feedback}</p>
                </div>
            </div>
        ) : (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
               <p className="text-slate-500 text-sm font-medium">Detailed analysis report is not available for this session.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportView;
