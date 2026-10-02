import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Sparkles,
  ShoppingBag,
  Clock,
  ChevronRight,
  ShieldCheck,
  Star,
  HelpCircle,
  Truck
} from 'lucide-react';
import HeroBanner from '../../components/customer/HeroBanner';
import CategoryCard from '../../components/customer/CategoryCard';
import ProductCard from '../../components/customer/ProductCard';
import WhyChooseUs from '../../components/customer/WhyChooseUs';
import DeliveryPartnerCTA from '../../components/customer/DeliveryPartnerCTA';
import { productsAPI } from '../../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [freshProduce, setFreshProduce] = useState([]);
  const [dailyEssentials, setDailyEssentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, featRes] = await Promise.all([
          productsAPI.getCategories(),
          productsAPI.getFeatured()
        ]);

        if (catRes.success) setCategories(catRes.categories || []);
        if (featRes.success) {
          setFlashDeals(featRes.flashDeals || []);
          setPopularProducts(featRes.popular || []);
          setFreshProduce(featRes.freshProduce || []);
          setDailyEssentials(featRes.dailyEssentials || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Product Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-xs text-gray-500">Fresh staples, produce, dairy and packaged foods</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug || cat._id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Flash Deals Section */}
      <section className="bg-gradient-to-br from-rose-50/60 via-amber-50/40 to-white p-5 sm:p-7 rounded-3xl border border-rose-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Flame className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  TODAY'S FLASH DEALS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
                  Up to 30% OFF
                </span>
              </div>
              <p className="text-xs text-gray-500">Unbeatable discounts on grocery favorites — valid today only!</p>
            </div>
          </div>

          <Link
            to="/offers"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center"
          >
            <span>View All Deals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {flashDeals.slice(0, 5).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* 4. Popular Bestsellers Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">⭐</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Popular Essentials
              </h2>
            </div>
            <p className="text-xs text-gray-500">Most loved products ordered by Pune households</p>
          </div>
          <Link
            to="/products?sort=popularity"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center group"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {popularProducts.slice(0, 5).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Fresh Fruits & Vegetables Section */}
      <section className="bg-emerald-50/50 p-5 sm:p-7 rounded-3xl border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🥦</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
                Farm Fresh Fruits & Veggies
              </h2>
            </div>
            <p className="text-xs text-emerald-800/80">Hand-graded daily, zero storage, delivered fresh in 25 mins</p>
          </div>
          <Link
            to="/products?category=Fresh Produce"
            className="text-xs font-bold text-brand-800 hover:text-brand-900 flex items-center"
          >
            <span>View All Produce</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {freshProduce.slice(0, 5).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Daily Staples & Kirana (Atta, Dal, Oil) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🌾</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Daily Kirana, Atta & Dals
              </h2>
            </div>
            <p className="text-xs text-gray-500">Unpolished lentils, Sharbati whole wheat atta, pure cow ghee</p>
          </div>
          <Link
            to="/products?category=Grocery %26 Staples"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center"
          >
            <span>View Staples</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {dailyEssentials.slice(0, 5).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* 7. Why Choose MART WITH US */}
      <WhyChooseUs />

      {/* 8. Delivery Partner Onboarding CTA */}
      <DeliveryPartnerCTA />

      {/* 9. Verified Customer Reviews */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft">
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
            Customer Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Loved By Pune Families
          </h2>
          <p className="text-xs text-gray-500 mt-1">Real ratings from genuine everyday shoppers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "Ordered Aashirvaad Atta, Amul Taaza milk and farm tomatoes at 7:30 AM before cooking breakfast. The delivery agent arrived at 7:52 AM! Absolutely amazed by the speed."
            </p>
            <div className="flex items-center space-x-2.5 pt-2 border-t border-gray-200/60">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Pooja Sharma</p>
                <p className="text-[10px] text-gray-400">Baner High Street</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "The live order tracking is so smooth. You can see when the store packs your items and when the delivery partner picks it up on his bike. Very trustworthy."
            </p>
            <div className="flex items-center space-x-2.5 pt-2 border-t border-gray-200/60">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                AK
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Amit Kulkarni</p>
                <p className="text-[10px] text-gray-400">Wakad, Pune</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed italic">
              "Prices are cheaper than local supermarkets and the unpolished Tata pulses are genuine quality. Plus free delivery above ₹499 makes it my go-to weekly app."
            </p>
            <div className="flex items-center space-x-2.5 pt-2 border-t border-gray-200/60">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                SN
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Sneha Nair</p>
                <p className="text-[10px] text-gray-400">Kothrud, Pune</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Frequently Asked Questions (FAQ) */}
      <section className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-200/70">
        <div className="text-center max-w-md mx-auto mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900">Frequently Asked Questions</h3>
          <p className="text-xs text-gray-500">Quick answers regarding MART WITH US deliveries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-xs text-gray-600">
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <h4 className="font-bold text-gray-900 mb-1">How fast does MART WITH US deliver?</h4>
            <p>Our average delivery time across Pune stores is 20–30 minutes, directly fulfilled by our local dark store network.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <h4 className="font-bold text-gray-900 mb-1">What is the minimum order for free delivery?</h4>
            <p>Orders above ₹499 receive 100% Free Delivery! For smaller orders, a nominal ₹29 fee is charged to compensate the delivery partner.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <h4 className="font-bold text-gray-900 mb-1">What payment methods are supported?</h4>
            <p>We support all UPI apps (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking, and Cash on Delivery.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <h4 className="font-bold text-gray-900 mb-1">Can I become a delivery partner?</h4>
            <p>Yes! Simply click "Become a Delivery Partner" in our portal. Bicycle, scooter, and bike owners can earn daily payouts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
