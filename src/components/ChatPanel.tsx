/**
 * ChatPanel v2 — Multi-format AI chat with attachments, data extraction,
 * rich message bubbles, drag-drop, and paste support.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bot, MessageCircle, X, History,
  Calendar, ScanLine, ShoppingCart, Activity, Lightbulb,
  User, Heart, Target, RefreshCw, Sparkles, BarChart3,
  ChefHat, Clock, Search, Star, Repeat, List, AlertTriangle,
  Upload, FlaskConical, TrendingUp, Dumbbell, Apple, Brain,
  HelpCircle, Settings,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useChatSessionStore } from '../store/useChatSessionStore';
import { useVoiceReader } from '../hooks/useVoiceReader';
import ChatMessageBubble from './chat/ChatMessageBubble';
import ChatInputArea from './chat/ChatInputArea';
import ChatSessionSidebar from './chat/ChatSessionSidebar';
import SwarmAgentPanel from './chat/SwarmAgentPanel';
import type { SwarmStep } from './chat/SwarmAgentPanel';
import type { ChatAttachment, EnhancedChatMessage, ChatAction } from '../types/chat';
import { detectIntent, extractStructuredData, commitExtraction } from '../services/chatDataRouter';
import { getPageContext, buildContextualSystemPrompt } from '../services/smartAutofill';
import { checkSwarmHealth, startSwarmTask, type SwarmHealthStatus, type SwarmTaskType } from '../services/swarmService';
import { useUsageTracker } from '../contexts/UsageTrackerContext';
import UsageLimitBanner from './shared/UsageLimitBanner';

// Icon name → component mapping for dynamic context suggestions
const ICON_MAP: Record<string, typeof Calendar> = {
  Calendar, ScanLine, ShoppingCart, Activity, Lightbulb,
  User, Heart, Target, RefreshCw, Sparkles, BarChart3,
  ChefHat, Clock, Search, Star, Repeat, List, AlertTriangle,
  Upload, FlaskConical, TrendingUp, Dumbbell, Apple, Brain,
  HelpCircle, Settings, BarChart: BarChart3,
};

interface ChatPanelProps {
  activeTab?: string;
}

export default function ChatPanel({ activeTab = 'home' }: ChatPanelProps) {
  const { addChatMessage, settings, people, currentPlan, knowledgeBase } = useStore();
  const sessionStore = useChatSessionStore();
  const usageTracker = useUsageTracker();
  const [isExpanded, setIsExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const [swarmStatus, setSwarmStatus] = useState<SwarmHealthStatus | null>(null);
  const [swarmProgress, setSwarmProgress] = useState<{ active: boolean; taskType: string; agent: string; steps: SwarmStep[] } | null>(null);

  // Check swarm availability on mount
  useEffect(() => {
    checkSwarmHealth().then(setSwarmStatus).catch(() => {});
  }, []);

  // Get active session messages
  const activeSession = sessionStore.getActiveSession();
  const messages = useMemo(() => activeSession?.messages || [], [activeSession]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { read, pause, resume, stop, isReading, isPaused } = useVoiceReader({
    autoRead: settings.voiceEnabled && settings.autoReadResponses,
    rate: settings.voiceSpeed,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ─── Send handler with attachment support ──────────────────────────────────

  const handleSend = async (text: string, attachments: ChatAttachment[], retryUserInput?: string) => {
    const userInput = retryUserInput || text;
    if (!userInput.trim() && (!attachments || attachments.length === 0)) return;

    // Usage tracking: check limit and record
    if (!usageTracker.canUse('chat')) return;
    usageTracker.recordUsage('chat');

    // Build the enhanced user message
    // Ensure we have an active session
    const sessionId = sessionStore.ensureActiveSession();

    if (!retryUserInput) {
      const userMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
        sessionId,
        attachments: attachments.length > 0 ? attachments : undefined,
        inputFormat: attachments.length > 0 ? 'file' : 'text',
      };
      sessionStore.addMessage(sessionId, userMessage);
      addChatMessage(userMessage as any); // backward compat
    }

    // Loading message — detect what tools might be used for richer feedback
    const toolHints = getToolUseHints(userInput);
    const loadingMessage: EnhancedChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: toolHints || 'Thinking...',
      timestamp: new Date().toISOString(),
      sessionId,
      status: 'sending',
    };
    sessionStore.addMessage(sessionId, loadingMessage);

    try {
      const { chatWithAssistant } = await import('../services/chatService');

      // Build enriched prompt that includes attachment descriptions
      let enrichedInput = userInput;
      if (attachments && attachments.length > 0) {
        const attachmentDescriptions = attachments.map((a) => {
          if (a.type === 'image') return `[User attached an image: ${a.name}]`;
          if (a.type === 'url') return `[User shared a URL: ${a.url}]`;
          if (a.extractedText) return `[User attached ${a.name}]\nExtracted text:\n${a.extractedText}`;
          return `[User attached a ${a.type} file: ${a.name}]`;
        }).join('\n');
        enrichedInput = `${userInput}\n\n${attachmentDescriptions}`;
      }

      const context = {
        people,
        currentPlan: currentPlan || undefined,
        knowledgeBase,
        pageContext: buildContextualSystemPrompt(activeTab),
      };

      // Run chat response and data extraction in parallel
      const intent = detectIntent(userInput, attachments);

      // Detect if this is a deep analysis query that should route to swarm
      const swarmRoute = swarmStatus?.status === 'healthy' ? detectSwarmRoute(userInput) : null;

      let response: string;
      let extractedPayload: any = null;

      if (swarmRoute) {
        // Route to NourishAI multi-agent swarm
        const agentForTask = swarmRoute.taskType.startsWith('lab') ? 'Dr. Analysis'
          : swarmRoute.taskType.startsWith('neuro') ? 'NeuroGuide'
          : swarmRoute.taskType.startsWith('fitness') || swarmRoute.taskType.startsWith('exercise') ? 'FitCoach'
          : swarmRoute.taskType.startsWith('meal') ? 'NutriChef'
          : swarmRoute.taskType.includes('report') || swarmRoute.taskType.includes('pdf') ? 'ReportGen'
          : 'NourishAI';

        setSwarmProgress({
          active: true,
          taskType: swarmRoute.taskType,
          agent: agentForTask,
          steps: [
            { agent: agentForTask, status: 'running', label: 'Analyzing your request...' },
            { agent: agentForTask, status: 'pending', label: 'Cross-referencing health data' },
            { agent: 'ReportGen', status: 'pending', label: 'Formatting response' },
          ],
        });

        sessionStore.updateMessage(sessionId, loadingMessage.id, {
          content: `🧠 **${agentForTask}** is analyzing your request...\n` + (toolHints || ''),
        });

        try {
          const swarmResult = await startSwarmTask(swarmRoute.taskType, swarmRoute.context, enrichedInput);
          response = `**${swarmResult.agentName || 'NourishAI'}** analyzed your request:\n\n${swarmResult.message}`;
          if (swarmResult.files && swarmResult.files.length > 0) {
            response += '\n\n📎 **Generated Files:**\n' +
              swarmResult.files.map(f => `• [${f.name}](/api/swarm/files/${encodeURIComponent(f.name)})`).join('\n');
          }
        } catch (swarmErr) {
          // Fallback to standard chat if swarm fails
          console.warn('[Chat] Swarm failed, falling back to standard chat:', swarmErr);
          setSwarmProgress(null);
          [response, extractedPayload] = await Promise.all([
            chatWithAssistant(enrichedInput, context),
            intent ? extractStructuredData(intent, userInput, attachments) : Promise.resolve(null),
          ]) as [string, any];
        }
        setSwarmProgress(null);
      } else {
        // Standard AI chat
        [response, extractedPayload] = await Promise.all([
          chatWithAssistant(enrichedInput, context),
          intent ? extractStructuredData(intent, userInput, attachments) : Promise.resolve(null),
        ]) as [string, any];
      }

      const assistantMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sessionId,
        originalInput: userInput,
        status: 'complete',
        extractedData: extractedPayload ? [extractedPayload] : undefined,
      };

      // Remove loading, add real response — in session store
      sessionStore.removeMessage(sessionId, loadingMessage.id);
      sessionStore.addMessage(sessionId, assistantMessage);
      addChatMessage(assistantMessage as any); // backward compat

      // Auto-read
      if (settings.voiceEnabled && settings.autoReadResponses) {
        setTimeout(() => read(response), 500);
      }
    } catch (error) {
      const errorMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        sessionId,
        originalInput: userInput,
        status: 'error',
      };
      sessionStore.removeMessage(sessionId, loadingMessage.id);
      sessionStore.addMessage(sessionId, errorMessage);
    } finally {
      setRetryingMessageId(null);
    }
  };

  const handleRetry = async (messageId: string, originalInput: string) => {
    setRetryingMessageId(messageId);
    const sid = sessionStore.activeSessionId;
    if (sid) sessionStore.removeMessage(sid, messageId);
    await handleSend(originalInput, []);
  };

  const handleSpeak = (text: string) => {
    if (isReading) { isPaused ? resume() : pause(); }
    else { read(text); }
  };

  const handleActionClick = (action: ChatAction) => {
    console.log('Action clicked:', action);
  };

  // ─── Data extraction confirmation handlers ─────────────────────────────────

  const handleConfirmExtraction = useCallback(async (messageId: string, extractionId: string) => {
    const sid = sessionStore.activeSessionId;
    if (!sid) return;

    const session = sessionStore.getActiveSession();
    const message = session?.messages.find((m) => m.id === messageId);
    if (!message?.extractedData) return;

    const payload = message.extractedData.find((d) => d.id === extractionId);
    if (!payload) return;

    const success = await commitExtraction(payload, useStore);

    sessionStore.updateMessage(sid, messageId, {
      extractedData: message.extractedData.map((d) =>
        d.id === extractionId ? { ...d, status: success ? 'confirmed' as const : 'pending' as const, confirmedAt: new Date().toISOString() } : d
      ),
    });
  }, [sessionStore]);

  const handleDismissExtraction = useCallback((messageId: string, extractionId: string) => {
    const sid = sessionStore.activeSessionId;
    if (!sid) return;

    const session = sessionStore.getActiveSession();
    const message = session?.messages.find((m) => m.id === messageId);
    if (!message?.extractedData) return;

    sessionStore.updateMessage(sid, messageId, {
      extractedData: message.extractedData.map((d) =>
        d.id === extractionId ? { ...d, status: 'dismissed' as const } : d
      ),
    });
  }, [sessionStore]);

  // Error/config detection
  const isErrorMessage = (content: string) =>
    ['⚠️', '🔑', '⏱️', '🌐', '❓', 'error', 'Error', 'offline mode'].some((s) => content.includes(s));
  const isConfigMessage = (content: string) =>
    ['configure', 'API key', 'offline mode', '.env'].some((s) => content.includes(s));

  // Dynamic quick actions based on active page
  const pageContext = useMemo(() => getPageContext(activeTab), [activeTab]);
  const quickActions = useMemo(() => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
    ];
    return pageContext.suggestedPrompts.slice(0, 3).map((sp, i) => ({
      icon: ICON_MAP[sp.icon] || Sparkles,
      label: sp.label,
      prompt: sp.prompt,
      color: gradients[i % gradients.length],
    }));
  }, [pageContext]);

  // ─── Collapsed (floating button) ──────────────────────────────────────────

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label="Open Nourish AI"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  // ─── Expanded panel ───────────────────────────────────────────────────────

  return (
    <div
      className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex transition-all duration-300 h-[32rem] overflow-hidden"
      style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)' }}
    >
      {/* Session sidebar */}
      <ChatSessionSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSessionSelect={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full"></div>
              <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400 relative z-10" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Nourish AI</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {activeSession ? activeSession.title : 'Multi-format nutrition expert'}
                {swarmStatus?.status === 'healthy' && (
                  <span className="ml-1.5 inline-flex items-center gap-1 text-purple-500">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                    NourishAI
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
              aria-label="Chat history">
              <History className="w-4 h-4" />
            </button>
            <button onClick={() => setIsExpanded(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Collapse chat">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
                <Bot className="w-16 h-16 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
              </div>
              <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Hi! I'm Nourish AI 🌿
              </p>
              <p className="text-sm mb-2">
                Send me text, images, lab reports, food labels, or any document — I'll analyze it and put the data where it belongs.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                📎 Attach files · 📷 Take photos · 🎤 Use voice · 📋 Paste images
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button key={idx}
                      onClick={() => handleSend(action.prompt, [])}
                      className={`group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 animate-fade-in`}
                      style={{ animationDelay: `${idx * 0.1}s` }}>
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  isErrorMessage={isErrorMessage(message.content)}
                  isConfigMessage={isConfigMessage(message.content)}
                  voiceEnabled={settings.voiceEnabled}
                  isReading={isReading}
                  isPaused={isPaused}
                  onSpeak={handleSpeak}
                  onStopSpeaking={stop}
                  onRetry={handleRetry}
                  retryingMessageId={retryingMessageId}
                  onActionClick={handleActionClick}
                  onConfirmExtraction={handleConfirmExtraction}
                  onDismissExtraction={handleDismissExtraction}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Swarm Agent Progress */}
        {swarmProgress?.active && (
          <div className="px-3 pb-2">
            <SwarmAgentPanel
              taskType={swarmProgress.taskType}
              steps={swarmProgress.steps}
              currentAgent={swarmProgress.agent}
              isComplete={false}
            />
          </div>
        )}

        {/* Usage limit warning */}
        <UsageLimitBanner type="chat" className="mx-3 mb-2" />

        {/* Multi-format input area */}
        <ChatInputArea onSend={handleSend} />
      </div>
    </div>
  );
}

// ─── Tool-Use Loading Hints ─────────────────────────────────────────────────
// Shows the user what data the AI is fetching in real-time

function getToolUseHints(input: string): string | null {
  const lower = input.toLowerCase();
  const hints: string[] = [];

  if (/\b(supplement|herb|adaptogen|ashwagandha|turmeric|berberine|rhodiola|lion'?s?\s*mane|echinacea|reishi|cordyceps)\b/.test(lower)) {
    hints.push('🔬 Searching supplement databases');
  }
  if (/\b(interact|safe\s*(to|with)|combin|mix|take\s*(with|together)|medication|drug|warfarin|metformin|statin)\b/.test(lower)) {
    hints.push('⚕️ Checking drug-supplement interactions');
  }
  if (/\b(study|studies|research|clinical\s*trial|evidence|pubmed|journal)\b/.test(lower)) {
    hints.push('📚 Searching PubMed & clinical trials');
  }
  if (/\b(blood\s*(work|test|panel|results?)|lab\s*(results?|report)|biomarker|hemoglobin|a1c|cholesterol|tsh|ferritin|crp)\b/.test(lower)) {
    hints.push('🩸 Analyzing biomarker data');
  }
  if (/\b(juice|juicing|smoothie|shake|recipe|blend)\b/.test(lower)) {
    hints.push('🥤 Searching recipe database');
  }
  if (/\b(nutrition|calories|protein|carbs?|macro|vitamin|mineral|nutrient)\b/.test(lower)) {
    hints.push('🥗 Querying USDA nutrition data');
  }
  if (/\b(blood\s*type|can\s+i\s+eat|should\s+i\s+eat|food.*(beneficial|avoid)|d'?adamo)\b/.test(lower)) {
    hints.push('🩸 Checking blood type food compatibility');
  }
  if (/\b(pre[\s-]*workout|post[\s-]*workout|before\s+(workout|exercise|gym)|after\s+(workout|exercise|gym)|workout\s*(food|meal|nutrition))\b/.test(lower)) {
    hints.push('💪 Looking up exercise nutrition protocols');
  }
  if (/\b(when\s+to\s+take|best\s+time|timing|supplement\s+schedule|daily\s+schedule|take.*morning|take.*bedtime)\b/.test(lower)) {
    hints.push('⏰ Checking supplement timing protocols');
  }

  if (hints.length === 0) return null;
  return hints.join('\n') + '\n\n⏳ Gathering evidence...';
}

// ─── Swarm Route Detection ──────────────────────────────────────────────────
// Detects queries that benefit from multi-agent analysis

function detectSwarmRoute(input: string): { taskType: SwarmTaskType; context: Record<string, unknown> } | null {
  const lower = input.toLowerCase();

  // Deep lab analysis patterns
  if (/\b(deep\s*analy|comprehensive\s*(lab|blood)|functional\s*range|optimal\s*range|pubmed.*(lab|blood))\b/.test(lower)) {
    return { taskType: 'lab_deep_analysis', context: { query: input } };
  }

  // Neuro research patterns
  if (/\b(neuro.*(research|protocol|recovery)|braverman.*(research|deep)|neurotransmitter.*(study|research|protocol))\b/.test(lower)) {
    return { taskType: 'neuro_research_protocol', context: { query: input } };
  }

  // Fitness analysis patterns
  if (/\b(statistical.*(workout|fitness|exercise)|plateau\s*detect|strength\s*curve|volume\s*trend|monthly.*(fitness|progress)\s*report)\b/.test(lower)) {
    return { taskType: 'fitness_analysis', context: { query: input } };
  }

  // Comprehensive health report
  if (/\b(comprehensive\s*health|full\s*health\s*report|doctor\s*visit\s*(prep|package)|cross.domain)\b/.test(lower)) {
    return { taskType: 'health_report_comprehensive', context: { query: input } };
  }

  // PDF generation requests
  if (/\b(generate|create|make|export).{0,20}(pdf|report|document)\b/.test(lower)) {
    if (/\b(lab|blood)\b/.test(lower)) return { taskType: 'lab_report_pdf', context: { query: input } };
    if (/\b(neuro|brain|braverman)\b/.test(lower)) return { taskType: 'neuro_protocol_pdf', context: { query: input } };
    if (/\b(fitness|workout|exercise)\b/.test(lower)) return { taskType: 'fitness_monthly_report', context: { query: input } };
    return { taskType: 'health_report_comprehensive', context: { query: input } };
  }

  // Meal plan validation
  if (/\b(verified\s*meal|usda.*(validate|verify)|blood\s*type.*(meal|recipe|plan))\b/.test(lower)) {
    return { taskType: 'meal_plan_verified', context: { query: input } };
  }

  // Exercise demos
  if (/\b(show\s*me\s*(how|the)\s*(to|form)|exercise\s*demo|proper\s*form|movement\s*tutorial)\b/.test(lower)) {
    return { taskType: 'exercise_demo_video', context: { query: input } };
  }

  return null;
}
