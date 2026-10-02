import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 md:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Props Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-800 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gray-800 text-brand-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">20-30 Min Delivery</h5>
              <p className="text-gray-400">Direct from local dark stores & kirana</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gray-800 text-brand-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">100% Quality Assurance</h5>
              <p className="text-gray-400">Handpicked fresh vegetables & brands</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gray-800 text-brand-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">No Questions Refund</h5>
              <p className="text-gray-400">Instant credit for unsatisfied items</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gray-800 text-brand-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Open 6 AM – 11 PM</h5>
              <p className="text-gray-400">Delivering daily essentials 365 days</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🛒</span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                MART <span className="text-brand-400">WITH US</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              “Your Everyday Needs, Delivered.” <br />
              India's trusted modern kirana marketplace providing fresh fruits, vegetables, dairy, pulses, household essentials, and snacks at genuine prices right to your doorstep.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98230 45678 (Toll Free: 1800-MART-WITH-US)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <a href="mailto:support@martwithus.com" className="hover:text-white underline">
                  support@martwithus.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Baner High Street, Pune, Maharashtra 411045</span>
              </div>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/products?category=Grocery %26 Staples" className="hover:text-white transition">Atta, Rice & Dals</Link></li>
              <li><Link to="/products?category=Fresh Produce" className="hover:text-white transition">Fresh Vegetables & Fruits</Link></li>
              <li><Link to="/products?category=Dairy %26 Eggs" className="hover:text-white transition">Milk, Curd & Paneer</Link></li>
              <li><Link to="/products?category=Snacks %26 Beverages" className="hover:text-white transition">Biscuits, Tea & Cold Drinks</Link></li>
              <li><Link to="/products?category=Household %26 Cleaning" className="hover:text-white transition">Detergents & Floor Cleaners</Link></li>
              <li><Link to="/products?category=Personal Care" className="hover:text-white transition">Soaps, Shampoos & Creams</Link></li>
              <li><Link to="/products?category=Baby Care" className="hover:text-white transition">Diapers & Baby Food</Link></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Help & Company</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/orders" className="hover:text-white transition">Track Your Order</Link></li>
              <li><Link to="/offers" className="hover:text-white transition">Today's Deals & Coupons</Link></li>
              <li><span className="hover:text-white transition cursor-pointer">About Us</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Help Center / FAQ</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms & Conditions</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Privacy & Cookie Policy</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Refund Policy</span></li>
            </ul>
          </div>

          {/* Delivery Partner & Admin Portals */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Partner With Us</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/delivery/register" className="text-brand-400 font-bold hover:underline flex items-center">
                  <span>Become a Delivery Partner 🚴</span>
                </Link>
              </li>
              <li><Link to="/delivery/login" className="hover:text-white transition">Partner Dashboard Login</Link></li>
              <li><span className="hover:text-white transition cursor-pointer">Partner Earnings & Incentives</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Franchise & Kirana Onboarding</span></li>
              <li className="pt-3">
                <Link to="/admin/dashboard" className="text-purple-400 hover:text-purple-300 font-medium text-xs">
                  🛡️ Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 MART WITH US Technologies Pvt. Ltd. • Specially Crafted & Dedicated to <strong className="text-amber-400 font-black tracking-wide">SWARALI ✨</strong>. All rights reserved.</p>
          <div className="flex items-center space-x-3 text-sm">
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">VISA</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-bold">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
