import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.ts';
import * as api from '../services/api.ts';
import { useCompany } from '../contexts/CompanyContext.tsx';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'initial-message', role: 'model', text: 'Hello! I am your Elevare financial assistant. Ask me a question about your data, like "What was my biggest expense this month?".' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { selectedCompanyId } = useCompany();

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !selectedCompanyId) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const answer = await api.processNaturalLanguageQuery(currentInput);

      const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: answer,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = { id: `err-${Date.now()}`, role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-br from-brand-primary to-brand-secondary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            aria-label="Open AI Assistant"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-full max-w-sm h-[60vh] max-h-[500px] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-40">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Finance Assistant</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Ask about your finances</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

      <div ref={chatContainerRef} role="log" className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex-shrink-0 flex items-center justify-center font-bold text-white">A</div>
            )}
            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex-shrink-0 flex items-center justify-center font-bold text-white">A</div>
             <div className="max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            aria-label="Ask the AI assistant a question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary text-gray-800 dark:text-gray-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-brand-primary text-white px-4 py-2 rounded-r-md hover:bg-brand-primary/90 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;