import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, VolumeX, ScanLine, ShoppingCart, Calendar, X, Pause, Play, Bot, User, MessageCircle, RefreshCw, Settings } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useVoiceReader } from '../hooks/useVoiceReader';
import VoiceInput from './VoiceInput';
import LoadingSpinner from './LoadingSpinner';

// Simple markdown-to-HTML converter for better message formatting
function formatMarkdown(text: string): JSX.Element {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${key++}`} className="list-disc list-inside space-y-1 my-2 ml-2">
          {currentList.map((item, i) => (
            <li key={i} className="text-sm">{item}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, i) => {
    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      currentList.push(line.trim().substring(1).trim());
      return;
    }

    // Flush list before non-list content
    flushList();

    // Headers
    if (line.startsWith('###')) {
      elements.push(
        <h4 key={`h4-${key++}`} className="font-semibold text-sm mt-3 mb-1">
          {line.substring(3).trim()}
        </h4>
      );
    } else if (line.startsWith('##')) {
      elements.push(
        <h3 key={`h3-${key++}`} className="font-bold text-base mt-3 mb-2">
          {line.substring(2).trim()}
        </h3>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold lines
      elements.push(
        <p key={`bold-${key++}`} className="font-bold text-sm my-1">
          {line.substring(2, line.length - 2)}
        </p>
      );
    } else if (line.trim() === '') {
      // Empty line
      elements.push(<div key={`space-${key++}`} className="h-2" />);
    } else {
      // Handle inline formatting
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\`(.*?)\`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">$1</code>');
      
      elements.push(
        <p 
          key={`p-${key++}`} 
          className="text-sm my-1"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}

export default function ChatPanel() {
  const { chatMessages, addChatMessage, settings, people, currentPlan, knowledgeBase } = useStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { read, pause, resume, stop, isReading, isPaused } = useVoiceReader({
    autoRead: settings.voiceEnabled && settings.autoReadResponses,
    rate: settings.voiceSpeed,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (retryUserInput?: string) => {
    const userInput = retryUserInput || input;
    if (!userInput.trim()) return;

    // Only add user message if not retrying
    if (!retryUserInput) {
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: userInput,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(userMessage);
      setInput('');
    }

    // Show loading message with spinner
    const loadingMessage = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: 'Thinking...',
      timestamp: new Date().toISOString(),
    };
    addChatMessage(loadingMessage);

    try {
      // Import chat service
      const { chatWithAssistant } = await import('../services/chatService');
      
      const context = {
        people,
        currentPlan: currentPlan || undefined,
        knowledgeBase: knowledgeBase,
      };

      const response = await chatWithAssistant(userInput, context);

      // Remove loading message and add actual response
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
        originalInput: userInput, // Store for retry
      };
      
      addChatMessage(assistantMessage);
      
      // Auto-read response if voice is enabled
      if (settings.voiceEnabled && settings.autoReadResponses) {
        setTimeout(() => {
          read(response);
        }, 500);
      }
      
      // Remove loading message
      const { chatMessages: currentMsgs } = useStore.getState();
      useStore.setState({
        chatMessages: currentMsgs.filter((m) => m.id !== loadingMessage.id),
      });
    } catch (error) {
      // Remove loading message and add error
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
        originalInput: userInput, // Store for retry
      });
      
      // Remove loading message
      const { chatMessages: currentMsgs } = useStore.getState();
      useStore.setState({
        chatMessages: currentMsgs.filter((m) => m.id !== loadingMessage.id),
      });
    } finally {
      setRetryingMessageId(null);
    }
  };

  const handleRetry = async (messageId: string, originalInput: string) => {
    setRetryingMessageId(messageId);
    
    // Remove the error message
    const { chatMessages: currentMsgs } = useStore.getState();
    useStore.setState({
      chatMessages: currentMsgs.filter((m) => m.id !== messageId),
    });
    
    // Retry the request
    await handleSend(originalInput);
  };

  const handleSpeak = (text: string) => {
    if (isReading) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      read(text);
    }
  };

  const quickActions = [
    { icon: ScanLine, label: 'Scan Label', action: () => setInput('Analyze this supplement label'), color: 'from-blue-500 to-cyan-500' },
    { icon: ShoppingCart, label: 'Grocery List', action: () => setInput('Show my grocery list'), color: 'from-green-500 to-emerald-500' },
    { icon: Calendar, label: 'View Plan', action: () => setInput('Show my weekly meal plan'), color: 'from-purple-500 to-pink-500' },
  ];

  // Check if message contains error indicators
  const isErrorMessage = (content: string) => {
    return content.includes('⚠️') || 
           content.includes('🔑') || 
           content.includes('⏱️') || 
           content.includes('🌐') || 
           content.includes('❓') ||
           content.includes('error') ||
           content.includes('Error') ||
           content.includes('offline mode');
  };

  const isConfigMessage = (content: string) => {
    return content.includes('configure') || 
           content.includes('API key') ||
           content.includes('offline mode') ||
           content.includes('.env');
  };

  // Floating button when collapsed
  if (!isExpanded) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
              {chatMessages.length}
            </span>
          )}
        </button>
      </>
    );
  }

  return (
    <div 
      className={`border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex flex-col transition-all duration-300 ${
        isExpanded ? 'h-[32rem]' : 'h-0'
      }`}
      style={{ boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)' }}
    >
      {/* Collapsible Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-400/20 blur-xl rounded-full"></div>
            <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400 relative z-10" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          aria-label="Collapse chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12 animate-fade-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
              <Bot className="w-16 h-16 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
            </div>
            <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Start a conversation with your AI assistant!
            </p>
            <p className="text-sm mb-6">Ask about meal planning, nutrition, or supplements...</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 animate-fade-in`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message, idx) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={`flex items-start gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 transition-all duration-200 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white'
                        : isErrorMessage(message.content)
                        ? 'bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100 border border-red-200 dark:border-red-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {message.content === 'Thinking...' ? (
                      <div className="flex items-center gap-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm font-medium">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        {/* Format markdown content */}
                        {formatMarkdown(message.content)}
                        
                        {/* Action buttons for assistant messages */}
                        {message.role === 'assistant' && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
                            {/* Voice controls */}
                            {settings.voiceEnabled && !isErrorMessage(message.content) && (
                              <>
                                <button
                                  onClick={() => handleSpeak(message.content)}
                                  className={`text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                                    isReading && !isPaused
                                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {isReading ? (
                                    isPaused ? (
                                      <>
                                        <Play className="w-3.5 h-3.5" />
                                        Resume
                                      </>
                                    ) : (
                                      <>
                                        <Pause className="w-3.5 h-3.5" />
                                        Pause
                                      </>
                                    )
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5" />
                                      Read
                                    </>
                                  )}
                                </button>
                                {isReading && (
                                  <button
                                    onClick={stop}
                                    className="text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                  >
                                    <VolumeX className="w-3.5 h-3.5" />
                                    Stop
                                  </button>
                                )}
                              </>
                            )}
                            
                            {/* Retry button for error messages */}
                            {(isErrorMessage(message.content) || isConfigMessage(message.content)) && (message as any).originalInput && (
                              <button
                                onClick={() => handleRetry(message.id, (message as any).originalInput)}
                                disabled={retryingMessageId === message.id}
                                className="text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${retryingMessageId === message.id ? 'animate-spin' : ''}`} />
                                {retryingMessageId === message.id ? 'Retrying...' : 'Retry'}
                              </button>
                            )}
                            
                            {/* Config button for offline/config messages */}
                            {isConfigMessage(message.content) && (
                              <button
                                onClick={() => {
                                  // Navigate to settings or show config modal
                                  setInput('How do I configure my API key?');
                                }}
                                className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                Setup Guide
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Modern Input Area */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center gap-3">
          <VoiceInput
            onTranscript={(text) => {
              setInput(text);
              setIsListening(false);
            }}
            isListening={isListening}
            onToggle={() => setIsListening(!isListening)}
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about meal planning, nutrition, or supplements..."
              className="input pr-12"
            />
            {input.trim() && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="btn btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            aria-label="Send message"
          >
            <Send className={`w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
          </button>
        </div>
      </div>
    </div>
  );
}
