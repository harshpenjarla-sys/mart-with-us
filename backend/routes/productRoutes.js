const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSearchSuggestions,
  getCategories,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/search-suggestions', getSearchSuggestions);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// Admin / Store manager routes
router.post('/', protect, authorize('admin', 'store_manager'), createProduct);
router.put('/:id', protect, authorize('admin', 'store_manager'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
