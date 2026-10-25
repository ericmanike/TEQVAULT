import React from 'react';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, PackageCheck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | TEQVAULT',
  description: 'Review the Return and Refund Policy for TEQVAULT. Information on returns, replacements, warranty claims, and refund timelines for electronics.',
  alternates: {
    canonical: `${siteUrl}/refund-policy`,
  },
  openGraph: {
    title: 'Return & Refund Policy | TEQVAULT',
    description: 'Review the Return and Refund Policy for TEQVAULT. Information on returns, replacements, warranty claims, and refund timelines for electronics.',
    url: `${siteUrl}/refund-policy`,
    siteName: 'TEQVAULT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Return & Refund Policy | TEQVAULT',
    description: 'Review the Return and Refund Policy for TEQVAULT. Information on returns, replacements, warranty claims, and refund timelines for electronics.',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Header */}
      <div className="relative bg-blue-600 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4 z-10">
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit">
            Return & Refund Policy
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* 7-Day Guarantee Callout */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-xl flex gap-4 items-start border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
            <p className="font-extrabold text-slate-900 text-base">7-Day Hassle-Free Returns</p>
            <p>
              If your device arrives with factory defects, transit damage, or does not match your ordered specifications, TEQVAULT offers a straightforward 7-day return or exchange policy.
            </p>
          </div>
        </div>

        {/* 3-Step Process Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 font-extrabold flex items-center justify-center mx-auto text-sm">1</div>
            <h3 className="font-bold text-slate-900 text-sm">Contact Support</h3>
            <p className="text-xs text-slate-500">Reach out via phone or email within 7 days with your receipt.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 font-extrabold flex items-center justify-center mx-auto text-sm">2</div>
            <h3 className="font-bold text-slate-900 text-sm">Inspection</h3>
            <p className="text-xs text-slate-500">Drop off at our store in Ghana or dispatch via courier for technical check.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 font-extrabold flex items-center justify-center mx-auto text-sm">3</div>
            <h3 className="font-bold text-slate-900 text-sm">Refund / Replacement</h3>
            <p className="text-xs text-slate-500">Receive full refund to original payment method or instant exchange.</p>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
              <h2 className="text-xl font-bold text-slate-900">Return Eligibility Requirements</h2>
            </div>
            <p className="text-slate-600">To qualify for a return or replacement, the product must meet all criteria:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Item returned within <strong>7 calendar days</strong> from delivery or pick-up date.</li>
              <li>Item must be complete with original box, manuals, accessories, and receipt.</li>
              <li>Device must be free of physical drop damage, water damage, power surge burns, or altered serial numbers.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
              <h2 className="text-xl font-bold text-slate-900">Refund Processing Timelines</h2>
            </div>
            <p className="text-slate-600">Following successful technical inspection:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Mobile Money & Card Refunds:</strong> Reversals are processed via Paystack directly to your original MoMo or card account within <strong>3 to 5 business days</strong>.</li>
              <li><strong>Immediate Store Credit:</strong> Optional instant store credit or replacement item exchange available on request.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">3</span>
              <h2 className="text-xl font-bold text-slate-900">Non-Refundable Items & Services</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Custom technical repair labor, motherboard diagnostics, or software flashing after work completion.</li>
              <li>Single-use accessories with broken seal packaging (e.g. screen protectors or opened ear tips).</li>
              <li>Devices modified by unauthorized third-party technicians after delivery.</li>
            </ul>
          </section>

          {/* Contact Box */}
          <div className="p-6 bg-orange-500 text-white rounded-2xl space-y-2">
            <h3 className="font-bold text-base "> For Returns</h3>
            <p className="text-xs ">Call Support: 054 344 2518 | Email: support@teqvault.app</p>

          </div>

        </div>

        {/* Related Navigation Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600 px-2">
          <Link href="/terms" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span>View Terms of Service</span>
            <ArrowRight size={14} />
          </Link>
          <Link href="/contact" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span>Contact Customer Support</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
