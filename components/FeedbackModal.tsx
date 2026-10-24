'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquareHeart, Send, CheckCircle2, Sparkles, User, Mail, Phone, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'General', label: 'General Experience', emoji: '🌟' },
  { id: 'Website Usability', label: 'Website & App', emoji: '💻' },
  { id: 'Product Quality', label: 'Product Quality', emoji: '📦' },
  { id: 'Pricing & Deals', label: 'Pricing & Deals', emoji: '💰' },
  { id: 'Delivery & Service', label: 'Delivery & Service', emoji: '🚚' },
  { id: 'Suggestion', label: 'Feature Suggestion', emoji: '💡' },
];

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "Poor - Needs improvement", color: "text-red-500" },
  2: { text: "Fair - Could be better", color: "text-amber-500" },
  3: { text: "Average - It's okay", color: "text-yellow-500" },
  4: { text: "Good - Very satisfied", color: "text-emerald-500" },
  5: { text: "Excellent - Absolutely loved it!", color: "text-orange-500" },
};

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('General');
  const [message, setMessage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Please share a brief message before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackPayload = {
        rating,
        category,
        message: message.trim(),
        name: name.trim() || 'Anonymous User',
        email: email.trim() || null,
        phone: phone.trim() || null,
        user_id: user?.id || null,
        status: 'new',
      };

      const { error } = await supabase.from('feedbacks').insert([feedbackPayload]);

      if (error) {
        console.warn("Supabase insert error (table may need creation):", error.message);
        // Fallback: Store locally so no customer feedback is lost
        try {
          const localQueue = JSON.parse(localStorage.getItem('teqvault_feedbacks_queue') || '[]');
          localQueue.push({ ...feedbackPayload, id: 'local_' + Date.now(), created_at: new Date().toISOString() });
          localStorage.setItem('teqvault_feedbacks_queue', JSON.stringify(localQueue));
        } catch (_) {}
      }

      setIsSubmitted(true);
      toast.success("Thank you for your valuable feedback!");

      // Auto-close after 2.5s
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        setRating(5);
        onClose();
      }, 2500);

    } catch (err: any) {
      console.error("Feedback submit error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10"
        >
          {/* Header Glow Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close feedback modal"
          >
            <X size={20} />
          </button>

          {isSubmitted ? (
            /* Success State */
            <div className="p-8 sm:p-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-inner">
                <CheckCircle2 size={44} strokeWidth={2.2} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                Feedback Received!
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Thank you for helping us make TEQVAULT the best tech destination in Ghana. Your opinion shapes our service!
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  <Sparkles size={13} className="text-amber-500" /> Closing automatically...
                </span>
              </div>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              
              {/* Title & Description */}
              <div className="space-y-1 text-left pr-8">
            
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Give Us Your Feedback
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  How was your experience  browsing TEQVAULT?
                </p>
              </div>



              {/* Feedback Category Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        category === cat.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you liked, what went wrong, or what feature you'd love to see..."
                  required
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-900 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Contact Info (Optional/Prefilled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eric Manike"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Your Email (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 focus:bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#fbcb08] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Feedback</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
