'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Headset, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  actionLink?: { label: string; href: string };
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
          handleSend(customEvent.detail);
        }, 300);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenAiChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAiChat);
  }, []);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = "Thank you for reaching out! Our team is available 24/7. You can also contact us directly at 054 344 2518 or support@teqvault.app.";
      let actionLink: Message['actionLink'] | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('falaa') || lower.includes('deal') || lower.includes('discount') || lower.includes('sale')) {
        aiResponseText = "🔥 Check out our Falaa Deals! We have products discounted up to 30% off across laptops, smartphones, and accessories.";
        actionLink = { label: 'View Falaa Deals', href: '/shop?deals=true' };
      } else if (lower.includes('pay small') || lower.includes('installment') || lower.includes('layaway') || lower.includes('finance')) {
        aiResponseText = "💳 With Pay Small Small, you can reserve any gadget with a flexible down payment and pay the balance in easy installments!";
        actionLink = { label: 'Explore Pay Small Small', href: '/customer/pay-small-small' };
      } else if (lower.includes('order') || lower.includes('track') || lower.includes('status') || lower.includes('shipping')) {
        aiResponseText = "📦 You can view and track your orders live in your Customer Dashboard under Orders.";
        actionLink = { label: 'My Orders', href: '/customer/orders' };
      } else if (lower.includes('location') || lower.includes('store') || lower.includes('where') || lower.includes('kumasi') || lower.includes('knust')) {
        aiResponseText = "🏪 Our store is located in Ghana. We are open Monday – Saturday from 8:00 AM to 8:00 PM.";
        actionLink = { label: 'Contact Us', href: '/contact' };
      } else if (lower.includes('contact') || lower.includes('call') || lower.includes('phone') || lower.includes('whatsapp')) {
        aiResponseText = "📞 You can call or WhatsApp us directly at 054 344 2518 or email support@teqvault.app.";
        actionLink = { label: 'Contact Page', href: '/contact' };
      } else if (lower.includes('phone') || lower.includes('laptop') || lower.includes('buy') || lower.includes('gadget')) {
        aiResponseText = "⚡ Explore our vast catalog of verified laptops, smartphones, audio, and accessories!";
        actionLink = { label: 'Browse Products', href: '/shop' };
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

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
            <Headset size={20} />
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
                  <Headset size={14} />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-sm sm:text-base font-medium leading-relaxed ${msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
              >
                <p>{msg.text}</p>
                {msg.actionLink && (
                  <a
                    href={msg.actionLink.href}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-[#632CF5] hover:bg-[#5223cb] text-white rounded-lg text-sm font-bold transition-all shadow-xs"
                  >
                    <span>{msg.actionLink.label}</span>
                  </a>
                )}
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 px-1 mt-1">{msg.time}</span>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-1 animate-pulse">
            <Headset size={14} className="text-[#632CF5]" />
            <span>AI is typing response...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-[#632CF5] text-slate-700 text-sm font-semibold transition-all border border-slate-200/60 cursor-pointer shrink-0"
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
            disabled={!input.trim()}
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