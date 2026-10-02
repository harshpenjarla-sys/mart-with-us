const { createUnifiedModel } = require('./unifiedModel');

const storeSchema = {
  storeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  contactPhone: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 4.7 },
  distanceKm: { type: Number, default: 2.4 },
  deliveryTimeEstimate: { type: String, default: '20-30 min' },
  coordinates: {
    lat: { type: Number, default: 18.5590 },
    lng: { type: Number, default: 73.7868 }
  }
};

const Store = createUnifiedModel('Store', storeSchema);
module.exports = Store;
