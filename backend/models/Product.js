const { createUnifiedModel } = require('./unifiedModel');

const productSchema = {
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: '' },
  description: { type: String, required: true },
  quantity: { type: String, required: true }, // e.g. "5 KG", "1 L", "500 g"
  images: [{ type: String }],
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, default: 50 },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 },
  isPopular: { type: Boolean, default: false },
  isFlashDeal: { type: Boolean, default: false },
  deliveryEstimate: { type: String, default: '15-25 mins' },
  storeId: { type: String, default: 'store-baner-1' },
  createdAt: { type: Date, default: Date.now }
};

const Product = createUnifiedModel('Product', productSchema);
module.exports = Product;
