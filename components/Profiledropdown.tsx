"use client"
import React, { useState } from "react"
import { LogOut, User,Banknote, ChevronDown, ChevronUp, ShoppingBag, Heart } from "lucide-react"
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
  const { user, loading, signOut } = useAuth();
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
          <div className="w-8 h-8 md:w-9 md:h-9 bg-[#e52e2e] hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-[14px] md:text-[14px] transition shadow-sm select-none">
            {initials}
          </div>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-700 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-700 transition-transform duration-200" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 z-[100] mt-2 mr-2"
      >
        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/orders')}
        >
          <ShoppingBag className="size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[14px]">My Orders</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/wishlist')}
        >
          <Heart className="size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[14px]">Saved Items</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 focus:bg-slate-50 focus:text-gray-700 cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => router.push('/customer/pay-small-small')}
        >
          <Banknote className="size-4 text-gray-500" strokeWidth={1.5} />
          <span className="font-semibold text-[14px]"> Installment </span>
        </DropdownMenuItem>

      
        
   

        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#e52e2e] focus:bg-red-50 focus:text-[#e52e2e] cursor-pointer transition-colors outline-hidden border-none" 
          onClick={() => handleLogout()}
        >
          <LogOut className="size-4 text-[#e52e2e]" strokeWidth={1.5} />
          <span className="font-semibold text-[14px]">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}