'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'orders-1',
    category: 'Orders & Shipping',
    question: 'How do I track my order?',
    answer: 'You can easily track your order by logging into your account, navigating to "My Orders" in your customer dashboard, and clicking on the tracking link provided for your order. We also send automated updates via email/SMS as your package transitions through delivery stages.'
  },
  {
    id: 'orders-2',
    category: 'Orders & Shipping',
    question: 'What are your delivery options and rates?',
    answer: 'We offer standard and express shipping across all regions in Ghana. Delivery rates are calculated based on your specific location and weight of the items, which will be dynamically displayed during checkout. We also offer free in-store pickup at our Kumasi location.'
  },
  {
    id: 'orders-3',
    category: 'Orders & Shipping',
    question: 'Can I change or cancel my order?',
    answer: 'Orders can be changed or canceled within 1 hour of placement by contacting our support team directly. Once an order is processed or has left our warehouse, we are unable to cancel or modify it.'
  },
  {
    id: 'pay-1',
    category: 'Payments & Financing',
    question: 'What is "Pay Small Small" and how does it work?',
    answer: '"Pay Small Small" is our flexible financing program. It allows you to purchase your favorite gadgets and pay in convenient weekly or monthly installments. Simply choose the option during checkout or set up a plan inside your customer profile.'
  },
  {
    id: 'pay-2',
    category: 'Payments & Financing',
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit/debit cards (Visa, MasterCard), Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money), and direct bank transfers. For in-store pickup orders, we accept point-of-sale card payments and cash.'
  },
  {
    id: 'pay-3',
    category: 'Payments & Financing',
    question: 'Are there any interest rates or hidden fees for installments?',
    answer: 'No, there are no hidden fees. All payment terms, including any applicable processing fees or interest rates associated with financing, are clearly calculated and presented upfront before you confirm your payment schedule.'
  },
  {
    id: 'sell-1',
    category: 'Selling & Trade-Ins',
    question: 'How do I sell my old gadget to TEQVAULT?',
    answer: 'Navigate to the "Start Selling" section on our navbar/sidebar. Provide detailed information about your gadget\'s condition, specifications, and upload clear photos. We will review your submission and offer you an competitive valuation quote.'
  },
  {
    id: 'sell-2',
    category: 'Selling & Trade-Ins',
    question: 'What types of gadgets do you buy?',
    answer: 'We buy laptops, smartphones, tablets, smartwatches, and select audio accessories. We accept gadgets in new, gently used, or repairable conditions.'
  },
  {
    id: 'warranty-1',
    category: 'Returns & Warranty',
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for unused products in their original packaging. Please note that return shipping costs are the responsibility of the customer unless the product is functionally defective upon arrival.'
  },
  {
    id: 'warranty-2',
    category: 'Returns & Warranty',
    question: 'Do your gadgets come with a warranty?',
    answer: 'Yes! All brand-new gadgets come with a 1-year manufacturer warranty. Refurbished and gently used items come with a 6-month store warranty covering functional defects.'
  }
];

const CATEGORIES = [
  'All',
  'Orders & Shipping',
  'Payments & Financing',
  'Selling & Trade-Ins',
  'Returns & Warranty'
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(faq => activeCategory === 'All' || faq.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-30 md:mt-15 ">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#3d5a80] mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-orange-500 " />
            Frequently Asked Questions
          </h1>

        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setExpandedId(null); // Collapse when switching categories
              }}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer select-none border ${
                activeCategory === category
                  ? 'bg-[#3d5a80] text-white border-transparent shadow-md scale-102'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-[#3d5a80]/5 hover:text-[#3d5a80]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQs List */}
        <div className="space-y-4 mb-12 min-h-[250px]">
          <AnimatePresence mode="popLayout">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => {
                const isExpanded = expandedId === faq.id;
                return (
                  <motion.div
                    key={faq.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4 font-semibold text-[#3d5a80] hover:text-orange-500 transition-colors cursor-pointer select-none"
                    >
                      <span className="text-sm md:text-base tracking-wide font-bold">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-500 shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-50">
                            <p className="font-medium">{faq.answer}</p>
                            <span className="inline-block mt-3 text-[10px] md:text-xs font-bold uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-0.5 rounded">
                              {faq.category}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1">No FAQs available</h3>
                <p className="text-gray-500 text-sm font-medium px-4">
                  We couldn't find any questions in this category. Try checking another category or contact our team!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Contact Box */}
        <div className="bg-gradient-to-r from-[#3d5a80] to-[#293f54] text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-[#3d5a80]/20">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-wide">Still have questions?</h2>
              <p className="text-[#e0f2fe] text-xs md:text-sm max-w-md font-medium leading-relaxed">
                If you can't find an answer to your query, feel free to contact our customer support team. We usually reply within 24 hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <Link
                href="/contact"
                className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-extrabold tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-97 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-white/10 mt-6 pt-5 grid grid-cols-1 sm:grid-cols-2
           gap-4 text-xs font-semibold text-[#e0f2fe]">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Phone className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Call Us: 054 344 2518 (Mon-Fri 8am-8pm)</span>
            </div>
            <div className="flex items-center gap-2 justify-center
             sm:justify-end">
              <Mail className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Email: support@teqvault.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
