import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll({ limit: 100 });
        if (res.success) {
          const userWishlist = user?.wishlist || [];
          const filtered = (res.products || []).filter(p => userWishlist.includes(String(p._id)));
          setWishlistProducts(filtered);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
          <span>Saved Wishlist</span>
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        </h1>
        <p className="text-xs text-gray-500">Your favorite essentials saved for recurring restocks</p>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
            ❤️
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">Your Wishlist is Empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click the heart icon on any product to save items here for quick ordering anytime!
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Explore Groceries
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((p) => (
            <ProductCard key={p._id} product={p} isWishlisted={true} />
          ))}
        </div>
      )}
    </div>
  );
}
