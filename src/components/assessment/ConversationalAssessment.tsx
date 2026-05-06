import React, { useState, useRef, useEffect } from 'react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { getAIService } from '../../services/aiService';
import {
  getConversationalSystemPrompt,
  parseConversationalScoring,
  convertConversationalToResult,
} from '../../services/aiNeuroAnalysis';
import {
  Brain, Send, Loader2, AlertCircle,
  Zap, Lightbulb, Shield, Heart, CheckCircle,
} from 'lucide-react';

export default function ConversationalAssessment() {
  const {
    conversationalMessages,
    conversationalScoring,
    addConversationalMessage,
    updateConversationalScoring,
    completeConversationalAssessment,
  } = useAssessmentStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationalMessages]);

  // Initialize conversation with AI greeting
  useEffect(() => {
    if (conversationalMessages.length === 0) {
      startConversation();
    }
  }, []);

  const startConversation = async () => {
    const aiService = getAIService();
    if (!aiService) {
      setError('AI service is not configured. Please add an API key in Settings to use the conversational assessment.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiService.chat(
        [
          { role: 'system', content: getConversationalSystemPrompt() },
          { role: 'user', content: 'Hello, I would like to take the neurotransmitter assessment.' },
        ],
        { temperature: 0.7, maxTokens: 800 }
      );

      const { visibleMessage, scoring } = parseConversationalScoring(response);

      addConversationalMessage({
        role: 'assistant',
        content: visibleMessage,
        scoring: scoring || undefined,
        timestamp: new Date().toISOString(),
      });

      if (scoring) {
        updateConversationalScoring(scoring);
      }
    } catch (err) {
      setError('Failed to start the assessment. Please check your AI configuration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    addConversationalMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);

    try {
      const aiService = getAIService();
      if (!aiService) throw new Error('AI service not configured');

      // Build conversation history for context
      const allMessages = [
        ...conversationalMessages,
        { role: 'user' as const, content: userMessage, timestamp: new Date().toISOString() },
      ];

      const chatMessages = [
        { role: 'system' as const, content: getConversationalSystemPrompt() },
        ...allMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      const response = await aiService.chat(chatMessages, {
        temperature: 0.7,
        maxTokens: 800,
      });

      const { visibleMessage, scoring } = parseConversationalScoring(response);

      addConversationalMessage({
        role: 'assistant',
        content: visibleMessage,
        scoring: scoring || undefined,
        timestamp: new Date().toISOString(),
      });

      if (scoring) {
        updateConversationalScoring(scoring);

        // Check if assessment is complete (90%+ confidence)
        if (scoring.assessmentComplete && scoring.overallConfidence >= 90) {
          const result = convertConversationalToResult(scoring);
          setTimeout(() => {
            completeConversationalAssessment(result);
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.userMessage || 'Failed to process your response. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const confidence = conversationalScoring?.overallConfidence || 0;
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'dopamine': return 'text-yellow-500';
      case 'acetylcholine': return 'text-blue-500';
      case 'gaba': return 'text-green-500';
      case 'serotonin': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'dopamine': return <Zap className="w-3.5 h-3.5" />;
      case 'acetylcholine': return <Lightbulb className="w-3.5 h-3.5" />;
      case 'gaba': return <Shield className="w-3.5 h-3.5" />;
      case 'serotonin': return <Heart className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      {/* Header with confidence meter */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Dr. Neura — AI Assessment</h3>
              <p className="text-xs text-gray-500">Conversational neurotransmitter analysis</p>
            </div>
          </div>
          {conversationalScoring && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Confidence</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold ${confidence >= 90 ? 'text-green-600' : confidence >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>
                  {confidence}%
                </span>
                {confidence >= 90 && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </div>
          )}
        </div>

        {/* Mini confidence bars per category */}
        {conversationalScoring && (
          <div className="grid grid-cols-4 gap-2">
            {(['dopamine', 'acetylcholine', 'gaba', 'serotonin'] as const).map((cat) => {
              const catScoring = conversationalScoring[cat];
              return (
                <div key={cat} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className={getCategoryColor(cat)}>{getCategoryIcon(cat)}</span>
                    <span className="text-[10px] font-medium text-gray-500 uppercase">{cat.slice(0, 4)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        catScoring.confidence >= 80 ? 'bg-green-500' : catScoring.confidence >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${catScoring.confidence}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confidence progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                confidence >= 90 ? 'bg-green-500' : confidence >= 60 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {confidence < 30 ? 'Getting to know you...' :
             confidence < 60 ? 'Building your profile...' :
             confidence < 90 ? 'Almost there — a few more questions...' :
             '✓ Assessment complete — generating your report...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {conversationalMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dr. Neura is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share how you're feeling, your habits, energy levels..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ maxHeight: '120px' }}
            disabled={isLoading || (conversationalScoring?.assessmentComplete && (conversationalScoring?.overallConfidence || 0) >= 90)}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 flex items-start gap-1.5 text-[10px] text-gray-400">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>This AI assessment is for educational purposes only and is not a medical diagnosis. Press Enter to send, Shift+Enter for new line.</span>
        </div>
      </div>
    </div>
  );
}
