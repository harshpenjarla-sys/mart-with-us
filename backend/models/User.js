const { createUnifiedModel } = require('./unifiedModel');

const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'delivery', 'admin', 'store_manager'], 
    default: 'customer' 
  },
  profileImage: { type: String, default: '' },
  addresses: [{
    _id: String,
    fullName: String,
    phone: String,
    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    isDefault: Boolean
  }],
  wishlist: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
};

const User = createUnifiedModel('User', userSchema);
module.exports = User;
