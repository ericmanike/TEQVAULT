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
      name: ' SHOPPING',
      domain: 'teqvault.app',
      description: 'Shop  computers , laptops,smartphones,  accessories and other consumer electronics with trusted support, delivery, trade-ins, and flexible payment options.',
      href: 'https://teqvault.app',
      action: 'Shop now',
      accent: 'from-orange-500 to-amber-400'
    },
    {
      icon: GraduationCap,
      name: 'ACADEMY',
      domain: 'learn.teqvault.app',
      description: 'Learn practical technology and digital skills through accessible courses, guided learning, and resources for students, professionals, and growing businesses.',
      href: 'https://learn.teqvault.app',
      action: 'Start learning',
      accent: 'from-indigo-600 to-blue-500'
    },
    {
      icon: BriefcaseBusiness,
      name: 'SERVICES ',
      domain: 'service.teqvault.app',
      description: 'Get professional IT Solutions  for your business i.e website,  software development , cyber sec... ',
      href: 'https://service.teqvault.app',
      action: 'Explore services',
      accent: 'from-emerald-600 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-10 pb-20 mt-20 md:mt-12">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* TEQVAULT Ecosystem Section */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.24em]">The ecosystem</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950 font-outfit">
              One Brand. Three Saparate Units.
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-7">
              We bridge commerce, learning, and professional tech solutions together in one connected ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teqvaultPlatforms.map((platform, index) => (
              <motion.a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative overflow-hidden bg-white p-7 rounded-3xl border
                 border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                  hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] 
                  transition-all duration-300 flex flex-col items-start min-h-[330px]"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${platform.accent}`} />
                <div className="p-3.5 bg-slate-100 text-slate-800 rounded-2xl group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <platform.icon className="w-6 h-6" />
                </div>
                <div className="flex items-start justify-between gap-3 w-full mt-5">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 font-outfit">{platform.name}</h3>
                
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 shrink-0 transition-colors" />
                </div>
                <p className="text-slate-500 text-sm leading-6 mt-4 flex-1">{platform.description}</p>
                <span className="text-slate-900 group-hover:text-orange-600 text-sm font-bold mt-6 transition-colors">{platform.action} <span aria-hidden="true">→</span></span>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Mission & Vision Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8 md:p-10 rounded-3xl space-y-5 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-orange-500/10" />
            <div className="relative p-3 bg-orange-500/15 text-orange-400 w-fit rounded-2xl ring-1 ring-orange-400/20">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="relative text-2xl md:text-3xl font-bold font-outfit">Our Mission</h3>
            <p className="relative text-slate-300 text-sm md:text-base leading-7">
              To empower individuals and businesses in Ghana by delivering high-grade smartphones, computers, and IT infrastructure services backed by trusted warranties, transparent trade-ins, and flexible payment options.
            </p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#315477] to-[#1e3348] text-white p-8 md:p-10 rounded-3xl space-y-5 shadow-[0_16px_40px_rgba(30,51,72,0.2)]">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-cyan-300/10" />
            <div className="relative p-3 bg-white/10 text-orange-300 w-fit rounded-2xl ring-1 ring-white/15">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="relative text-2xl md:text-3xl font-bold font-outfit">Our Vision</h3>
            <p className="relative text-slate-200 text-sm md:text-base leading-7">
              To become West Africa’s most trusted multi-channel technology hub, renowned for exceptional customer experience, sustainable device recycling, and seamless digital commerce solutions.
            </p>
          </div>
        </section>

        {/* Why Choose Us / Values */}
        <section className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.05)] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-slate-950 font-outfit">
              Why Customers Choose TEQVAULT
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              Built on integrity, technical expertise, and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coreValues.map((val, idx) => (
              <div key={idx} className="group flex gap-4 items-start p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50/50 hover:border-orange-100 transition-colors">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 text-orange-600 shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base font-outfit">{val.title}</h4>
                  <p className="text-slate-500 text-sm leading-6 mt-1">{val.desc}</p>
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
