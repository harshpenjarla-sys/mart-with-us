import React from 'react';
import { Link } from 'react-router-dom';
import { Bike, Shield, DollarSign, Award, ArrowRight } from 'lucide-react';

export default function DeliveryPartnerCTA() {
  return (
    <section className="my-12 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white overflow-hidden shadow-xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-bold uppercase tracking-wider text-amber-100">
            <Bike className="w-3.5 h-3.5" />
            <span>Delivery Partner Onboarding</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Want to Earn With MART WITH US?
          </h2>

          <p className="text-sm sm:text-base text-amber-50 max-w-xl leading-relaxed">
            Become a delivery partner and earn by delivering everyday essentials in your area. Flexible hours, instant payouts, attractive distance bonuses, and accidental insurance coverage.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20">
              <p className="font-extrabold text-lg text-white">₹25,000+</p>
              <p className="text-amber-100/80">Monthly Potential</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20">
              <p className="font-extrabold text-lg text-white">Daily</p>
              <p className="text-amber-100/80">Direct Payouts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20">
              <p className="font-extrabold text-lg text-white">Bicycle/Bike</p>
              <p className="text-amber-100/80">Any Vehicle Option</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/delivery/register"
              className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-extrabold rounded-2xl shadow-lg transition flex items-center space-x-2 text-sm tracking-wide transform hover:scale-[1.02]"
            >
              <span>JOIN AS DELIVERY PARTNER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/delivery/login"
              className="px-5 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl border border-white/30 backdrop-blur-md transition text-sm"
            >
              Partner Login
            </Link>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-center">
          <div className="relative w-full max-w-xs aspect-square rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80"
              alt="MART WITH US Delivery Partner on Scooter"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-gray-950/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-center text-xs">
              <span className="font-bold text-amber-300">Rahul Verma</span>
              <p className="text-[10px] text-gray-300">"Earned ₹620 today in 4 hours on bike!"</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
