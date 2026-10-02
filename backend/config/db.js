const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongooseConnected = false;

// Simple file-backed collection manager
class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.cache = null;
  }

  _read() {
    if (this.cache !== null) return this.cache;
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.cache = JSON.parse(content || '[]');
      } catch (e) {
        console.error(`Error reading ${this.name}.json, resetting:`, e.message);
        this.cache = [];
      }
    } else {
      this.cache = [];
      this._write();
    }
    return this.cache;
  }

  _write() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache || [], null, 2), 'utf8');
    } catch (e) {
      console.error(`Error writing ${this.name}.json:`, e.message);
    }
  }

  async find(filter = {}) {
    const items = this._read();
    return items.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          if (val.$regex) {
            const re = new RegExp(val.$regex, val.$options || '');
            if (!re.test(String(item[key] || ''))) return false;
          } else if (val.$in) {
            if (!val.$in.includes(item[key])) return false;
          } else if (val.$gte !== undefined || val.$lte !== undefined || val.$gt !== undefined || val.$lt !== undefined) {
            const num = Number(item[key]);
            if (val.$gte !== undefined && num < val.$gte) return false;
            if (val.$lte !== undefined && num > val.$lte) return false;
            if (val.$gt !== undefined && num <= val.$gt) return false;
            if (val.$lt !== undefined && num >= val.$lt) return false;
          } else if (val.$ne !== undefined) {
            if (item[key] === val.$ne) return false;
          }
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    const list = await this.find(filter);
    return list[0] || null;
  }

  async findById(id) {
    const items = this._read();
    const strId = String(id);
    return items.find(item => String(item._id) === strId) || null;
  }

  async create(doc) {
    const items = this._read();
    const newDoc = {
      _id: doc._id ? String(doc._id) : (Date.now().toString(36) + Math.random().toString(36).substring(2, 8)),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newDoc);
    this._write();
    return newDoc;
  }

  async insertMany(docs) {
    const created = [];
    for (const d of docs) {
      created.push(await this.create(d));
    }
    return created;
  }

  async findByIdAndUpdate(id, updates, options = {}) {
    const items = this._read();
    const strId = String(id);
    const index = items.findIndex(item => String(item._id) === strId);
    if (index === -1) return null;

    const current = items[index];
    const updated = {
      ...current,
      ...(updates.$set || updates),
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this._write();
    return options.new ? updated : current;
  }

  async findByIdAndDelete(id) {
    const items = this._read();
    const strId = String(id);
    const index = items.findIndex(item => String(item._id) === strId);
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    this._write();
    return removed;
  }

  async deleteMany(filter = {}) {
    const items = this._read();
    const matching = await this.find(filter);
    const matchingIds = new Set(matching.map(m => String(m._id)));
    this.cache = items.filter(item => !matchingIds.has(String(item._id)));
    this._write();
    return { deletedCount: matching.length };
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }
}

const collections = {};

const getCollection = (name) => {
  if (!collections[name]) {
    collections[name] = new JsonCollection(name);
  }
  return collections[name];
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mart_with_us';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    isMongooseConnected = true;
  } catch (err) {
    console.log(`ℹ️ External MongoDB not active (${err.message}).`);
    console.log(`⚡ Activated Embedded Persistent JSON Store for MART WITH US in ./backend/data/`);
    isMongooseConnected = false;
  }
};

module.exports = {
  connectDB,
  getCollection,
  isMongoose: () => isMongooseConnected
};
