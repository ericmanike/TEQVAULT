'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, X, LayoutDashboard, ShoppingBag, Tag, Users, LogOut, ShieldAlert, KeyRound, Loader2, ClipboardList, BarChart3, MessageSquareHeart
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquareHeart },
  ];

  useEffect(() => {
    function checkAdminRole() {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setDbLoading(false);
        return;
      }

      setIsAdmin(role?.toLowerCase() === 'admin');
      setDbLoading(false);
    }

    checkAdminRole();
  }, [user, role, authLoading]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 1. Loading State
  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-black">
        <div className="loader w-12 h-12 mb-4" />
        <p className="text-slate-400 font-semibold animate-pulse">Securing connection to SWAPPI ADMIN...</p>
      </div>
    );
  }

  // 2. Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-orange-500">
            <KeyRound size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Authentication</h1>
            <p className="text-slate-400 text-sm">
              Please sign in with an administrator account to access the control panel.
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }


  // 4. Authorized Admin View
  return (
    <div className="min-h-screen bg-zinc-100 text-slate-950 flex flex-col md:flex-row font-sans">
      
      {/* Desktop Sidebar - Sticky on md+ */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col p-6 space-y-8 h-screen sticky top-0 shadow-sm shrink-0">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-150">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg tracking-wider shadow-lg shadow-orange-500/30">
            A
          </div>
          <span className="font-black text-xl text-slate-900 tracking-widest uppercase">
            TEQVAULT<span className="text-orange-500 text-xs font-bold block leading-none">ADMIN PANEL</span>
          </span>
        </div>

        <nav className="flex-1 space-y-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center space-x-4 px-4 py-3 mb-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'text-black hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-[#1E2939]'} />
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-150 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase select-none">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user.user_metadata?.full_name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer border border-gray-200 hover:border-red-100"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header - Visible on <md */}
      <header className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-wider">
            A
          </div>
          <span className="font-black text-md text-slate-900 tracking-widest">TEQVAULT ADMIN</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-600 cursor-pointer border border-gray-200"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-955/40 backdrop-blur-xs z-40" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside 
            className="w-3/4 max-w-xs h-full bg-white border-r border-gray-200 flex flex-col p-6 space-y-6 shadow-2xl animate-in slide-in-from-left duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <span className="font-black text-slate-900 tracking-wider">TEQVAULT ADMIN</span>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-3.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-orange-500 text-white shadow-lg' 
                          : 'text-black hover:bg-slate-50'
                      }`}
                    >
                      <item.icon size={20} className={isActive ? 'text-white' : 'text-[#1E2939]'} />
                      <span>{item.name}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-150 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase select-none">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.user_metadata?.full_name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button  
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 font-semibold py-2 rounded-xl text-sm transition-all cursor-pointer border border-gray-200 hover:border-red-100"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
        {children}
      </main>
    </div>
  );
}
