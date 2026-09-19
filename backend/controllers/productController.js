const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listingFields = [
  'name', 'slug', 'brand', 'category', 'condition', 'images', 'variants',
  'basePrice', 'comparePrice', 'isFeatured', 'isHotDeal', 'flashSale',
  'rating', 'numReviews', 'totalSold', 'isActive', 'createdAt',
].join(' ');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, brand, condition, storage,
      minPrice, maxPrice, search, sort = '-createdAt',
      featured, hotDeal, category,
    } = req.query;

    const query = { isActive: true };
    if (brand)     query.brand = { $in: brand.split(',').map((value) => new RegExp(`^${escapeRegex(value)}$`, 'i')) };
    if (condition) query.condition = { $in: condition.split(',').map((value) => new RegExp(`^${escapeRegex(value)}$`, 'i')) };
    if (category)  query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (hotDeal  === 'true') query.isHotDeal  = true;
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (storage) {
      query['variants.storage'] = { $in: storage.split(',').map((value) => new RegExp(`^${escapeRegex(value)}$`, 'i')) };
    }

    const sortMap = {
      '-createdAt':  { createdAt: -1 },
      'price_asc':   { basePrice: 1 },
      'price_desc':  { basePrice: -1 },
      'rating':      { rating: -1 },
      'popular':     { totalSold: -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).select(listingFields).sort(sortObj).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'firstName lastName avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/slug/:slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('reviews.user', 'firstName lastName avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    // Delete images from Cloudinary
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => String(r.user) === String(req.user._id));
    if (alreadyReviewed) return res.status(409).json({ success: false, message: 'You already reviewed this product' });

    product.reviews.push({
      user: req.user._id,
      name: req.user.fullName,
      rating: Number(rating),
      comment,
    });
    product.recalcRating();
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/homefeed
exports.getHomeFeed = async (req, res) => {
  try {
    const [featured, hotDeals, latest] = await Promise.all([
      Product.find({ isActive: true, isFeatured: true }).select(listingFields).sort({ createdAt: -1 }).limit(4),
      Product.find({ isActive: true, isHotDeal: true }).select(listingFields).sort({ createdAt: -1 }).limit(3),
      Product.find({ isActive: true }).select(listingFields).sort({ createdAt: -1 }).limit(12),
    ]);

    res.json({
      success: true,
      featured,
      hotDeals,
      latest,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/stats (admin)
exports.getStats = async (req, res) => {
  try {
    const [total, featured, hotDeals, brands] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ isHotDeal: true }),
      Product.distinct('brand'),
    ]);
    res.json({ success: true, stats: { total, featured, hotDeals, brands } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
