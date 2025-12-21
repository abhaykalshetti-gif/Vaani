
import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean; // Is the user speaking?
  isAIResponding: boolean; // Is the AI generating/speaking?
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isSpeaking, isAIResponding }) => {
  return (
    <div className="flex items-center justify-center h-12 w-full gap-1.5">
      {isActive ? (
        <>
          <div className={`w-1.5 h-4 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-green-500 animate-[bounce_1s_infinite]' : 'bg-slate-700'}`}></div>
          <div className={`w-1.5 h-6 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-green-400 animate-[bounce_1.2s_infinite]' : 'bg-slate-700'}`}></div>
          <div className={`w-1.5 h-8 rounded-full transition-all duration-300 ${isSpeaking || isAIResponding ? 'bg-brand-500 animate-[pulse_0.8s_infinite]' : 'bg-slate-700'}`}></div>
          <div className={`w-1.5 h-6 rounded-full transition-all duration-300 ${isAIResponding ? 'bg-blue-400 animate-[bounce_1.2s_infinite]' : 'bg-slate-700'}`}></div>
          <div className={`w-1.5 h-4 rounded-full transition-all duration-300 ${isAIResponding ? 'bg-blue-300 animate-[bounce_1s_infinite]' : 'bg-slate-700'}`}></div>
        </>
      ) : (
        <span className="text-slate-500 text-xs font-medium uppercase tracking-widest">System Offline</span>
      )}
    </div>
  );
};

export default Visualizer;
