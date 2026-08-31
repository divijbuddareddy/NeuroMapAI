import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Brain, 
  Lightbulb, 
  Trash2,
  Key
} from 'lucide-react';
import type { PresetResearchScan, ModelPrediction } from '../../types/neuro';
import type { ChatMessage } from '../../types/gemini';
import { sendNeuroChatMessage, getStoredGeminiKey } from '../../services/geminiService';

interface NeuroChatAssistantProps {
  scan: PresetResearchScan;
  activeModel: ModelPrediction;
  onOpenKeyModal: () => void;
}

const SAMPLE_PROMPTS = [
  'Why did the model classify this subject with high confidence?',
  'Explain the significance of the hippocampal atrophy Z-score.',
  'How does the DMN hypoconnectivity affect the prediction?',
  'Compare the 3D CNN Grad-CAM focus with the XGBoost SHAP ranking.'
];

export const NeuroChatAssistant: React.FC<NeuroChatAssistantProps> = ({
  scan,
  activeModel,
  onOpenKeyModal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **NeuroMap AI Research Assistant**. I have analyzed **${scan.metadata.subjectId}** (${scan.metadata.cohort}, ${scan.metadata.modality}). 

The **${activeModel.modelName}** classified this scan as **${activeModel.predictedClass}** with **${(activeModel.confidence * 100).toFixed(1)}% confidence**. How can I help you interrogate the morphometry, connectome graph, or explainability metrics?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasApiKey = Boolean(getStoredGeminiKey());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendNeuroChatMessage(
        [...messages, userMsg],
        scan,
        activeModel
      );

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error connecting to Gemini API:** ${msg}. Please check your API key settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Chat session reset for **${scan.metadata.subjectId}**. Ask any research question regarding the neuroimaging features.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="glass-card rounded-3xl border border-cyan-500/20 shadow-2xl flex flex-col h-[640px] overflow-hidden">
      {/* Header */}
      <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-neuro-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Neuro Research Chat Assistant
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                hasApiKey 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {hasApiKey ? 'Gemini 2.5 Active' : 'Offline Engine'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Inquire into region Z-scores, graph metrics, or SHAP attributions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasApiKey && (
            <button
              onClick={onOpenKeyModal}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" />
              API Key
            </button>
          )}

          <button
            onClick={handleClear}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 font-sans text-xs md:text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                msg.role === 'user'
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-2xl p-3.5 leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-tr-none'
                  : 'glass-card bg-neuro-900/90 border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              <div
                className={`text-[10px] mt-1.5 ${
                  msg.role === 'user' ? 'text-cyan-200 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 animate-pulse" />
            </div>
            <div className="glass-card p-3 rounded-2xl border border-white/10 text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Gemini is reasoning through connectome pathways...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-4 py-2 bg-neuro-950/40 border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-slate-300 hover:text-cyan-300 transition text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-neuro-950/80 border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${scan.metadata.subjectId}'s connectome, SHAP values, or ML metrics...`}
          className="flex-1 bg-neuro-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="neuro-button-primary p-2.5 rounded-xl disabled:opacity-40 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
