import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Copy, Check, Flame, ArrowRight } from 'lucide-react';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';

const coupons = [
  {
    code: 'WELCOME50',
    title: '₹50 FLAT DISCOUNT',
    desc: 'Valid on first order above ₹299 for new registered shoppers.',
    color: 'from-brand-600 to-emerald-700'
  },
  {
    code: 'MARTMEGA100',
    title: '₹100 OFF ON ₹999+',
    desc: 'Instant discount on grocery & staples cart exceeding ₹999.',
    color: 'from-amber-600 to-amber-700'
  },
  {
    code: 'FREEDEL',
    title: 'FREE EXPRESS DELIVERY',
    desc: 'Zero delivery fee applicable on any order above ₹199 today.',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    code: 'FARM20',
    title: '20% OFF FRESH PRODUCE',
    desc: 'Direct cashback on Nashik farm vegetables and fresh fruits.',
    color: 'from-rose-600 to-pink-700'
  }
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState('');
  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll({ minDiscount: 15, limit: 12 });
        if (res.success) {
          setDealProducts(res.products || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="space-y-10 py-2">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-brand-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-amber-200">
          <Flame className="w-4 h-4 fill-current" />
          <span>Mega Savings Hub</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mt-2">
          Deals, Coupons & Exclusive Kirana Discounts
        </h1>
        <p className="text-xs sm:text-sm text-rose-100 max-w-xl mt-1">
          Apply promotional coupon codes at checkout or shop heavy-discounted everyday pantry essentials.
        </p>
      </div>

      {/* Coupon Cards */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-black text-gray-900">Active Promo Coupons</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  MART WITH US DEAL
                </span>
                <h3 className="font-black text-base text-gray-900">{c.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </div>

              <div className="pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                <span className="font-mono text-xs font-black text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {c.code}
                </span>
                <button
                  onClick={() => handleCopy(c.code)}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Heavy Discount Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Items with 15%+ Instant Discount</h2>
            <p className="text-xs text-gray-500">Stock up on monthly staples and save big</p>
          </div>
          <Link to="/products?minDiscount=15" className="text-xs font-bold text-brand-700 flex items-center">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {dealProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
