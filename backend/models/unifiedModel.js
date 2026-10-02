const mongoose = require('mongoose');
const { getCollection, isMongoose } = require('../config/db');

function createUnifiedModel(name, schemaDefinition) {
  let mongooseModel = null;
  try {
    if (mongoose.models[name]) {
      mongooseModel = mongoose.model(name);
    } else {
      const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
      mongooseModel = mongoose.model(name, schema);
    }
  } catch (e) {
    // In case mongoose schema registration had an issue
  }

  const jsonCol = getCollection(name.toLowerCase() + 's');

  return {
    name,
    async find(query = {}) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.find(query).lean();
      }
      return await jsonCol.find(query);
    },

    async findOne(query = {}) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.findOne(query).lean();
      }
      return await jsonCol.findOne(query);
    },

    async findById(id) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.findById(id).lean();
      }
      return await jsonCol.findById(id);
    },

    async create(doc) {
      if (isMongoose() && mongooseModel) {
        const created = await mongooseModel.create(doc);
        return created.toObject ? created.toObject() : created;
      }
      return await jsonCol.create(doc);
    },

    async insertMany(docs) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.insertMany(docs);
      }
      return await jsonCol.insertMany(docs);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.findByIdAndUpdate(id, update, { new: true }).lean();
      }
      return await jsonCol.findByIdAndUpdate(id, update, options);
    },

    async findOneAndUpdate(query, update, options = { new: true }) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.findOneAndUpdate(query, update, { new: true }).lean();
      }
      const existing = await jsonCol.findOne(query);
      if (!existing) return null;
      return await jsonCol.findByIdAndUpdate(existing._id, update, options);
    },

    async findByIdAndDelete(id) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.findByIdAndDelete(id).lean();
      }
      return await jsonCol.findByIdAndDelete(id);
    },

    async deleteMany(query = {}) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.deleteMany(query);
      }
      return await jsonCol.deleteMany(query);
    },

    async countDocuments(query = {}) {
      if (isMongoose() && mongooseModel) {
        return await mongooseModel.countDocuments(query);
      }
      return await jsonCol.countDocuments(query);
    }
  };
}

module.exports = { createUnifiedModel };
