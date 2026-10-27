'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldCheck, Truck } from 'lucide-react';

export const FirstVisitPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use versioned key so the new popup shows only on first visit
    const hasVisited = localStorage.getItem('electronicsmart_visited_v2');
    if (!hasVisited) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('electronicsmart_visited_v2', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          // onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden pointer-events-auto">

              {/* Header banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 pt-8 pb-10 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="text-4xl mb-3">🛒  💻 🎧</div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  Welcome to<br />TEQVAULT!
                </h2>
                <p className="text-orange-100 text-sm mt-1 font-medium">
                  Find the best tech for your home, office or business
                </p>
              </div>

              {/* Wave divider */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-4 relative">
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-[2rem]" />
              </div>

              {/* Perks */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                    <Zap size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Exclusive Deals Daily</p>
                    <p className="text-xs text-gray-500">Flash sales and limited offers every day on top brands.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full  flex items-center justify-center shrink-0">
                    <Truck size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Fast & Reliable Delivery</p>
                    <p className="text-xs text-gray-500">Get your gadgets delivered right to your doorstep.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Verified & Secure</p>
                    <p className="text-xs text-gray-500">All products are verified and backed by our warranty.</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleClose}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};