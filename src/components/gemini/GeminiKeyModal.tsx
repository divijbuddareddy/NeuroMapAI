import React, { useState } from 'react';
import { Key, Sparkles, ShieldCheck, ExternalLink, X, Check, AlertCircle } from 'lucide-react';
import { getStoredGeminiKey, saveGeminiKey, getStoredGeminiModel, saveGeminiModel } from '../../services/geminiService';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
}

export const GeminiKeyModal: React.FC<GeminiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState(getStoredGeminiKey());
  const [model, setModel] = useState(getStoredGeminiModel());
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGeminiKey(apiKey);
    saveGeminiModel(model);
    setShowSuccess(true);
    onKeySaved(apiKey);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter a valid Gemini API key first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "NEUROMAP_OK" if you can read this.' }] }]
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      setTestResult({ success: true, message: 'Gemini API Key verified and active!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({ success: false, message: `Verification failed: ${msg}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card bg-neuro-950/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Header */}
        <div className="flex items-start justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Gemini AI Reasoning Engine
              </h3>
              <p className="text-xs text-slate-400">Connect your Google Gemini API for live multi-modal neuro reasoning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-4 relative z-10">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neuro-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition"
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reasoning Model Version
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'Fastest & Smart' },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Reasoning' },
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'Standard' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  className={`p-2.5 rounded-xl text-left border transition ${
                    model === m.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-glow-cyan'
                      : 'bg-neuro-900/60 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{m.name}</div>
                  <div className="text-[10px] text-cyan-400/80">{m.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your API key is stored securely in your browser's <code className="text-cyan-300 font-mono">localStorage</code>. It is never logged or transmitted to any third-party servers except direct requests to Google's Gemini API endpoints.
            </span>
          </div>

          {/* Test Connection Output */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 mt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold transition disabled:opacity-50"
            >
              {isTesting ? 'Verifying...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="neuro-button-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                {showSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {showSuccess ? 'Saved!' : 'Save & Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
