'use client';

import React, { useState, useEffect, useRef } from 'react';
import { findWorkingModel, generateChatResponse, streamChatResponse } from '@/lib/gemini';
import { Bot, X, Send, Brain, MessageSquare, Loader2 } from 'lucide-react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initModel() {
      const workingModel = await findWorkingModel();
      setModel(workingModel);
    }
    initModel();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const userMessage = { role: 'user' as const, parts: [{ text: currentInput }] };
    
    // Save current history BEFORE updating state
    const currentHistory = [...messages];
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const activeModel = model || "gemini-1.5-flash";
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: activeModel,
          prompt: currentInput,
          history: currentHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error occurred');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev, 
        { role: 'model' as const, parts: [{ text: data.text }] }
      ]);

    } catch (error: any) {
      console.error('Chat error detail:', error);
      setMessages((prev) => [
        ...prev, 
        { role: 'model' as const, parts: [{ text: `Error: ${error.message || 'Check your internet connection or API key quota.'}` }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-auto flex items-center">
                <img src="/web_logo.png" alt="Logo" className="h-full w-auto object-contain" />
              </div>
              <span className="font-semibold">NeuroCare Assistant</span>
            </div>
            <div className="text-xs bg-blue-500 px-2 py-1 rounded">
              Online
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 mt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Hello! I'm your NeuroCare assistant. How can I help you today?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm md:text-base ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-none shadow-sm text-left'
                  }`}
                >
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.parts[0].text === '' && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-black dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="font-medium">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
