
import React, { useState, useRef } from 'react';
import { AgentConfig } from '../types';
import { saveAgent } from '../services/storage';

interface AdminPanelProps {
  onBack: () => void;
  onSave: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'kb' | 'reporting'>('persona');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<AgentConfig>({
    id: crypto.randomUUID(),
    name: '',
    language: 'English',
    objective: '',
    firstQuestion: '',
    contextAndTone: '',
    questions: [''],
    knowledgeBase: '',
    customAnalysisRequirements: ''
  });

  const handleChange = (field: keyof AgentConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        knowledgeBase: (prev.knowledgeBase + "\n\n--- EXTRACTED FROM FILE ---\n" + text).trim()
      }));
    };
    reader.readAsText(file);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({ ...prev, questions: [...prev.questions, ''] }));
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleSubmit = async () => {
    console.log(formData);
    
    if (!formData.name || !formData.objective || !formData.firstQuestion) {
      alert("Please fill in the Role Name, Objective, and First Question.");
      return;
    }
    setIsSaving(true);
    const cleanData = {
      ...formData,
      questions: formData.questions.filter(q => q.trim() !== '')
    };
    await saveAgent(cleanData);
    setIsSaving(false);
    onSave();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Agent Studio</h1>
          <p className="text-slate-400 text-sm">Design personas, ingest knowledge, and configure report logic.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className={`px-8 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-xl transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            {isSaving ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-xl rounded-[32px] border border-slate-700 overflow-hidden min-h-[600px] flex flex-col md:flex-row shadow-2xl">
        
        <div className="w-full md:w-64 bg-slate-900/50 border-r border-slate-700/50 p-6 flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('persona')}
            className={`text-left px-5 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === 'persona' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            ⚙️ Agent Persona
          </button>
          <button 
            onClick={() => setActiveTab('kb')}
            className={`text-left px-5 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === 'kb' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            📚 Knowledge Base
          </button>
          <button 
            onClick={() => setActiveTab('reporting')}
            className={`text-left px-5 py-3 rounded-2xl font-bold transition-all text-sm ${activeTab === 'reporting' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            📊 Reporting Logic
          </button>
        </div>

        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          {activeTab === 'persona' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-brand-400 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span> Identity
                  </h3>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Role Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Wellness Coach"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Interaction Language</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 transition-all outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Multilingual">Multilingual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Opening Question</label>
                  <textarea 
                    value={formData.firstQuestion}
                    onChange={(e) => handleChange('firstQuestion', e.target.value)}
                    placeholder="The first words the AI will speak..."
                    rows={3}
                    className="w-full bg-slate-900 border border-brand-500/20 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-brand-400 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span> Rules & Objectives
                </h3>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Agent Tone</label>
                  <textarea 
                    value={formData.contextAndTone}
                    onChange={(e) => handleChange('contextAndTone', e.target.value)}
                    placeholder="e.g. Formal, energetic, analytical..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 transition-all outline-none"
                  />
                </div>
                
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sequential Checklist (Topics)</h4>
                <div className="space-y-3">
                  {formData.questions.map((q, idx) => (
                    <div key={idx} className="flex gap-2 group">
                      <input 
                        type="text" 
                        value={q}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                        placeholder="Must cover topic..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-sm"
                      />
                      {formData.questions.length > 1 && (
                        <button onClick={() => removeQuestion(idx)} className="p-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={addQuestion} className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-brand-400 hover:border-brand-500 transition-all text-xs font-bold uppercase tracking-widest">
                    + Add Topic
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kb' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-[24px] border border-slate-700/50">
                 <div>
                    <h3 className="text-lg font-bold text-brand-400 mb-1">Knowledge Engine</h3>
                    <p className="text-xs text-slate-500">Provide documentation for the agent to reference during voice chat.</p>
                 </div>
                 <div>
                    <input type="file" accept=".txt,.md" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-brand-500/30 transition-all"
                    >
                      📎 Extract Text File
                    </button>
                 </div>
              </div>
              <textarea 
                value={formData.knowledgeBase}
                onChange={(e) => handleChange('knowledgeBase', e.target.value)}
                placeholder="Paste extracted PDF text, business rules, or FAQs here..."
                className="w-full h-96 bg-slate-900 border border-slate-700 rounded-[24px] p-8 text-slate-300 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-brand-500/50 outline-none shadow-inner custom-scrollbar"
              />
            </div>
          )}

          {activeTab === 'reporting' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-brand-400">Custom Analysis Requirements</h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Optional Feature</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                  By default, Vaani provides a comprehensive report on sentiment, fluency, and engagement. 
                  If you have <strong>specific business needs</strong> (e.g., "Check if user mentioned competitor X"), add them below.
                </p>
                <textarea 
                  value={formData.customAnalysisRequirements}
                  onChange={(e) => handleChange('customAnalysisRequirements', e.target.value)}
                  placeholder="Example: 'Flag any technical inaccuracies' or 'Analyze user confidence when discussing pricing'..."
                  className="w-full h-64 bg-slate-900 border border-slate-700 rounded-[24px] p-8 text-white focus:ring-2 focus:ring-brand-500/50 outline-none shadow-inner"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-2">When Empty</p>
                      <p className="text-xs text-slate-400">Vaani generates a standard performance report focusing on conversation success.</p>
                   </div>
                   <div className="p-5 bg-brand-500/5 rounded-2xl border border-brand-500/20">
                      <p className="text-[10px] font-black text-brand-400 uppercase mb-2">When Provided</p>
                      <p className="text-xs text-slate-300">Gemini strictly evaluates the session against your custom prompt in a dedicated report section.</p>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
