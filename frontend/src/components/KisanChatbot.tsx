import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Square, 
  Key, 
  Sparkles, 
  Bot, 
  User, 
  ChevronDown, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Languages
} from 'lucide-react';
import { 
  ChatMessage, 
  FarmContextPayload, 
  sendChatMessage, 
  getStoredGroqKey, 
  setStoredGroqKey, 
  getStoredGroqModel, 
  setStoredGroqModel,
  fetchAvailableGroqModels,
  GROQ_CANDIDATE_MODELS
} from '../services/groqChatService';

interface KisanChatbotProps {
  farmContext: FarmContextPayload;
}

const QUICK_PROMPTS = [
  { label: "💧 Paddy Water Savings", prompt: "How can I reduce water consumption on Paddy without losing yield?" },
  { label: "🌾 Moong (Green Gram) Profit", prompt: "Why is Moong/Green Gram recommended and how much net income can it generate per hectare?" },
  { label: "🚜 PM-KUSUM & Drip Subsidy", prompt: "What government subsidies are available for solar pumps (PM-KUSUM) and drip irrigation in my state?" },
  { label: "🌧️ Borewell Depletion Advisory", prompt: "My local groundwater is over 34 meters deep. What emergency crop shifting strategy should I adopt?" }
];

const VOICE_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' }
];

export const KisanChatbot: React.FC<KisanChatbotProps> = ({ farmContext }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `🙏 **Sat Sri Akal / Namaste! (ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ / नमस्ते)**\n\nI am **Kisan AI Mitra**, your personal agricultural advisor powered by Groq LLaMA-3.3.\n\nI have reviewed your farm at **${farmContext.location || 'Punjab'}** (${farmContext.total_land_ha || 25} ha, water budget: ${((farmContext.water_budget_m3 || 180000)/1000).toFixed(0)}k m³).\n\n🎙️ **You can type or speak in Hindi, Punjabi, or English** using the microphone button below. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Settings & Keys
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [groqKey, setGroqKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState<string[]>(GROQ_CANDIDATE_MODELS);
  const [keySavedNotification, setKeySavedNotification] = useState<boolean>(false);

  // Voice Recording (Microphone) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<string>('hi-IN');
  const recognitionRef = useRef<any>(null);

  // Text-To-Speech (Audio Output) State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Key & Model on Mount
  useEffect(() => {
    const key = getStoredGroqKey();
    setGroqKey(key);
    const model = getStoredGroqModel();
    setSelectedModel(model);
    if (key && key.startsWith('gsk_')) {
      void fetchAvailableGroqModels(key).then(models => {
        if (models && models.length > 0) setAvailableModels(models);
      });
    }
  }, []);

  // Fetch available models whenever modal opens or key changes
  useEffect(() => {
    if (isKeyModalOpen && groqKey && groqKey.startsWith('gsk_')) {
      void fetchAvailableGroqModels(groqKey).then(models => {
        if (models && models.length > 0) setAvailableModels(models);
      });
    }
  }, [isKeyModalOpen, groqKey]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Voice Input (SpeechRecognition)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition already started or error:", err);
      }
    }
  };

  // Handle Text-to-Speech (Speaking Aloud)
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters for pleasant speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose appropriate voice or language
    if (/[\u0A00-\u0A7F]/.test(cleanText)) {
      utterance.lang = 'pa-IN'; // Punjabi
    } else if (/[\u0900-\u097F]/.test(cleanText)) {
      utterance.lang = 'hi-IN'; // Hindi
    } else {
      utterance.lang = 'en-IN'; // Indian English
    }

    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send Message Action
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(
        historyPayload,
        farmContext,
        groqKey,
        selectedModel
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ I encountered an error connecting to Groq. Please verify your Groq API key in settings or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGroqKey(groqKey);
    setStoredGroqModel(selectedModel);
    setKeySavedNotification(true);
    setTimeout(() => {
      setKeySavedNotification(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 cursor-pointer border-2 border-emerald-500/40 group"
          title="Open Kisan AI Voice Chatbot"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-xl shadow-inner">
              🌾
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-emerald-800 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-emerald-800 rounded-full" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-heading font-extrabold flex items-center gap-1.5">
              <span>Kisan AI Mitra</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                GROQ
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium flex items-center gap-1">
              <span>🎙️ Voice & Multilingual</span>
            </p>
          </div>
        </button>
      )}

      {/* Main Chatbot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-xs">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-extrabold text-sm tracking-tight">
                    Kisan AI Mitra
                  </h3>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">
                    Groq LLaMA-3.3
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  किसान एआई मित्र • Voice & Multilingual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Settings / API Key button */}
              <button
                onClick={() => setIsKeyModalOpen(true)}
                title="Configure Groq API Key & Models"
                className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  groqKey ? 'bg-white/10 hover:bg-white/20 text-emerald-100' : 'bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold text-xs px-2.5'
                }`}
              >
                <Key className="w-4 h-4" />
                {!groqKey && <span className="text-[10px]">Set Key</span>}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Farm Context Ribbon (Synchronized Live with Selected Location & Sliders) */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-3.5 py-2 text-[11px] text-slate-700 flex items-center justify-between shrink-0 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-700">📍</span>
              <span className="font-bold text-slate-900 truncate">{farmContext.location || 'Sangrur, Punjab'}</span>
              <span>•</span>
              <span>{farmContext.total_land_ha || 25} ha</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">{((farmContext.water_budget_m3 || 180000)/1000).toFixed(0)}k m³</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded shrink-0">
              Active Context
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-2xs font-bold">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Message Content with Markdown rendering */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>

                  {/* Message Footer: Timestamp and Audio TTS Play Button */}
                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-slate-100/60 text-[10px] opacity-75">
                    <span>{msg.timestamp}</span>

                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content, msg.id || '')}
                        className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
                        title="Speak this answer aloud (ਸੁਣੋ)"
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-red-600" />
                            <span className="text-red-600 font-bold">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>🔊 Suno (ਸੁਣੋ)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="font-medium animate-pulse">Kisan AI is formulating agricultural advisory...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Pills */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100 transition cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Voice Input & Prompt Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            
            {/* Live Listening Waves Banner */}
            {isListening && (
              <div className="mb-2 bg-red-50 border border-red-200 rounded-xl p-2 flex items-center justify-between text-xs text-red-700 font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span>🎙️ Listening in {VOICE_LANGUAGES.find(v => v.code === voiceLang)?.label}... Speak now!</span>
                </div>
                <button
                  onClick={toggleListening}
                  className="text-[11px] underline cursor-pointer hover:text-red-900"
                >
                  Done
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              
              {/* Voice Language Selector Pill */}
              <div className="relative shrink-0">
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold py-2 pl-2 pr-6 rounded-xl border border-slate-200 cursor-pointer focus:outline-hidden"
                  title="Select voice recognition language"
                >
                  {VOICE_LANGUAGES.map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.label.split(' ')[0]}
                    </option>
                  ))}
                </select>
                <Languages className="w-3 h-3 text-slate-500 absolute right-2 top-3 pointer-events-none" />
              </div>

              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 shadow-xs ${
                  isListening 
                    ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-400' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title={isListening ? "Stop listening" : "Click to speak in your language"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isListening ? "Listening to your voice..." : "Ask in Hindi, Punjabi, or English..."}
                disabled={isLoading}
                className="flex-1 bg-slate-100 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Groq API Key Configuration Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900">
                    Groq Cloud API Settings
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Fastest LLaMA-3.3 inference for farmers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Groq API Key (gsk_...)
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <span>Don't have a key?</span>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Get free key at console.groq.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Neural Model ({availableModels.length} Active Candidates)
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-hidden"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m} {m.includes('70b') ? '(Recommended • Multilingual Indian Agronomy)' : m.includes('8b') ? '(Ultra-Fast)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {keySavedNotification && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Settings saved successfully! Ready for voice conversations.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
