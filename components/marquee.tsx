"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowUpRight, BanknoteArrowUp } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

const Marquee = () => {
  const [visible, setVisible] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  if (!visible) return null; // hide when closed

  return (
    <>
      <div className="flex flex-row flex-nowrap w-full px-2.5 sm:px-6 md:px-8 justify-around items-center bg-gray-800 text-white py-2 sm:py-2.5 md:py-3 min-h-[48px] sm:min-h-[52px] md:min-h-[56px] overflow-hidden border-b border-yellow-400">
        <div className="flex items-center justify-around w-full">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-yellow-400 hover:text-yellow-300 flex items-center justify-center gap-1 hover:underline font-bold transition-colors whitespace-nowrap text-[12px] sm:text-sm md:text-base cursor-pointer select-none bg-transparent border-none p-0"
          >
            <span>Give Us a Feedback</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          </button>
          <Link 
            href="/customer/pay-small-small" 
            className="text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 hover:underline font-bold transition-colors whitespace-nowrap text-[12px] sm:text-sm md:text-base"
          >
            <BanknoteArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-yellow-400 shrink-0" />
            <span>Pay Small Small</span>
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          </Link>
        </div>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default Marquee;
