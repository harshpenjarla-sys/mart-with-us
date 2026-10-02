import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Heart,
  Share2,
  ChevronRight,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import ProductCard from '../../components/customer/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getItemQuantity, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await productsAPI.getById(id);
        if (res.success) {
          setProduct(res.product);
          setRelated(res.related || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900">Product Not Found</h3>
        <p className="text-xs text-gray-500">{error || 'The item you are looking for is no longer available.'}</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Groceries
        </Link>
      </div>
    );
  }

  const pid = String(product._id || product.id);
  const qty = getItemQuantity(pid);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      if (qty === 0) addToCart(product, 1);
      navigate('/checkout');
    }
  };

  return (
    <div className="space-y-12 py-2">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1.5 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-600">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft">
        {/* Left: Product Image Box */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 p-4 flex items-center justify-center">
            <ImageWithFallback
              src={product.images && product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />

            {/* Discount Badge */}
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                {product.discount}% OFF
              </span>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs shadow-md text-gray-400 hover:text-rose-500 transition"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Meta & Purchase Box */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Brand & Stock */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-brand-700 uppercase tracking-widest bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                {product.brand}
              </span>
              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Currently Out of Stock'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Unit / Weight */}
            <p className="text-sm font-semibold text-gray-500">
              Net Quantity / Pack: <span className="text-gray-900">{product.quantity}</span>
            </p>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-3 pt-1">
              <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-black text-amber-900 border border-amber-200">
                <span>{product.rating || '4.6'}</span>
                <Star className="w-3.5 h-3.5 fill-current text-amber-500 ml-1" />
              </div>
              <span className="text-xs text-gray-500">
                {product.reviewsCount || 42} Customer Reviews
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-brand-700 font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                100% Genuine Kirana
              </span>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-gray-900">
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.mrp}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{product.mrp - product.price}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Inclusive of all local taxes & handling</p>
            </div>

            {/* Description */}
            <div className="space-y-1 pt-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Product Highlights</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Delivery Promise Badge */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl border border-gray-100 bg-white flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-brand-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block leading-tight">Fast Delivery</span>
                  <span className="text-[10px] text-gray-500">{product.deliveryEstimate || '20-30 mins'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-100 bg-white flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-brand-700">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 block leading-tight">Instant Return</span>
                  <span className="text-[10px] text-gray-500">Doorstep replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs: Add to Cart / Buy Now */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
            {qty > 0 ? (
              <div className="w-full sm:w-1/2 flex items-center justify-between bg-brand-50 border border-brand-300 rounded-2xl p-2">
                <span className="text-xs font-bold text-brand-800 ml-2">In Cart:</span>
                <div className="flex items-center space-x-3 bg-brand-600 text-white rounded-xl px-2 py-1">
                  <button onClick={() => updateQuantity(pid, qty - 1)} className="p-1 hover:bg-brand-700 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-sm w-4 text-center">{qty}</span>
                  <button onClick={() => addToCart(product, 1)} className="p-1 hover:bg-brand-700 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full sm:w-1/2 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-800 border-2 border-brand-600'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART</span>
              </button>
            )}

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full sm:w-1/2 py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30'
              }`}
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>

      {/* Related Products / You May Also Like */}
      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                You May Also Like
              </h3>
              <p className="text-xs text-gray-500">Related daily essentials from {product.category}</p>
            </div>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-bold text-brand-700 hover:underline"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
