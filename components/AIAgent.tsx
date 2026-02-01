
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import AlmarkyVectorLogo from './AlmarkyVectorLogo';

const AlmarkyAIAgent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>(() => {
    const saved = sessionStorage.getItem('almarky_ai_messages');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: "Assalam-o-Alaikum! Welcome to Almarky Pakistan. How can I help you today?" }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenTrigger = () => setIsOpen(true);
    window.addEventListener('open-almarky-ai', handleOpenTrigger);
    return () => window.removeEventListener('open-almarky-ai', handleOpenTrigger);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('almarky_ai_messages', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
          parts: [{ text: m.text }],
          role: m.role
        })),
        config: {
          systemInstruction: `
            You are "Almarky Support Bot", the virtual face of Almarky.pk (Pakistan's Premium Gadget Store).
            - TONE: Professional, friendly, helpful. Use basic Urdu/Roman-Urdu occasionally (e.g., "Ji", "Bilkul").
            - POLICIES: 100% Cash on Delivery (COD). Shipping in 2-5 days. Karachi warehouse.
            - CONTACT: WhatsApp 03271452389 for human support.
            - NO internal admin talk or technical keys revelation.
          `,
          temperature: 0.8,
        }
      });

      const aiText = response.text || "I apologize, I'm experiencing a connection issue. Please contact us on WhatsApp!";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Support is currently busy. Please contact 0327-1452389 via WhatsApp for instant help!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[110]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center border-4 border-white active-press ${isOpen ? 'bg-slate-900 text-white rotate-90 scale-110' : 'bg-blue-600 text-white'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-0 w-[88vw] md:w-[380px] h-[70vh] max-h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-400">
          <header className="bg-slate-900 p-5 text-white flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-white/20">
              <AlmarkyVectorLogo className="w-full h-full" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Almarky Support</h4>
              <p className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter mt-1">AI Agent Live</p>
            </div>
          </header>

          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-5 space-y-4 bg-slate-50/30 custom-scrollbar"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your query..."
                className="flex-grow bg-transparent px-4 py-2.5 text-xs font-bold outline-none"
              />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-slate-900 text-white p-2.5 rounded-lg active-press disabled:opacity-20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlmarkyAIAgent;
