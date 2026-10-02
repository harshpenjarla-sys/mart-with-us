const { createUnifiedModel } = require('./unifiedModel');

const reviewSchema = {
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  productId: { type: String },
  orderId: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['PRODUCT', 'DELIVERY', 'STORE'], 
    default: 'PRODUCT' 
  },
  createdAt: { type: Date, default: Date.now }
};

const Review = createUnifiedModel('Review', reviewSchema);
module.exports = Review;
