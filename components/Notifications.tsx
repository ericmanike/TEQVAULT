'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Send, MessageSquareText, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface NotificationsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ChatProductCard {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount?: number;
  slug: string;
  image: string;
  stock: number;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  actionLink?: { label: string; href: string };
  products?: ChatProductCard[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: "Hello! 👋 Welcome to TEQVAULT AI Support Consultant. I can help you find products, track orders, check Falaa Deals, or explain Pay Small Small layaway financing. How can I assist you today?",
    time: 'Just now',
  },
];

const SUGGESTIONS = [
  { label: '🔥 Falaa Deals', prompt: 'Tell me about discounted products on Falaa Deals' },
  { label: '💳 Pay Small Small', prompt: 'How does Pay Small Small layaway work?' },
  { label: '📦 Order Status', prompt: 'How can I check or track my order?' },
  { label: '🏪 Store Location', prompt: 'Where is your physical store located?' },
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleSendRef = useRef<(textToSend?: string) => Promise<void>>(async () => {});

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOpenAiChat = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail === 'string') {
        setTimeout(() => {
          handleSendRef.current(customEvent.detail);
        }, 300);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenAiChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAiChat);
  }, [setIsOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const apiMessages = nextMessages
        .filter((m) => m.id !== '1')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to get response');
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'I could not process that request right now.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: data.actionLink,
        products: data.products,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat request failed:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I ran into a temporary issue connecting to our assistant. You can still reach our team directly at 054 344 2518 or support@teqvault.app.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: { label: 'Contact Support', href: '/contact' },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  handleSendRef.current = handleSend;

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div
      className={`${isOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[420px] fixed top-0 right-0 inset-y-0 h-full flex flex-col bg-white z-[60] transition-all duration-300 ease-in-out shadow-2xl border-l border-slate-100`}
      ref={panelRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#632CF5] flex items-center justify-center text-white shadow-md shadow-[#632CF5]/30">
            <MessageSquareText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">AI Support Consultant</h2>
              <span className="flex h-2 w-2 relative">
                <span className=" absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span> 
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Online · Shopping & Support</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            title="Reset Chat"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 no-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#632CF5] text-white flex items-center justify-center shrink-0 mt-1 shadow-sm text-xs">
                  <MessageSquareText size={14} />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-sm sm:text-base font-medium leading-relaxed ${msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {msg.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-slate-100"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-extrabold text-[#632CF5]">
                              {formatCurrency(product.price)}
                            </span>
                            {product.discount && product.discount > 0 ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
                                -{product.discount}%
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {msg.actionLink && (
                  <Link
                    href={msg.actionLink.href}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-[#632CF5] hover:bg-[#5223cb] text-white rounded-lg text-sm font-bold transition-all shadow-xs"
                  >
                    <span>{msg.actionLink.label}</span>
                  </Link>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 px-1 mt-1">{msg.time}</span>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-1 animate-pulse">

            <span> typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            disabled={isTyping}
            onClick={() => handleSend(s.prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-[#632CF5] text-slate-700 text-sm font-semibold transition-all border border-slate-200/60 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-50 border border-slate-700 rounded-xl px-3 py-1.5 shadow-xs"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            style={{
              fontSize: '16px',
              outline: 'none',
              border: 'none',
              borderWidth: '0px',
              borderStyle: 'none',
              boxShadow: 'none',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
            className="no-border flex-1 bg-transparent py-2 text-[16px] text-slate-800 border-0 border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-[#632CF5] hover:bg-[#5223cb] disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationsPanel;