'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Headphones, RefreshCw, Smartphone, Laptop, Wrench, Award, MapPin, Mail, Phone, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const businessActivities = [
    {
      icon: Smartphone,
      title: 'Premium Consumer Electronics',
      description: 'We stock authentic smartphones, tablets, laptops, gaming gear, and tech accessories from leading worldwide brands with full warranty coverage.'
    },
    {
      icon: RefreshCw,
      title: 'Gadget Trade-In & Buyback',
      description: 'Customers can sell or trade in their gently-used devices for instant cash or store credit with transparent valuation and fast payment processing.'
    },
    {
      icon: Wrench,
      title: 'Professional IT & Device Repairs',
      description: 'Certified technician repairs for laptops, smartphones, screen replacements, logic board diagnostics, software installations, and hardware upgrades.'
    },
    {
      icon: ShieldCheck,
      title: 'Flexible Pay Small Small Financing',
      description: 'Empowering customers to acquire high-grade electronics with convenient weekly or monthly installment payment schedules tailored for all budgets.'
    }
  ];

  const coreValues = [
    {
      title: 'Authenticity Guarantee',
      desc: '100% genuine products directly sourced from verified original manufacturers and authorized distributors.'
    },
    {
      title: 'Customer-First Service',
      desc: 'Dedicated technical support, prompt assistance, and transparent policies focused on complete customer satisfaction.'
    },
    {
      title: 'Competitive Pricing',
      desc: 'Affordable market prices alongside flexible payment solutions so quality technology is accessible to everyone.'
    },
    {
      title: 'Fast & Secure Delivery',
      desc: 'Nationwide shipping across Ghana with safe packaging, real-time tracking, and convenient pickup points.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              About TEQVAULT
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight font-outfit">
              Your Complete Hub for Electronics & Professional IT Solutions
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium mt-4">
              TEQVAULT is a premier Ghanaian electronics retailer and tech service provider located in Kumasi, KNUST. We bridge the gap between quality technology and everyday affordability through curated products, trade-in programs, and flexible payment plans.
            </p>
          </motion.div>
        </section>

        {/* Business Activities Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase">
              Our Core Business Activities
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              Providing end-to-end gadget services for individuals, professionals, and corporate organizations across Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessActivities.map((act, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start space-y-3"
              >
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                  <act.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{act.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{act.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission & Vision Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="p-3 bg-orange-500/20 text-orange-400 w-fit rounded-xl">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold">Our Mission</h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              To empower individuals and businesses in Ghana by delivering high-grade smartphones, computers, and IT infrastructure services backed by trusted warranties, transparent trade-ins, and flexible payment options.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#3d5a80] to-[#293f54] text-white p-8 rounded-3xl space-y-4 shadow-xl">
            <div className="p-3 bg-white/10 text-orange-400 w-fit rounded-xl">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold">Our Vision</h3>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              To become West Africa’s most trusted multi-channel technology hub, renowned for exceptional customer experience, sustainable device recycling, and seamless digital commerce solutions.
            </p>
          </div>
        </section>

        {/* Why Choose Us / Values */}
        <section className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase">
              Why Customers Choose TEQVAULT
            </h2>
            <p className="text-slate-500 text-sm">
              Built on integrity, technical expertise, and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{val.title}</h4>
                  <p className="text-slate-600 text-sm mt-1">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Physical Store & Contact Banner */}
        <section className="bg-orange-500 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black">Visit Our Store or Shop Online</h2>
            <p className="text-orange-100 text-sm md:text-base max-w-xl">
              Have questions about products, financing, or IT repairs? Our expert team is ready to assist you in person or online.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start text-xs font-semibold text-white">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Ghana</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> 054 344 2518</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> support@teqvault.app</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/shop"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold text-center uppercase tracking-wider transition-all"
            >
              Browse Shop
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-white text-orange-600 hover:bg-slate-100 rounded-xl text-sm font-bold text-center uppercase tracking-wider transition-all"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
