import React from 'react';
import { Truck, BadgePercent, ShoppingBag, ShieldCheck, MapPin, Users } from 'lucide-react';

const reasons = [
  {
    icon: Truck,
    title: '🚚 Fast Express Delivery',
    description: 'Guaranteed 20–30 minutes delivery from your nearest local MART WITH US dark store.'
  },
  {
    icon: BadgePercent,
    title: '💰 Affordable Prices & Deals',
    description: 'Wholesale-level kirana rates with regular flash discounts and bundle offers.'
  },
  {
    icon: ShoppingBag,
    title: '🛒 Everything In One Place',
    description: '100+ daily essentials from Aashirvaad Atta to Amul Milk and fresh farm vegetables.'
  },
  {
    icon: ShieldCheck,
    title: '🔒 Secure Payments',
    description: 'Pay safely via UPI (GPay, PhonePe, Paytm), Cards, Net Banking, or Cash on Delivery.'
  },
  {
    icon: MapPin,
    title: '📍 Local Store Network',
    description: 'Hyperlocal micro-fulfilment centers across Baner, Wakad, Kothrud and Pune.'
  },
  {
    icon: Users,
    title: '⭐ Trusted Delivery Partners',
    description: 'Verified, trained delivery agents equipped with temperature-safe grocery bags.'
  }
];

export default function WhyChooseUs() {
  return (
    <section className="my-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Why MART WITH US
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
          Your Neighborhood Kirana, Reimagined
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Designed for speed, affordability, and complete convenience for modern Indian households.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reasons.map((r, i) => {
          const Icon = r.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-brand-200 hover:shadow-soft transition-all duration-300"
            >
              <h3 className="font-bold text-gray-900 text-base mb-1.5">{r.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
