'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, MapPin, Mail, Phone, Users, CheckCircle2, GraduationCap, BriefcaseBusiness, ShoppingBag, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
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

  const teqvaultPlatforms = [
    {
      icon: ShoppingBag,
      name: 'TEQVAULT Commerce',
      description: 'Shop authentic smartphones, laptops, accessories, gaming gear, and other consumer electronics with trusted support, delivery, trade-ins, and flexible payment options.',
      href: 'https://teqvault.app',
      action: 'Shop now'
    },
    {
      icon: GraduationCap,
      name: 'TEQVAULT Academy',
      description: 'Learn practical technology and digital skills through accessible courses, guided learning, and resources for students, professionals, and growing businesses.',
      href: 'https://learn.teqvault.app',
      action: 'Start learning'
    },
    {
      icon: BriefcaseBusiness,
      name: 'TEQVAULT Services',
      description: 'Get professional device repairs, IT support, installations, upgrades, and technology solutions for individuals, teams, and organizations.',
      href: 'https://service.teqvault.app',
      action: 'Explore services'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* TEQVAULT Ecosystem Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase">
              One Brand. Three Ways to Move Forward.
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              TEQVAULT brings commerce, learning, and professional technology support together in one connected ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teqvaultPlatforms.map((platform, index) => (
              <motion.a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col items-start"
              >
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                  <platform.icon className="w-6 h-6" />
                </div>
                <div className="flex items-start justify-between gap-3 w-full mt-4">
                  <h3 className="text-lg font-bold text-slate-800">{platform.name}</h3>
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 shrink-0 transition-colors" />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mt-2 flex-1">{platform.description}</p>
                <span className="text-orange-600 text-sm font-bold mt-5">{platform.action} →</span>
              </motion.a>
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
