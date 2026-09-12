import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  Truck,
  RotateCcw,
  Lock,
  Award
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// --- ABOUT US ---
export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Atelier Heritage</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-cinzel font-bold text-slate-100">
          The Philosophy of Precision
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Founded on the uncompromising pursuit of mechanical harmony, acoustic perfection, and timeless tactile beauty.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden glass-card aspect-video border border-slate-800 relative">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1500&q=80"
          alt="Atelier Workshop"
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aura-950 via-aura-950/30 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-300 leading-relaxed">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-base font-serif font-bold text-slate-100">Unrelenting Horology</h3>
          <p>
            Every AURA timepiece is assembled by master horologists adhering to stringent Swiss and Japanese chronometric standards. Double domed sapphire crystals with multi-layer anti-reflective coatings ensure enduring legibility.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-base font-serif font-bold text-slate-100">Beryllium Acoustic Labs</h3>
          <p>
            Our planar magnetic and beryllium dynamic monitors are tuned to render the intimate micro-dynamics of live orchestral recordings. We calibrate frequencies with zero artificial coloration.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-base font-serif font-bold text-slate-100">Florentine Leathercraft</h3>
          <p>
            Utilizing time-honored bark vegetable tanning in Tuscany, our briefcases and accessories develop deep, luminous patinas over decades of ownership rather than degrading.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- CONTACT US ---
export const ContactPage = () => {
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      showSuccess('Your message has been received by the AURA Private Concierge.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-fade-in">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs uppercase tracking-widest font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>Client Concierge Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Inquire with Concierge
        </h1>
        <p className="text-xs text-slate-400">
          For bespoke orders, corporate gifting, sizing consultations, or private timepiece viewings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 text-xs">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100">Private Concierge</h4>
            <p className="text-slate-400">concierge@auraluxe.com</p>
            <p className="text-[11px] text-slate-500">Typical response time: Under 2 hours</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100">Direct Telephone Desk</h4>
            <p className="text-slate-400">+91 1800 2872 5893</p>
            <p className="text-[11px] text-slate-500">Mon - Sat, 10:00 AM - 8:00 PM IST</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100">Executive Flagship Atelier</h4>
            <p className="text-slate-400">DLF Horizon Plaza, Golf Course Road, Gurugram, NCR 122002</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Rohini Roy"
                  className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="rohini@domain.com"
                  className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Subject of Inquiry *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="e.g. Inquiring about custom strap sizing for Horizon Diver"
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Your Message *</label>
              <textarea
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Detail your request or inquiry..."
                className="w-full bg-aura-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold text-xs px-8 py-3.5 font-bold flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Transmitting...' : 'Send to Concierge'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

// --- FAQ PAGE ---
export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does AURA ensure authenticity across its timepiece catalog?',
      a: 'Every timepiece is accompanied by an individually numbered Certificate of Authenticity and registered in our global provenance ledger. Calibers undergo 168 hours of multi-positional chronometric testing before vault dispatch.'
    },
    {
      q: 'What payment methods are supported via Razorpay Checkout?',
      a: 'We support all major payment instruments through encrypted 256-bit Razorpay processing, including UPI (Google Pay, PhonePe, Paytm, CRED), Visa, MasterCard, American Express, Diners Club, and all major Indian NetBanking institutions.'
    },
    {
      q: 'How does complimentary shipping work across Indian PIN codes?',
      a: 'All orders with a subtotal of ₹2,499 or above automatically qualify for Complimentary Insured Express Courier delivery. Standard delivery operates within 3-5 business days, while Priority Air delivers within 48 hours.'
    },
    {
      q: 'What is the policy for cancellations and returns?',
      a: 'Orders can be cancelled at any time prior to courier dispatch from your My Orders portal with full instant refund. For delivered pieces, we offer an unconditional 7-day doorstep return and exchange guarantee in original unworn packaging.'
    },
    {
      q: 'Can I apply promotional coupons during checkout?',
      a: 'Yes, valid coupons (such as WELCOME10 for first orders or LUXE20 for festive orders above ₹10,000) can be entered directly in the shopping bag or at checkout. The discount is cryptographically calculated and verified on our server.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-slate-400">Everything you need to know about our curations, logistics, and guarantees.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-6 text-left flex justify-between items-center text-sm font-semibold text-slate-200 hover:text-amber-300 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0 ml-4" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />}
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- POLICIES ---
export const ShippingPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-300 leading-relaxed">
    <h1 className="text-3xl font-serif font-bold text-slate-100 mb-4">Shipping & Delivery Policy</h1>
    <p>AURA Luxe partners with premier luxury courier logistics including Blue Dart Express and Delhivery to deliver insured shipments across all serviceable Indian PIN codes.</p>
    <h3 className="text-sm font-bold text-slate-100 pt-3">Delivery Timelines</h3>
    <p>Standard delivery takes between 3 to 5 business days. Priority White-Glove Air Express delivers within 24 to 48 hours for metro locations.</p>
    <h3 className="text-sm font-bold text-slate-100 pt-3">Tamper-Evident Packaging</h3>
    <p>Every piece is enclosed in security-sealed packaging with digital barcoded seals. Do not accept any parcel if the outer seal has been broken.</p>
  </div>
);

export const ReturnsPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-300 leading-relaxed">
    <h1 className="text-3xl font-serif font-bold text-slate-100 mb-4">Returns & Refunds Guarantee</h1>
    <p>We provide an unconditional 7-day return guarantee from the date of delivery. Items must be returned in their pristine original condition with all tags, serial certificates, and luxury presentation boxes intact.</p>
    <h3 className="text-sm font-bold text-slate-100 pt-3">How to Initiate a Return</h3>
    <p>Navigate to your "My Orders" dashboard, select the delivered order, and click "Request Return". Our concierge will schedule an insured home pickup within 48 hours.</p>
  </div>
);

export const PrivacyPolicyPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-300 leading-relaxed">
    <h1 className="text-3xl font-serif font-bold text-slate-100 mb-4">Privacy Policy</h1>
    <p>AURA Luxe respects the confidentiality of your personal information. We never sell, rent, or trade customer data to third-party advertisers.</p>
    <h3 className="text-sm font-bold text-slate-100 pt-3">Payment Data Security</h3>
    <p>We do not store your credit/debit card numbers or bank credentials on our servers. All transactions are processed directly via PCI-DSS compliant Razorpay 256-bit SSL encrypted channels.</p>
  </div>
);

export const TermsPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-300 leading-relaxed">
    <h1 className="text-3xl font-serif font-bold text-slate-100 mb-4">Terms & Conditions</h1>
    <p>By accessing and purchasing from AURA Luxe, you agree to adhere to these Terms of Service. Prices and product specifications are subject to real-time verification at order creation.</p>
  </div>
);
