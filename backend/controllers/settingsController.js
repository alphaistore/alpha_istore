const Settings = require('../models/Settings');

const normalizePromoBanners = (banners) => (Array.isArray(banners) ? banners : []).map((banner) => {
  const normalized = {
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    cta: banner?.cta || '',
    color: banner?.color || '#000000',
    link: banner?.link || '',
  };

  if (banner?.pattern) normalized.pattern = banner.pattern;
  if (banner?.image) {
    normalized.image = typeof banner.image === 'string'
      ? { url: banner.image, public_id: '' }
      : { url: banner.image.url || '', public_id: banner.image.public_id || '' };
  }

  return normalized;
});

const getOrCreate = async () => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
};

// GET /api/settings (public)
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings (admin)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        ...req.body,
        ...(req.body.promoBanners !== undefined
          ? { promoBanners: normalizePromoBanners(req.body.promoBanners) }
          : {}),
      });
    } else {
      if (req.body.storeName !== undefined) settings.storeName = req.body.storeName;
      if (req.body.logo !== undefined) {
        settings.logo = typeof req.body.logo === 'string'
          ? { url: req.body.logo, public_id: '' }
          : { ...(settings.logo || {}), ...req.body.logo };
      }
      if (req.body.favicon !== undefined) {
        settings.favicon = typeof req.body.favicon === 'string'
          ? { url: req.body.favicon, public_id: '' }
          : { ...(settings.favicon || {}), ...req.body.favicon };
      }
      if (req.body.hero !== undefined) settings.hero = { ...(settings.hero || {}), ...req.body.hero };
      if (req.body.contact !== undefined) settings.contact = { ...(settings.contact || {}), ...req.body.contact };
      if (req.body.social !== undefined) settings.social = { ...(settings.social || {}), ...req.body.social };
      if (req.body.payment !== undefined) settings.payment = { ...(settings.payment || {}), ...req.body.payment };
      if (req.body.promoBanners !== undefined) {
        settings.promoBanners = normalizePromoBanners(req.body.promoBanners);
      }
      if (req.body.promoCodes !== undefined) {
        settings.promoCodes = req.body.promoCodes.map(code => ({
          code: code.code?.toUpperCase().trim(),
          discount: code.discount,
          isActive: code.isActive !== undefined ? code.isActive : true,
          expiresAt: code.expiresAt || undefined,
          usageLimit: code.usageLimit || undefined,
          usedCount: code.usedCount || 0,
        }));
      }
      if (req.body.delivery !== undefined) settings.delivery = { ...(settings.delivery || {}), ...req.body.delivery };
      if (req.body.heroImages !== undefined) settings.heroImages = req.body.heroImages;
      if (req.body.filters !== undefined) settings.filters = req.body.filters;
      if (req.body.brands !== undefined) settings.brands = req.body.brands;
      if (req.body.categories !== undefined) settings.categories = req.body.categories;
      if (req.body.ourStory !== undefined) settings.ourStory = req.body.ourStory;
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/settings/promo/:code (public)
const validatePromoCode = async (req, res) => {
  try {
    const settings = await getOrCreate();
    if (!settings?.promoCodes?.length) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
    }
    const code = req.params.code.toUpperCase().trim();
    const promo = settings.promoCodes.find(p => p.code === code && p.isActive);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promo code' });
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(404).json({ success: false, message: 'This promo code has expired' });
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(404).json({ success: false, message: 'This promo code has reached its usage limit' });
    }
    res.json({ success: true, promo: { code: promo.code, discount: promo.discount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  validatePromoCode,
};
