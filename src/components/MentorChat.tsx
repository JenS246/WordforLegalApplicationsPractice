import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types';
import { getMentorResponse, getWelcomeMessage } from '../services/mentorService';

interface MentorChatProps {
  levelId: number;
}

export const MentorChat: React.FC<MentorChatProps> = ({ levelId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add welcome message on level change
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: `welcome-${levelId}`,
      sender: 'mentor',
      content: getWelcomeMessage(levelId),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [levelId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const response = getMentorResponse(input, levelId);
    const mentorMessage: ChatMessage = {
      id: `mentor-${Date.now()}`,
      sender: 'mentor',
      content: response,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, mentorMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-l border-slate-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Sarah</h3>
            <p className="text-slate-400 text-xs">Senior Paralegal Mentor</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-slate-600' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-3 h-3 text-white" />
                ) : (
                  <Bot className="w-3 h-3 text-white" />
                )}
              </div>
              <div className={`chat-bubble ${message.sender}`}>
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="chat-bubble mentor">
                <div className="loading-dots flex gap-1">
                  <span className="w-2 h-2 bg-white/60 rounded-full inline-block" />
                  <span className="w-2 h-2 bg-white/60 rounded-full inline-block" />
                  <span className="w-2 h-2 bg-white/60 rounded-full inline-block" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Sarah for help..."
            className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

