const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a customer or agent
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: role || 'customer',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      addresses: []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // Role verification if requested
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `This account does not have '${role}' access. Please use the appropriate login portal.`
      });
    }

    const token = generateToken(user._id);

    // If delivery agent, check agent profile verification status
    let agentDetails = null;
    if (user.role === 'delivery') {
      agentDetails = await DeliveryAgent.findOne({ userId: String(user._id) });
    }

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      },
      agentDetails
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let agentDetails = null;
    if (user.role === 'delivery') {
      agentDetails = await DeliveryAgent.findOne({ userId: String(user._id) });
    }

    res.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        addresses: user.addresses || [],
        wishlist: user.wishlist || []
      },
      agentDetails
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profileImage },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: String(updated._id),
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        profileImage: updated.profileImage,
        addresses: updated.addresses || []
      }
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/address
// @desc    Add delivery address
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, house, street, area, city, state, pincode, landmark, isDefault } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newAddress = {
      _id: 'addr_' + Date.now(),
      fullName,
      phone,
      house,
      street,
      area,
      city,
      state: state || 'Maharashtra',
      pincode,
      landmark: landmark || '',
      isDefault: Boolean(isDefault) || (user.addresses || []).length === 0
    };

    let addresses = user.addresses || [];
    if (newAddress.isDefault) {
      addresses = addresses.map(a => ({ ...a, isDefault: false }));
    }
    addresses.push(newAddress);

    const updated = await User.findByIdAndUpdate(req.user.id, { addresses }, { new: true });

    res.status(201).json({
      success: true,
      message: 'Delivery address added successfully',
      addresses: updated.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/auth/address/:id
// @desc    Delete delivery address
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addresses = (user.addresses || []).filter(a => a._id !== req.params.id);
    const updated = await User.findByIdAndUpdate(req.user.id, { addresses }, { new: true });

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: updated.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/wishlist/:productId
// @desc    Toggle item in wishlist
const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const pid = req.params.productId;
    let wishlist = user.wishlist || [];

    const exists = wishlist.includes(pid);
    if (exists) {
      wishlist = wishlist.filter(id => id !== pid);
    } else {
      wishlist.push(pid);
    }

    await User.findByIdAndUpdate(req.user.id, { wishlist }, { new: true });

    res.json({
      success: true,
      isInWishlist: !exists,
      wishlist
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist
};
