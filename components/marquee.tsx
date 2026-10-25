"use client";

import Link from "next/link";
import { useState } from "react";
import TextType from "./ui/TextType";
import { ArrowUpRight, Cable, BanknoteArrowUp } from "lucide-react";
import FeedbackModal from "./FeedbackModal";

const Marquee = () => {
  const [visible, setVisible] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  if (!visible) return null; // hide when closed

  return (
    <>
      <div className="flex flex-row flex-nowrap px-2.5 sm:px-6 md:px-8 gap-2 sm:gap-6 justify-between items-center bg-gray-800 text-white py-2 sm:py-2.5 md:py-3 min-h-[58px] sm:min-h-[64px] md:min-h-[70px] overflow-hidden border-b border-yellow-400">
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2.5 shrink min-w-0 overflow-hidden min-h-[38px] sm:min-h-[44px]">
          <Cable className="w-4 h-4 sm:w-5 sm:h-5 md:w-6.5 md:h-6.5 text-yellow-400 shrink-0" />  
          <div className="flex items-center min-h-[36px] sm:min-h-[40px]">
            <TextType 
              text={[
                "Shop The Best Tech Here",    
                "Latest Tech, Smartphones & Accessories",
                "Call or WhatsApp 0543442518 to place an order",
                "Unbeatable Quality & Prices"
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor
              cursorCharacter="|"
              deletingSpeed={50}
              className="text-[11px] sm:text-[14px] md:text-[16px] font-semibold leading-snug line-clamp-2"
              cursorBlinkDuration={0.5}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-5 md:gap-7 shrink-0">
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="text-yellow-400 hover:text-yellow-300 flex items-center justify-center gap-1 hover:underline font-bold transition-colors whitespace-nowrap text-[11px] sm:text-sm md:text-base cursor-pointer select-none bg-transparent border-none p-0"
          >
            <span>Give Us a Feedback</span>
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
          </button>
          <Link 
            href="/customer/pay-small-small" 
            className="text-orange-500 hover:text-orange-400 flex items-center justify-center gap-1 hover:underline font-bold transition-colors whitespace-nowrap text-[11px] sm:text-sm md:text-base"
          >
            <BanknoteArrowUp className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-yellow-400 shrink-0" />
            <span>Pay Small Small</span>
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 shrink-0" />
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
