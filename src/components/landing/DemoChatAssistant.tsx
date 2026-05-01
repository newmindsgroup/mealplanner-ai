import React, { useState, useEffect } from 'react';
import { MessageCircle, Mic, Send, Sparkles } from 'lucide-react';
import { useDemo } from '../../contexts/DemoContext';

export default function DemoChatAssistant() {
  const { chatMessages } = useDemo();
  const [displayedMessages, setDisplayedMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedMessages < chatMessages.length) {
      const currentMessage = chatMessages[displayedMessages];
      
      if (currentMessage.role === 'assistant') {
        setIsTyping(true);
        const typingDelay = setTimeout(() => {
          setIsTyping(false);
          setDisplayedMessages(prev => prev + 1);
        }, 1500);
        return () => clearTimeout(typingDelay);
      } else {
        const messageDelay = setTimeout(() => {
          setDisplayedMessages(prev => prev + 1);
        }, 800);
        return () => clearTimeout(messageDelay);
      }
    }
  }, [displayedMessages, chatMessages, hasStarted]);

  const handleStartDemo = () => {
    setHasStarted(true);
    setDisplayedMessages(1);
  };

  const handleReplay = () => {
    setDisplayedMessages(0);
    setIsTyping(false);
    setHasStarted(false);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-section">
          <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full mb-4 font-semibold text-sm">
            <MessageCircle className="w-4 h-4" />
            AI Assistant
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Chat With Your <span className="gradient-text-blue">Nutrition Coach</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant answers about meal planning, nutrition, and blood type compatibility
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card-light rounded-2xl overflow-hidden shadow-2xl fade-in-section">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg">Nutrition AI Assistant</div>
                  <div className="text-sm text-white/80">Always here to help with your meal planning</div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-4 min-h-[500px] max-h-[500px] overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              {!hasStarted ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4 float-animation">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Try the AI Assistant</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    See how our AI helps you make better nutrition decisions with personalized guidance
                  </p>
                  <button
                    onClick={handleStartDemo}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all hover:shadow-lg"
                  >
                    Start Demo Conversation
                  </button>
                </div>
              ) : (
                <>
                  {chatMessages.slice(0, displayedMessages).map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                            : 'bg-white border-2 border-gray-200 text-gray-900'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs font-semibold text-cyan-600">AI Assistant</span>
                          </div>
                        )}
                        <div className="whitespace-pre-line">{message.content}</div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start fade-in">
                      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-cyan-500" />
                          <span className="text-xs font-semibold text-cyan-600">AI Assistant</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replay Button */}
                  {displayedMessages >= chatMessages.length && !isTyping && (
                    <div className="flex justify-center pt-4 fade-in">
                      <button
                        onClick={handleReplay}
                        className="text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Replay Demo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Chat Input (Demo Only - Not Functional) */}
            <div className="p-4 bg-white border-t-2 border-gray-200">
              <div className="flex items-center gap-3">
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors" disabled>
                  <Mic className="w-5 h-5 text-gray-400" />
                </button>
                <input
                  type="text"
                  placeholder="Type your message... (demo only)"
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-400 cursor-not-allowed"
                  disabled
                />
                <button className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all opacity-50 cursor-not-allowed" disabled>
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                This is a demo. Sign up to chat with the real AI assistant!
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="glass-card p-4 rounded-xl text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Instant Answers</h4>
              <p className="text-sm text-gray-600">Get immediate responses to nutrition questions</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Personalized Advice</h4>
              <p className="text-sm text-gray-600">Tailored to your blood type and goals</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center hover-lift">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Voice Enabled</h4>
              <p className="text-sm text-gray-600">Hands-free cooking mode available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

