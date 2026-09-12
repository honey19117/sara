import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Sparkles, Send, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { showSuccess } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showSuccess('You have been added to the AURA Luxe Private Registry.');
      setEmail('');
    }
  };

  return (
    <footer className="bg-aura-950 border-t border-slate-800/80 text-slate-400 text-sm mt-20">
      {/* Brand Value Propositions */}
      <div className="border-b border-slate-800/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-1">Uncompromising Craftsmanship</h4>
              <p className="text-xs text-slate-400">Swiss calibers, Tuscan leather, and beryllium audio transducers.</p>
            </div>
          </div>

          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-1">Insured White-Glove Transit</h4>
              <p className="text-xs text-slate-400">Express insured domestic delivery with real-time GPS tracking.</p>
            </div>
          </div>

          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-1">256-Bit Razorpay Security</h4>
              <p className="text-xs text-slate-400">Official encrypted checkout supporting UPI, Cards, and NetBanking.</p>
            </div>
          </div>

          <div className="flex items-center md:items-start gap-4 flex-col md:flex-row">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 mb-1">7-Day Return Guarantee</h4>
              <p className="text-xs text-slate-400">Hassle-free luxury doorstep pickup and swift refund processing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-cinzel text-2xl font-bold tracking-[0.25em] text-slate-100">
                A U R A
              </span>
              <span className="block text-[9px] uppercase tracking-[0.35em] text-amber-400 font-semibold -mt-1">
                Luxe Editions
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              A bespoke collective committed to timeless design, precision acoustic engineering, Swiss horology, and artisanal luxury goods. Formulated for connoisseurs of discerning taste.
            </p>
            <div className="pt-2 text-xs text-slate-300">
              <strong>Concierge Desk:</strong> concierge@auraluxe.com<br />
              <strong>Direct Line:</strong> +91 1800 2872 5893 (10 AM - 8 PM IST)
            </div>
          </div>

          {/* Curations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Curations</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop?category=audio-acoustics" className="hover:text-amber-300 transition-colors">Audio & Acoustics</Link></li>
              <li><Link to="/shop?category=precision-timepieces" className="hover:text-amber-300 transition-colors">Precision Timepieces</Link></li>
              <li><Link to="/shop?category=designer-apparel" className="hover:text-amber-300 transition-colors">Designer Apparel</Link></li>
              <li><Link to="/shop?category=leather-goods" className="hover:text-amber-300 transition-colors">Leather Goods</Link></li>
              <li><Link to="/shop?category=haute-parfumerie" className="hover:text-amber-300 transition-colors">Haute Parfumerie</Link></li>
              <li><Link to="/shop?category=modern-eyewear" className="hover:text-amber-300 transition-colors">Modern Eyewear</Link></li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Client Concierge</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/order-tracking" className="hover:text-amber-300 transition-colors">Track Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-amber-300 transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns-policy" className="hover:text-amber-300 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-amber-300 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-amber-300 transition-colors">Contact Concierge</Link></li>
              <li><Link to="/about" className="hover:text-amber-300 transition-colors">The AURA Atelier</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-100">Private Registry</h4>
            <p className="text-xs text-slate-400">
              Receive private invitations to preview limited edition timepieces and member-only releases.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-aura-900 border border-slate-700/80 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 p-1.5 text-amber-400 hover:text-white rounded-md transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                By joining, you consent to our <Link to="/privacy-policy" className="underline hover:text-slate-300">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Strip */}
      <div className="border-t border-slate-800/80 bg-aura-950 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} AURA Luxe Group Ltd. All Rights Reserved. Handcrafted for modern luxury.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span className="text-amber-500/80 font-medium">Razorpay Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
