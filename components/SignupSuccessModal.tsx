'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Mail, ExternalLink, ArrowRight, ShieldCheck, ShoppingBag, X, Send } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import { supabase } from '@/lib/supabase';

interface SignupSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'verification_pending' | 'success';
  email: string;
  redirectTo: string;
}

// Custom lightweight particle confetti using framer-motion
const ConfettiParticle = ({ delay }: { delay: number }) => {
  const xStart = 0;
  const yStart = 0;
  
  // Randomize particle paths
  const angle = Math.random() * Math.PI * 2;
  const distance = 80 + Math.random() * 150;
  const xEnd = Math.cos(angle) * distance;
  const yEnd = -150 - Math.random() * 200;
  
  const colors = [
    '#fbcb08', // TEQVAULT yellow
    '#fb923c', // TEQVAULT orange
    '#3b82f6', // Premium blue
    '#10b981', // Success green
    '#ec4899', // Pink accent
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomSize = 6 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      initial={{ x: xStart, y: yStart, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x: [xStart, xEnd * 0.5, xEnd],
        y: [yStart, yEnd * 0.6, yEnd],
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.5],
        rotate: [0, 180, 360 + Math.random() * 360]
      }}
      transition={{
        duration: 1.5 + Math.random() * 1,
        ease: 'easeOut',
        delay: delay
      }}
      className="absolute pointer-events-none"
      style={{
        width: randomSize,
        height: randomSize,
        borderRadius: isCircle ? '50%' : '2px',
        backgroundColor: randomColor,
        left: '50%',
        top: '45%'
      }}
    />
  );
};

export default function SignupSuccessModal({ isOpen, onClose, type, email, redirectTo }: SignupSuccessModalProps) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Cooldown countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Determine webmail link based on email domain
  const getMailClientUrl = () => {
    if (!email) return 'mailto:';
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain === 'gmail.com') return 'https://mail.google.com/';
    if (['outlook.com', 'hotmail.com', 'live.com', 'msn.com'].includes(domain)) {
      return 'https://outlook.live.com/';
    }
    if (domain === 'yahoo.com') return 'https://mail.yahoo.com/';
    return 'mailto:' + email;
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendStatus('idle');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) throw error;
      setResendStatus('success');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      console.error('Error resending email:', err);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const particles = Array.from({ length: 40 });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with modern glassmorphism blur */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === 'success' ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto no-scrollbar rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 text-center shadow-2xl z-10"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Confetti Explosion for Direct Success */}
            {type === 'success' && particles.map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.015} />
            ))}

            {/* Optional Close Button for Auto-logged in success */}
            {type === 'success' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            )}

            {type === 'verification_pending' ? (
              // Case 1: Verification Required
              <div className="space-y-6">
                {/* Visual Glow Header */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-2xl bg-amber-400/20 filter blur-md"
                  />
                  <Mail className="h-8 w-8 relative z-10" strokeWidth={1.8} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
                    Verify your email
                  </h2>
                  <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    We sent a verification link to complete your account setup.
                  </p>
                </div>

                {/* Email Pill Badge */}
                <div className="mx-auto max-w-xs rounded-xl bg-slate-50 border border-slate-100 py-3 px-4 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-600 select-all truncate">
                    {email || 'your email'}
                  </span>
                </div>

                {/* Info Text */}
                <div className="text-left text-xs bg-slate-50 p-4 rounded-xl space-y-2 text-slate-500 border border-slate-100/50">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>Click the link inside the verification email to activate your account.</p>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                    <p>Make sure to check your <b>Spam</b> or <b>Updates</b> folder if it doesn't arrive shortly.</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  {/* Primary: Open Webmail */}
                  <a
                    href={getMailClientUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99]"
                  >
                    Open Mail Inbox
                    <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
                  </a>

                  {/* Secondary: Resend email */}
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || resendCooldown > 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 py-3.5 px-4 text-sm font-bold text-slate-700 transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend code in ${resendCooldown}s`
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>

                {/* Feedback Toast-like label */}
                <AnimatePresence>
                  {resendStatus === 'success' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-bold text-green-600"
                    >
                      Verification email resent successfully!
                    </motion.p>
                  )}
                  {resendStatus === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-bold text-red-500"
                    >
                      Failed to resend. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="text-center text-[13px] font-medium text-slate-500 pt-2">
                  Already verified?{' '}
                  <button
                    onClick={onClose}
                    className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors cursor-pointer"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            ) : (
              // Case 2: Auto-LoggedIn Success
              <div className="space-y-6">
                {/* Visual Glow Header */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-500 relative">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.2 }}
                    className="absolute inset-0 rounded-2xl bg-green-400/20 filter blur-md"
                  />
                  <Check className="h-8 w-8 relative z-10" strokeWidth={2.5} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
                    Welcome to TEQVAULT!
                  </h2>
                  <p className="text-sm font-medium text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    Your account has been successfully created.
                  </p>
                </div>

                {/* Features / Benefits checklist */}
                <div className="py-2 text-left space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                      <ShoppingBag size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Seamless Shopping</p>
                      <p className="text-[11px] text-gray-500">Instant access to premium electronics and gadgets at amazing prices.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Order Tracking & History</p>
                      <p className="text-[11px] text-gray-500">Real-time order statuses and shipping notifications at your convenience.</p>
                    </div>
                  </motion.div>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
