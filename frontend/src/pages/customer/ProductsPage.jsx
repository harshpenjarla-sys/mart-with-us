import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Star,
  ChevronDown,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { productsAPI } from '../../services/api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from query params or defaults
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryBrand = searchParams.get('brand') || '';
  const querySort = searchParams.get('sort') || 'popularity';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedBrands, setSelectedBrands] = useState(queryBrand ? [queryBrand] : []);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState('');
  const [minDiscount, setMinDiscount] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(querySort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize when query params change
  useEffect(() => {
    if (queryCategory) setSelectedCategory(queryCategory);
    if (querySort) setSortBy(querySort);
    if (queryBrand) setSelectedBrands([queryBrand]);
  }, [queryCategory, querySort, queryBrand]);

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productsAPI.getCategories();
        if (res.success) setCategories(res.categories || []);
      } catch (e) {}
    };
    fetchCategories();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        setLoading(true);
        const params = {
          search: querySearch,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          brand: selectedBrands.length ? selectedBrands.join(',') : '',
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
          minRating: minRating || undefined,
          minDiscount: minDiscount || undefined,
          inStock: inStockOnly || undefined,
          sort: sortBy,
          limit: 100
        };

        const res = await productsAPI.getAll(params);
        if (res.success) {
          setProducts(res.products || []);
          if (res.availableBrands) setAvailableBrands(res.availableBrands);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [querySearch, selectedCategory, selectedBrands, maxPrice, minRating, minDiscount, inStockOnly, sortBy]);

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setMaxPrice(1000);
    setMinRating('');
    setMinDiscount('');
    setInStockOnly(false);
    setSortBy('popularity');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    selectedBrands.length > 0 ||
    maxPrice < 1000 ||
    Boolean(minRating) ||
    Boolean(minDiscount) ||
    inStockOnly ||
    Boolean(querySearch);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>🛒 All Grocery Essentials</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
              {products.length} Items
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {querySearch ? (
              <span>Showing search results for <strong className="text-brand-700">"{querySearch}"</strong></span>
            ) : selectedCategory ? (
              <span>Category: <strong className="text-brand-700">{selectedCategory}</strong></span>
            ) : (
              <span>Fresh daily items, staples, dairy & essentials at kirana prices</span>
            )}
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-400 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="popularity">Popularity (Bestsellers)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Top Customer Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:col-span-1 space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-brand-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">Filters</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:underline font-bold flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Categories
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    !selectedCategory ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug || c.name}
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-between ${
                      selectedCategory === c.name ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-400">{c.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Max Price</label>
                <span className="text-xs font-bold text-brand-700">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="1000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>₹30</span>
                <span>₹1000+</span>
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Customer Rating
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['4.0', '4.5'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(minRating === r ? '' : r)}
                    className={`px-3 py-1.5 rounded-xl border text-center font-bold flex items-center justify-center space-x-1 transition ${
                      minRating === r
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    <span>{r}+</span>
                    <Star className="w-3 h-3 fill-current text-amber-500" />
                  </button>
                ))}
              </div>
            </div>

            {/* Min Discount */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Discount
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['10', '20'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setMinDiscount(minDiscount === d ? '' : d)}
                    className={`px-3 py-1.5 rounded-xl border text-center font-bold transition ${
                      minDiscount === d
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700 hover:border-brand-300'
                    }`}
                  >
                    {d}% or more
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">In Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </div>

            {/* Popular Brands */}
            {availableBrands.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Brands
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {availableBrands.slice(0, 15).map((b) => (
                    <label key={b} className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-brand-700">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => handleBrandToggle(b)}
                        className="w-3.5 h-3.5 accent-brand-600 rounded"
                      />
                      <span className="truncate">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Products Listing Grid */}
        <section className="col-span-1 md:col-span-3 space-y-4">
          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-gray-400">Active:</span>
              {querySearch && (
                <span className="inline-flex items-center bg-brand-50 border border-brand-200 text-brand-800 text-xs px-2.5 py-1 rounded-full">
                  Search: "{querySearch}"
                  <button onClick={() => setSearchParams({})} className="ml-1.5 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center bg-brand-50 border border-brand-200 text-brand-800 text-xs px-2.5 py-1 rounded-full">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="ml-1.5 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBrands.map((b) => (
                <span key={b} className="inline-flex items-center bg-brand-50 border border-brand-200 text-brand-800 text-xs px-2.5 py-1 rounded-full">
                  Brand: {b}
                  <button onClick={() => handleBrandToggle(b)} className="ml-1.5 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {minRating && (
                <span className="inline-flex items-center bg-brand-50 border border-brand-200 text-brand-800 text-xs px-2.5 py-1 rounded-full">
                  Rating: {minRating}★+
                  <button onClick={() => setMinRating('')} className="ml-1.5 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Cards */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl">
                🔎
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg">No Products Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any products matching your specific filters or search keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs font-bold"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Max Price</span>
                <span className="text-brand-700">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="1000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
            </div>

            <div className="pt-3 border-t flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
