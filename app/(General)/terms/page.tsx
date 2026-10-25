import React from 'react';
import { ShieldCheck, Scale, AlertCircle, FileText, CreditCard, Truck, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teqvault.app';

export const metadata: Metadata = {
  title: 'Terms of Service | TEQVAULT',
  description: 'Read the Terms of Service for TEQVAULT regarding online electronics purchases, device trade-ins, Pay Small Small financing, warranties, and delivery in Ghana.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | TEQVAULT',
    description: 'Read the Terms of Service for TEQVAULT regarding online electronics purchases, device trade-ins, Pay Small Small financing, warranties, and delivery in Ghana.',
    url: `${siteUrl}/terms`,
    siteName: 'TEQVAULT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | TEQVAULT',
    description: 'Read the Terms of Service for TEQVAULT regarding online electronics purchases, device trade-ins, Pay Small Small financing, warranties, and delivery in Ghana.',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'August 2026';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Header */}
      <div className="relative bg-blue-600 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-4 z-10">
        
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit">
            Terms of Service
          </h1>
        
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-8">
        
        {/* Important Notice Callout */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1">
            <p className="font-extrabold text-slate-900 text-base">Welcome to TEQVAULT</p>
            <p>
              By accessing our platform, purchasing consumer electronics, using our "Pay Small Small" financing, or sending devices for trade-in/repairs, you agree to be bound by these Terms of Service. Please review them carefully before placing an order.
            </p>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">1</span>
              <h2 className="text-xl font-bold text-slate-900">General & Business Overview</h2>
            </div>
            <p className="text-slate-600">
              TEQVAULT is a registered consumer electronics retail and services firm in Ghana. We specialize in flagship smartphones, laptops, tablets, IT hardware, trade-in programs, and installment financing solutions.
            </p>
            <p className="text-slate-600">
              By engaging our platform, you affirm that you are at least 18 years old or operating under legal parental consent.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">2</span>
              <h2 className="text-xl font-bold text-slate-900">Pricing, Orders & Payments</h2>
            </div>
            <p className="text-slate-600">
              All listed prices are displayed in Ghanaian Cedi (GHS). Prices and promotional offers are subject to change based on market availability.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Secure Online Payments:</strong> All Mobile Money (MoMo) and Credit/Debit card payments are securely authorized via <strong>Paystack</strong>.</li>
              <li><strong>Order Confirmation:</strong> Orders are verified upon successful payment authorization. We reserve the right to cancel orders in event of pricing errors or stock unavailability.</li>
              <li><strong>Pay Small Small Financing:</strong> Installment plans require strict adherence to agreed deposit and payment schedules.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">3</span>
              <h2 className="text-xl font-bold text-slate-900">Delivery & In-Store Pickups</h2>
            </div>
            <p className="text-slate-600">
              We dispatch orders nationwide across Ghana using verified courier networks. Delivery durations provided at checkout are estimates.
            </p>
            <p className="text-slate-600">
              For in-store pick-up at our location in Ghana, customers must present valid identification (Ghana Card) and the order receipt code.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">4</span>
              <h2 className="text-xl font-bold text-slate-900">Warranties & Device Condition</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Brand New Products:</strong> Covered by standard manufacturer warranties covering factory defects up to 12 months.</li>
              <li><strong>Refurbished / Pre-owned Products:</strong> Covered by a 6-month TEQVAULT functional store warranty. Physical drop damage, liquid intrusion, or third-party repair attempts void the warranty.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">5</span>
              <h2 className="text-xl font-bold text-slate-900">Trade-In & Seller Regulations</h2>
            </div>
            <p className="text-slate-600">
              Sellers trading devices with TEQVAULT guarantee legal ownership. All iCloud, Google, and Samsung accounts must be removed prior to device valuation.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white font-extrabold flex items-center justify-center text-xs shrink-0">6</span>
              <h2 className="text-xl font-bold text-slate-900">Governing Law</h2>
            </div>
            <p className="text-slate-600">
              These Terms shall be interpreted and governed in accordance with the statutory laws of the <strong>Republic of Ghana</strong>.
            </p>
          </section>

          {/* Contact Box */}
          <div className="p-6 bg-orange-500 text-white rounded-2xl space-y-2">
            <h3 className="font-bold text-base text-white">Contact Us</h3>
            <p className="text-xs text-white">TEQVAULT | Ghana</p>
            <p className="text-xs text-white">Email: support@teqvault.app | Phone: 0543442518</p>
          </div>

        </div>

        {/* Related Navigation Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600 px-2">
          <Link href="/privacy" className="flex items-center gap-1 hover:text-orange-500 transition-colors">
            <span>View Privacy Policy</span>
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
