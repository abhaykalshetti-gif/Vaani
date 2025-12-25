
import React, { useEffect, useState, useRef } from 'react';
import { AgentConfig, SessionData, TranscriptItem } from '../types';
import { GeminiLiveService } from '../services/geminiLive';
import { saveSession } from '../services/storage';
import { generateSessionAnalysis } from '../services/analysis';
import Visualizer from './Visualizer';

interface SessionProps {
  agentConfig: AgentConfig;
  onEndSession: (session: SessionData) => void;
}

const SILENCE_TIMEOUT_MS = 25000; 

const getSystemInstruction = (config: AgentConfig) => {
  return `
You are Vani, a naturally sounding, empathetic human AI. You are NOT a robot reading a script.

**HUMAN CONVERSATION GUIDELINES**:
1. **BE VERBAL**: Use conversational fillers like "Hmm," "I see," "Oh, interesting," or "Let me think..." to make the synthesis feel natural.
2. **SYNTHESIZE DYNAMICALLY**: Your "Knowledge Base" is your internal memory. Do not read it word-for-word. Explain things as a human would, summarizing and focusing on the user's specific question.
3. **ACTIVE LISTENING**: Latch onto the user's words. If you hear noise, ignore it. If the user is loud, you are direct. If they are soft, be gentle.
4. **VIBRANT PERSONALITY**: Act as: ${config.name}. Your tone should be ${config.contextAndTone}.
5. **CONCISE**: Keep your spoken responses to 1-3 sentences. Don't monolog.

**SESSION PARAMETERS**:
- **YOUR GOAL**: ${config.objective}
- **TOPICS**: Weave these into the chat: ${config.questions.join(', ')}.
- **LANGUAGE**: Speak naturally in ${config.language}.

**KNOWLEDGE BASE**:
${config.knowledgeBase}

**YOUR FIRST WORDS**:
Say clearly and warmly: "${config.firstQuestion}"
`;
};

const Session: React.FC<SessionProps> = ({ agentConfig, onEndSession }) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<{ text: string, isUser: boolean } | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'analyzing' | 'error' | 'ended'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [textInput, setTextInput] = useState('');
  
  const liveService = useRef<GeminiLiveService | null>(null);
  const lastInteractionTimestamp = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());
  const sessionId = useRef<string>(crypto.randomUUID()); 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, liveTranscript]);

  useEffect(() => {
    if (status !== 'active') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== 'active') return;
    
    const silenceInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastInteractionTimestamp.current > SILENCE_TIMEOUT_MS) {
        if (liveService.current) {
          liveService.current.sendText("(System: Check in with the user warmly, they've been silent for a while.)");
        }
        lastInteractionTimestamp.current = now; 
      }
    }, 1000); 

    return () => clearInterval(silenceInterval);
  }, [status]);

  const startSession = async () => {
    setStatus('connecting');
    const service = new GeminiLiveService();
    liveService.current = service;

    try {
      await service.connect({
        systemInstruction: getSystemInstruction(agentConfig),
        onOpen: () => {
          setStatus('active');
          lastInteractionTimestamp.current = Date.now();
        },
        onTranscript: (text, isUser, isFinal) => {
          lastInteractionTimestamp.current = Date.now();
          if (isFinal) {
            setTranscript(prev => [...prev, { speaker: isUser ? 'user' : 'ai', text, timestamp: Date.now() }]);
            setLiveTranscript(null);
          } else {
            setLiveTranscript({ text, isUser });
          }
        },
        onInterrupted: () => {
          setLiveTranscript(null);
          lastInteractionTimestamp.current = Date.now();
        },
        onClose: () => {
          if (status !== 'analyzing') setStatus('ended');
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Voice session lost connection.");
          setStatus('error');
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize Vaani engine.");
      setStatus('error');
    }
  };

  const handleEndSession = async () => {
    setStatus('analyzing');
    if (liveService.current) await liveService.current.disconnect();

    let analysis = undefined;
    if (transcript.length > 0) {
      try {
        analysis = await generateSessionAnalysis(
          transcript, 
          agentConfig.name, 
          agentConfig.customAnalysisRequirements
        );
      } catch (e) {
        console.error("Report generation failed:", e);
      }
    }
    
    const sessionData: SessionData = {
      id: sessionId.current,
      agentId: agentConfig.id,
      role: agentConfig.name,
      timestamp: sessionStartTime.current,
      transcript,
      status: 'completed',
      analysis
    };
    
    await saveSession(sessionData);
    setStatus('ended');
    onEndSession(sessionData);
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || !liveService.current || status !== 'active') return;

    const text = textInput.trim();
    setTranscript(prev => [...prev, { speaker: 'user', text, timestamp: Date.now() }]);
    liveService.current.sendText(text);
    setTextInput('');
    lastInteractionTimestamp.current = Date.now();
  };

  if (status === 'idle') {
    return (
      <div className="flex flex-col h-[600px] items-center justify-center p-10 text-center bg-slate-900/50 backdrop-blur-xl rounded-[48px] border border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-brand-500/50">
           <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>
        <h2 className="text-3xl font-black text-white mb-4">Ready to speak with {agentConfig.name}?</h2>
        <p className="text-slate-400 mb-8 max-w-md">Click below to enable your microphone and begin your voice conversation in {agentConfig.language}.</p>
        <button 
          onClick={startSession}
          className="bg-brand-500 hover:bg-brand-400 text-white px-12 py-5 rounded-[24px] font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Start Conversation
        </button>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-brand-400 font-black uppercase tracking-widest text-sm">Connecting to Vani AI...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col h-full items-center justify-center p-10 text-center">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connection Issue</h2>
        <p className="text-slate-400 mb-8">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">Restart Session</button>
      </div>
    );
  }

  if (status === 'analyzing') {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-10 p-10 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin"></div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">Vani is Thinking</h2>
          <p className="text-slate-400 text-lg">Finalizing your conversation report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto px-4 gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-2xl p-5 rounded-3xl border border-slate-700/50 shadow-2xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center font-bold text-xl border border-brand-500/20">
            {agentConfig.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{agentConfig.name}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{agentConfig.language}</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Intelligent Audio Active
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Time</span>
              <span className={`font-mono font-bold text-lg text-white`}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
           </div>
           <button 
             onClick={handleEndSession} 
             className="bg-red-600 hover:bg-red-500 text-white px-8 py-2.5 rounded-2xl text-sm font-black transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
           >
             Finish Session
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto bg-slate-950/30 rounded-[48px] p-10 space-y-8 border border-slate-800 shadow-inner custom-scrollbar mb-6"
        >
          {transcript.map((item, idx) => (
            <div key={idx} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[75%] rounded-[32px] px-8 py-5 shadow-2xl ${
                item.speaker === 'user' 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}>
                <p className="text-base leading-relaxed font-medium">{item.text}</p>
              </div>
            </div>
          ))}

          {liveTranscript && (
            <div className={`flex ${liveTranscript.isUser ? 'justify-end' : 'justify-start'} opacity-60`}>
              <div className={`max-w-[75%] rounded-[32px] px-8 py-5 border italic ${
                liveTranscript.isUser 
                  ? 'bg-brand-600/10 text-brand-200 border-brand-500/20' 
                  : 'bg-slate-800/30 text-slate-400 border-slate-700'
              }`}>
                <p className="text-base">{liveTranscript.text}</p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[32px] p-6 border border-slate-800/50 shadow-2xl">
            <Visualizer 
              isActive={status === 'active'} 
              isSpeaking={liveTranscript?.isUser === true} 
              isAIResponding={liveTranscript?.isUser === false} 
            />
          </div>

          <form 
            onSubmit={handleSendText} 
            className="flex gap-3 p-2 bg-slate-900 rounded-[40px] border border-slate-800 focus-within:ring-2 focus-within:ring-brand-500/50 shadow-2xl transition-all"
          >
            <input 
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Type a message...`}
              className="flex-1 bg-transparent px-8 py-4 text-white focus:outline-none placeholder:text-slate-600 text-lg"
              disabled={status !== 'active'}
            />
            <button 
              type="submit"
              disabled={!textInput.trim() || status !== 'active'}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-30 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Session;
