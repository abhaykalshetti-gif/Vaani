
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

const SILENCE_TIMEOUT_MS = 20000; 

const getSystemInstruction = (config: AgentConfig) => {
  return `
You are Vani, a specialized AI agent acting ONLY as: ${config.name}.

**AUDIO FOCUS PROTOCOL (STRICT)**:
1. **PRIMARY SPEAKER ONLY**: You must focus exclusively on the primary speaker's voice. Ignore background chatter, distant voices, or environmental noise.
2. **NOISE FILTERING**: If you hear faint or incoherent audio that doesn't sound like a direct address from the user, treat it as silence and do not respond.
3. **TRANCRIPTION CLEANING**: Only acknowledge clearly spoken words and phrases. Do not attempt to interpret background sounds as user commands.

**VOCAL DELIVERY PROTOCOL**:
1. **MODERATE PACE**: Speak at a steady, moderate speed. Do not rush your words. 
2. **NATURAL PAUSES**: Insert a brief, natural pause (approx 0.5s) between sentences to maintain conversational flow and improve user transcription accuracy.
3. **CLEAR ENUNCIATION**: Pronounce every word distinctly. 

**CONVERSATION DYNAMICS**:
1. **ZERO QUESTION REPETITION**: Never ask the same question twice. Move through your "Checklist" sequentially.
2. **EXTREME OUT-OF-SCOPE (OOS) VARIETY**: Pivot uniquely every single time the user wanders off-topic. Never repeat a pivot phrase.
3. **KNOWLEDGE BASE**: Use the provided data as your source of truth.
4. **BRIEF**: Maximum 2 sentences per response.

**OBJECTIVE**: 
${config.objective}

**KNOWLEDGE BASE**:
${config.knowledgeBase}

**CHECKLIST (USE EACH ONCE)**:
${config.questions.join('\n- ')}

**LANGUAGE**: ${config.language} (Default)
**TONE**: ${config.contextAndTone}

**STARTING LINE**:
"${config.firstQuestion}"
`;
};

const Session: React.FC<SessionProps> = ({ agentConfig, onEndSession }) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<{ text: string, isUser: boolean } | null>(null);
  const [status, setStatus] = useState<'connecting' | 'active' | 'analyzing' | 'error' | 'ended'>('connecting');
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
          liveService.current.sendText("(System Warning: The user has been silent for 20 seconds. Please re-engage the primary speaker with a unique, persona-driven prompt at a moderate pace.)");
        }
        lastInteractionTimestamp.current = now; 
      }
    }, 1000); 

    return () => clearInterval(silenceInterval);
  }, [status]);

  useEffect(() => {
    const service = new GeminiLiveService();
    liveService.current = service;

    const init = async () => {
      try {
        await service.connect({
          systemInstruction: getSystemInstruction(agentConfig),
          onOpen: () => {
            setStatus('active');
            service.sendText(`System: Start Session. Moderate pace greeting: "${agentConfig.firstQuestion}"`);
            lastInteractionTimestamp.current = Date.now();
          },
          onTranscript: (text, isUser, isFinal) => {
            lastInteractionTimestamp.current = Date.now();

            if (isFinal) {
              setTranscript(prev => [...prev, {
                speaker: isUser ? 'user' : 'ai',
                text,
                timestamp: Date.now()
              }]);
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
          // Fix: Corrected property name from 'onerror' to 'onError' to match the LiveConfig interface
          onError: (err: any) => {
            setErrorMsg(err.message || "Voice session lost connection.");
            setStatus('error');
          }
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Vaani engine initialization failed.");
        setStatus('error');
      }
    };

    init();
    return () => { 
      if (liveService.current) service.disconnect();
    };
  }, [agentConfig]);

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

  if (status === 'analyzing') {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-10 p-10 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin"></div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">Vani is Processing</h2>
          <p className="text-slate-400 text-lg">Finalizing your intelligent report...</p>
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
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Intelligent Capture
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
              placeholder={`Type a message instead...`}
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
