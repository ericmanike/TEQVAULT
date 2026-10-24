'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    ShoppingBag,
    Mail,
    Heart,
    Wallet,
    MapPin,
    User,
    ArrowLeft,
    LogOut,
    X
} from 'lucide-react';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

interface CustomerSidebarProps {
    onClose?: () => void;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const menuSections: MenuSection[] = [
        {
            title: 'Account & Orders',
            items: [
                { name: 'Orders', href: '/customer/orders', icon: ShoppingBag },
                { name: 'Inbox', href: '/customer/inbox', icon: Mail },
                { name: 'Saved Items', href: '/customer/wishlist', icon: Heart },
            ]
        },
        {
            title: 'Financing & Settings',
            items: [
                { name: 'Pay Small Small', href: '/customer/pay-small-small', icon: Wallet },
                { name: 'My Profile', href: '/customer/account', icon: User },
            ]
        },
        {
            title: 'Store',
            items: [
                { name: 'Back to Shop', href: '/shop', icon: ArrowLeft }
            ]
        }
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            if (onClose) onClose();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';

    return (
        <div className="w-full h-full bg-[#fcfcfc] border-r border-slate-100 flex flex-col justify-between overflow-hidden shadow-sm">
            
            {/* Header */}
            <div className="w-full p-4 px-5 flex items-center justify-between border-b border-slate-100 shadow-sm shrink-0">
                <Link 
                    href="/" 
                    onClick={onClose} 
                    className="flex items-center gap-2 select-none group"
                >
                    <span className="text-gray-800 text-[16px] font-bold logo tracking-wide">TEQVAULT</span>
                </Link>

                <div className="flex items-center gap-2">
                 
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 transition cursor-pointer rounded-full bg-slate-100 hover:bg-slate-200 text-orange-500"
                            aria-label="Close menu"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Grouped Menu Sections */}
            <div className="flex-1 py-5 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                {menuSections.map((section, sIdx) => (
                    <div key={sIdx} className="w-full flex flex-col border-b border-slate-100/80 last:border-none pb-4 last:pb-0">
                        {/* Section Title */}
                        <div className="px-5 py-1 font-bold tracking-wide text-[#1E2939] mb-2 uppercase text-[12px] opacity-70">
                            {section.title}
                        </div>

                        {/* Section Items */}
                        <div className="flex flex-col gap-2 px-3">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href) && item.href !== '/shop');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group cursor-pointer select-none ${
                                            isActive
                                                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                                                : 'text-black hover:text-orange-500 hover:bg-slate-100 shadow-2xs'
                                        }`}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                                isActive ? 'text-white' : 'text-[#1E2939] group-hover:text-orange-500'
                                            }`}
                                            strokeWidth={2}
                                        />
                                        <span className="text-[15px] font-medium tracking-wide leading-none">
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
                {/* User Info Card */}
                <div className="flex items-center gap-3 px-1">
                    <div className="w-9 h-9 bg-orange-500/10 text-orange-600 border border-orange-500/20 rounded-full flex items-center justify-center font-bold text-xs uppercase select-none shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                        <p className="text-[12px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 font-semibold rounded-xl text-xs tracking-wider uppercase cursor-pointer border border-slate-200 hover:border-red-200 active:scale-[0.98] transition-all shadow-2xs"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>

        </div>
    );
};

export default CustomerSidebar;
