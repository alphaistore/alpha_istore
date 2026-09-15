const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName:    { type: String, default: 'AlphaiStore' },
  logo:         { url: String, public_id: String },
  favicon:      { url: String, public_id: String },
  hero: {
    title:    { type: String, default: "The Best Phones, Delivered to You." },
    subtitle: { type: String, default: "Shop the latest iPhones, Samsung, Tecno and more." },
    image:    { url: String, public_id: String },
  },
  heroImages: [{
    url: String,
    public_id: String,
  }],
  filters: {
    brands: [{
      name: String,
      enabled: { type: Boolean, default: true },
    }],
    conditions: [{
      name: String,
      enabled: { type: Boolean, default: true },
    }],
    storage: [{
      name: String,
      enabled: { type: Boolean, default: true },
    }],
  },
  contact: {
    whatsapp: { type: [String], default: ['+233575453086'] },
    phones:   [String],
    email:    { type: String, default: 'info@alphaistoregh.com' },
    address:  { type: String, default: 'Adum, near Alife Supermarket, opposite Jolly Shop, Kumasi, Ghana' },
    website:  String,
    googleMapEmbedUrl: String,
  },
  social: {
    facebook:  String,
    instagram: String,
    twitter:   String,
    tiktok:    String,
  },
  delivery: {
    locations: [{
      region: String,
      fee:    Number,
    }],
  },
  payment: {
    paystack:       { type: Boolean, default: true },
    payOnPickup:    { type: Boolean, default: true },
    accountName:    String,
    accountNumber:  String,
    instructions:   String,
  },
  promoBanners: [{
    title:    String,
    subtitle: String,
    cta:      String,
    color:    String,
    pattern:  { type: String, enum: ['none', 'dots', 'waves', 'grid', 'lines', 'zigzag', 'cross', 'diamonds'], default: 'none' },
    image:    { url: String, public_id: String },
    link:     String,
  }],
  promoCodes: [{
    code:       { type: String, required: true, unique: true, uppercase: true },
    discount:   { type: Number, required: true, min: 1, max: 100 },
    isActive:   { type: Boolean, default: true },
    expiresAt:  Date,
    usageLimit: { type: Number, min: 1 },
    usedCount:  { type: Number, default: 0, min: 0 },
  }],
  brands: {
    type: [String],
    default: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Redmi', 'OnePlus', 'Huawei', 'Tecno', 'Infinix', 'Oppo', 'Vivo', 'Nokia', 'Anker', 'Oraimo', 'Sony', 'Lenovo', 'HP', 'Dell', 'Asus', 'Other'],
  },
  categories: {
    type: [String],
    default: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Power Bank', 'Laptop Accessories', 'Phone Accessories', 'Charger', 'Cable', 'Earphone', 'Headphones', 'Gaming', 'Other'],
  },
  ourStory: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
