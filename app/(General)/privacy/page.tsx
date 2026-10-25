import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server, UserCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app';

export const metadata: Metadata = {
  title: 'Privacy Policy | TEQVAULT',
  description: 'Learn how TEQVAULT collects, protects, and handles your personal data, transaction information, and privacy when shopping for electronics online.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | TEQVAULT',
    description: 'Learn how TEQVAULT collects, protects, and handles your personal data, transaction information, and privacy when shopping for electronics online.',
    url: `${siteUrl}/privacy`,
    siteName: 'TEQVAULT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | TEQVAULT',
    description: 'Learn how TEQVAULT collects, protects, and handles your personal data, transaction information, and privacy when shopping for electronics online.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Header */}
      <div className="relative bg-blue-600 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4 z-10">
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit">
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* Security Commitment Box */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-xl flex gap-4 items-start border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
            <p className="font-extrabold text-slate-900 text-base">Your Data Security Commitment</p>
            <p>
              At TEQVAULT, we safeguard your personal data strictly in accordance with Ghana's Data Protection Act, 2012 (Act 843). We do not sell or monetize your personal information.
            </p>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
              <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
            </div>
            <p className="text-slate-600">
              We collect information required to fulfill orders, process trade-ins, and manage installment financing agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Contact Details:</strong> Full name, email address, phone number, and physical shipping address.</li>
              <li><strong>Verification Records:</strong> Ghana Card or identification details required for financing or device trade-in validations.</li>
              <li><strong>Technical Data:</strong> Browser session information and secure authentication cookies.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
              <h2 className="text-xl font-bold text-slate-900">Payment Security & Paystack Processing</h2>
            </div>
            <p className="text-slate-600">
              All financial transactions (Mobile Money & Cards) are processed securely through <strong>Paystack Payments Limited</strong>, a PCI-DSS Level 1 certified gateway.
            </p>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-slate-800 text-xs sm:text-sm">
              <p className="font-bold text-orange-950 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-orange-500" />
                Zero Sensitive Payment Storage:
              </p>
              <p className="mt-1 text-slate-700">
                TEQVAULT never stores, sees, or logs raw credit card numbers or Mobile Money PINs. All authorization takes place directly within Paystack’s encrypted network.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">3</span>
              <h2 className="text-xl font-bold text-slate-900">How We Use Your Data</h2>
            </div>
            <p className="text-slate-600">Your information is used strictly for operational purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Processing order dispatch and delivery logistics.</li>
              <li>Managing "Pay Small Small" layaway installment balances.</li>
              <li>Sending automated order updates and SMS dispatch tracking.</li>
              <li>Resolving technical support and warranty servicing requests.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">4</span>
              <h2 className="text-xl font-bold text-slate-900">Your Rights Under Ghana Law</h2>
            </div>
            <p className="text-slate-600">
              Under the Data Protection Act, 2012 (Act 843), you hold full rights to inspect your data, request updates, or request complete account deletion from our systems.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 bg-orange-500 text-white rounded-2xl space-y-2">
            <h3 className="font-bold text-base ">Support Desk</h3>
            <p className="text-xs ">TEQVAULT | Ghana</p>
            <p className="text-xs ">Email: support@teqvault.app | Phone: 054 344 2518</p>
          </div>

        </div>

        {/* Related Navigation Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600 px-2">
          <Link href="/terms" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span>View Terms of Service</span>
            <ArrowRight size={14} />
          </Link>
          <Link href="/refund-policy" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span>View Return & Refund Policy</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
