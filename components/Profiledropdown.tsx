"use client"
import React, { useState } from "react"
import { LogOut, User, Banknote, ChevronDown, ChevronUp, ShoppingBag, Heart, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "./AuthContext"

export default function DropdownProfile() {
  const router = useRouter();
  const { user, role, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="px-4 py-2 md:py-2 bg-orange-500 text-white rounded-full cursor-pointer text-base md:text-sm font-bold hover:bg-orange-600 transition"
      >
        Sign In
      </button>
    );
  }

  // Parse initials from user metadata or email
  const getInitials = () => {
    if (user.user_metadata?.full_name) {
      const parts = user.user_metadata.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user.email) {
      const emailName = user.email.split('@')[0];
      if (emailName.length >= 2) {
        return emailName.substring(0, 2).toUpperCase();
      }
      return emailName.charAt(0).toUpperCase();
    }
    return 'EH'; // Fallback
  };

  const initials = getInitials();

  return (
    <DropdownMenu modal={false} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 focus:outline-none cursor-pointer group">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-[#e52e2e] hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition shadow-sm select-none">
            {initials}
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-700 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-700 transition-transform duration-200" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-[100] mt-2 mr-1"
      >
        {/* User preview header */}
        <div className="px-3.5 py-2.5 mb-1.5 border-b border-gray-100 bg-slate-50/80 rounded-xl">
          <p className="text-sm font-bold text-gray-900 truncate">
            {user.user_metadata?.full_name || 'My Account'}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          {role && (
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {role}
            </span>
          )}
        </div>

        {role?.toLowerCase() === 'admin' && (
          <DropdownMenuItem 
            className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-orange-600 focus:bg-orange-50 focus:text-orange-600 cursor-pointer transition-colors outline-hidden border-none" 
            onClick={() => router.push('/admin')}
          >
            <Shield className="size-5 sm:size-4 text-orange-500" strokeWidth={1.5} />
            <span className="font-semibold text-[15px] sm:text-[14px]">Admin Panel</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/account')}
        >
          <User className="size-5 sm:size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[15px] sm:text-[14px]">My Account</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/orders')}
        >
          <ShoppingBag className="size-5 sm:size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[15px] sm:text-[14px]">My Orders</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/wishlist')}
        >
          <Heart className="size-5 sm:size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[15px] sm:text-[14px]">Wishlist</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/pay-small-small')}
        >
          <Banknote className="size-5 sm:size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[15px] sm:text-[14px]">Installment</span>
        </DropdownMenuItem>

        <div className="my-1 border-t border-gray-100" />

        <DropdownMenuItem 
          className="flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-[#e52e2e] focus:bg-red-50 focus:text-[#e52e2e] cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => handleLogout()}
        >
          <LogOut className="size-5 sm:size-4 text-[#e52e2e]" strokeWidth={1.5} />
          <span className="font-semibold text-[15px] sm:text-[14px]">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}