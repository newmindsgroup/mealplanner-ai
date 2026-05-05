/**
 * AiCoachChat — conversational fitness coaching panel
 * Phase 4 feature: AI coach powered by the user's fitness profile + workout plan.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Loader2, MessageSquare, Dumbbell, Sparkles } from 'lucide-react';
import { getCoachHistory, sendCoachMessage, clearCoachHistory } from '../../services/fitnessService';
import type { CoachMessage as ChatMessage } from '../../services/fitnessService';


const STARTER_PROMPTS = [
  "What's the best warm-up for leg day?",
  "How should I eat before a morning workout?",
  "Can I swap bench press if I have no barbell?",
  "How do I increase my squat without knee pain?",
  "Give me a quick 10-minute HIIT finisher.",
  "What muscles does Romanian deadlift target?",
];

export default function AiCoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const res = await getCoachHistory();
      setMessages((res.data || []).reverse()); // API returns DESC, display ASC
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await sendCoachMessage(msg);
      const assistantMsg: ChatMessage = {
        id: res.data?.messageId || `ai-${Date.now()}`,
        role: 'assistant',
        content: res.data?.reply || "Sorry, I couldn't generate a response. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), { ...userMsg, id: `u-${Date.now()}` }, assistantMsg]);
    } catch {
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), userMsg, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Oops — something went wrong. Check your connection and try again.',
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!confirm('Clear all chat history? This cannot be undone.')) return;
    try {
      await clearCoachHistory();
      setMessages([]);
      setCleared(true);
    } catch { /* non-fatal */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <Dumbbell className="w-4.5 h-4.5 w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">AI Fitness Coach</h3>
            <p className="text-xs text-gray-500">Personalized to your profile & plan</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" title="Clear history">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading conversation…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Ask your AI coach anything</p>
              <p className="text-xs text-gray-400 mt-1">Exercise tips, nutrition timing, form cues, modifications…</p>
            </div>
            {/* Starter prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {STARTER_PROMPTS.slice(0, 4).map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors leading-relaxed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-orange-500 to-rose-500'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Sparkles className="w-3.5 h-3.5 text-white" />
                  }
                </div>
                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Sending indicator */}
            {sending && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach… (Enter to send)"
            rows={1}
            disabled={sending}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-50"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-40 shadow-sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">AI coach knows your profile, plan & goals</p>
      </div>
    </div>
  );
}
