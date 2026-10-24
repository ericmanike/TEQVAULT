'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerSidebar from "@/components/CustomerSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

    // Prevent body scrolling when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileSidebarOpen]);

    return (
        <div className="min-h-screen bg-slate-50 relative">
         
            
            <div className="w-full mx-auto">
                {/* Mobile Top Navigation Bar */}
                <div className="md:hidden flex items-center justify-between bg-white px-5 py-4 shadow-md mb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="logo text-base font-extrabold">TEQVAULT</span>
                    </div>
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <Menu size={18} />
                        <span>Menu</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[264px_1fr] gap-4 md:gap-6 min-h-screen">
                    {/* Desktop Sidebar (Always visible on large screens, hidden on mobile) */}
                    <aside className="hidden md:block h-screen sticky top-0 flex-shrink-0">
                        <CustomerSidebar />
                    </aside>

                    {/* Mobile Drawer Sidebar */}
                    <AnimatePresence>
                        {isMobileSidebarOpen && (
                            <div className="fixed inset-0 z-[100] md:hidden flex">
                                {/* Backdrop overlay */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                />
                                
                                {/* Drawer Panel */}
                                <motion.div 
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                                    className="relative flex flex-col w-[280px] max-w-[85%] h-full bg-[#fcfcfc] shadow-2xl z-10 overflow-hidden"
                                >
                                    <CustomerSidebar onClose={() => setIsMobileSidebarOpen(false)} />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <main className="overflow-hidden  relative p-4">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
