const Product = require('../models/Product');
const Category = require('../models/Category');

// @route   GET /api/products
// @desc    Get products with search, filters, and sorting
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      isFlashDeal,
      isPopular,
      sort = 'popularity',
      page = 1,
      limit = 24
    } = req.query;

    let all = await Product.find();

    // 1. Search filter (name, brand, category, description)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      all = all.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (category && category !== 'All') {
      all = all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // 3. SubCategory filter
    if (subCategory) {
      all = all.filter(p => p.subCategory && p.subCategory.toLowerCase() === subCategory.toLowerCase());
    }

    // 4. Brand filter
    if (brand) {
      const brands = Array.isArray(brand) ? brand : brand.split(',');
      all = all.filter(p => brands.map(b => b.toLowerCase()).includes(p.brand.toLowerCase()));
    }

    // 5. Price filter
    if (minPrice) {
      all = all.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      all = all.filter(p => p.price <= Number(maxPrice));
    }

    // 6. Rating filter
    if (minRating) {
      all = all.filter(p => (p.rating || 0) >= Number(minRating));
    }

    // 7. Discount filter
    if (minDiscount) {
      all = all.filter(p => (p.discount || 0) >= Number(minDiscount));
    }

    // 8. Stock filter
    if (inStock === 'true' || inStock === true) {
      all = all.filter(p => p.stock > 0);
    }

    // 9. Flags
    if (isFlashDeal === 'true') {
      all = all.filter(p => p.isFlashDeal);
    }
    if (isPopular === 'true') {
      all = all.filter(p => p.isPopular);
    }

    // 10. Sorting
    switch (sort) {
      case 'price_asc':
        all.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        all.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        all.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'discount':
        all.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'newest':
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popularity':
      default:
        all.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        });
        break;
    }

    // Distinct brands list for dynamic filter sidebar
    const availableBrands = [...new Set(all.map(p => p.brand))].sort();

    // Pagination
    const total = all.length;
    const pNum = parseInt(page, 10);
    const lNum = parseInt(limit, 10);
    const startIndex = (pNum - 1) * lNum;
    const paginated = all.slice(startIndex, startIndex + lNum);

    res.json({
      success: true,
      total,
      page: pNum,
      totalPages: Math.ceil(total / lNum) || 1,
      products: paginated,
      availableBrands
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/search-suggestions
// @desc    Fast search suggestions & brand autocompletion
const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, suggestions: [] });
    }

    const query = q.trim().toLowerCase();
    const all = await Product.find();

    const matches = [];
    for (const p of all) {
      if (p.name.toLowerCase().includes(query)) {
        matches.push({ type: 'product', text: p.name, id: String(p._id), image: p.images[0], price: p.price });
      } else if (p.brand.toLowerCase().includes(query)) {
        if (!matches.some(m => m.text === p.brand)) {
          matches.push({ type: 'brand', text: p.brand });
        }
      }
      if (matches.length >= 8) break;
    }

    res.json({ success: true, suggestions: matches });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/categories
// @desc    Get all categories with active counts
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/featured
// @desc    Get featured products for homepage (flash deals, bestsellers, fresh essentials)
const getFeaturedProducts = async (req, res, next) => {
  try {
    const all = await Product.find();

    const flashDeals = all.filter(p => p.isFlashDeal).slice(0, 10);
    const popular = all.filter(p => p.isPopular).slice(0, 10);
    const freshProduce = all.filter(p => p.category === 'Fresh Produce').slice(0, 8);
    const dailyEssentials = all.filter(p => p.category === 'Grocery & Staples').slice(0, 8);
    const dairyItems = all.filter(p => p.category === 'Dairy & Eggs').slice(0, 8);

    res.json({
      success: true,
      flashDeals,
      popular,
      freshProduce,
      dailyEssentials,
      dairyItems
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @desc    Get single product details with related items
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch related products in the same category/subCategory
    const all = await Product.find();
    const related = all
      .filter(p => String(p._id) !== String(product._id) && (p.category === product.category || p.brand === product.brand))
      .slice(0, 6);

    res.json({
      success: true,
      product,
      related
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products
// @desc    Create a product (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, brand, category, subCategory, description, quantity, price, mrp, stock, images } = req.body;

    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const newProd = await Product.create({
      name,
      brand,
      category,
      subCategory: subCategory || '',
      description,
      quantity,
      price: Number(price),
      mrp: Number(mrp),
      discount,
      stock: Number(stock) || 50,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80'],
      isPopular: Boolean(req.body.isPopular),
      isFlashDeal: Boolean(req.body.isFlashDeal)
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProd
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @desc    Update a product (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { price, mrp } = req.body;
    const updateData = { ...req.body };

    if (price && mrp) {
      updateData.discount = Math.round(((mrp - price) / mrp) * 100);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getSearchSuggestions,
  getCategories,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
