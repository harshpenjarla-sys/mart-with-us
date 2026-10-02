const { createUnifiedModel } = require('./unifiedModel');

const categorySchema = {
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: '🛒' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  subCategories: [{ type: String }],
  itemCount: { type: Number, default: 0 }
};

const Category = createUnifiedModel('Category', categorySchema);
module.exports = Category;
