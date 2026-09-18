import { useAdminAuthStore } from '../../store/adminAuth';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Save, Store, MapPin, Image as ImageIcon, CreditCard, Plus, Trash2, Link as LinkIcon, UploadCloud, Loader2, Truck, Info } from 'lucide-react';
import AdminLayout from '../../components/portal/AdminLayout';
import withAdminAuth from '../../components/portal/withAdminAuth';
import { settingsAPI, uploadAPI, authAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import PasswordInput from '../../components/ui/PasswordInput';

const inputClass =
  'w-full h-11 px-4 text-sm bg-surface-muted border border-transparent rounded-xl text-ink placeholder:text-ink-subtle focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all';
const textareaClass =
  'w-full p-4 text-sm bg-surface-muted border border-transparent rounded-xl text-ink placeholder:text-ink-subtle focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all resize-none';
const labelClass =
  'block text-xs font-bold uppercase tracking-wider text-ink-subtle mb-2';
const cardClass = 'rounded-3xl border border-surface-border bg-white p-8 shadow-sm';

function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'AlphaiStore',
    logo: { url: '', public_id: '' },
    favicon: { url: '', public_id: '' },
    hero: { title: '', subtitle: '', image: { url: '', public_id: '' } },
    heroImages: [],
    filters: {
      brands: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Redmi', 'OnePlus', 'Huawei', 'Tecno', 'Infinix', 'Oppo', 'Vivo', 'Nokia', 'Anker', 'Oraimo', 'Sony', 'Lenovo', 'HP', 'Dell', 'Asus'].map(name => ({ name, enabled: true })),
      conditions: [],
      storage: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'].map(name => ({ name, enabled: true })),
    },
    contact: { whatsapp: [''], phones: [''], email: 'info@alphaistoregh.com', address: 'Adum, near Alife Supermarket, opposite Jolly Shop, Kumasi, Ghana', website: '', googleMapEmbedUrl: '' },
    payment: { paystack: true, payOnPickup: true, accountName: '', accountNumber: '', instructions: '' },
    social: { facebook: '', instagram: '', twitter: '', tiktok: '' },
    promoBanners: [],
    brands: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Redmi', 'OnePlus', 'Huawei', 'Tecno', 'Infinix', 'Oppo', 'Vivo', 'Nokia', 'Anker', 'Oraimo', 'Sony', 'Lenovo', 'HP', 'Dell', 'Asus', 'Other'],
    categories: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Power Bank', 'Laptop Accessories', 'Phone Accessories', 'Charger', 'Cable', 'Earphone', 'Headphones', 'Gaming', 'Other'],
    ourStory: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [credForm, setCredForm] = useState({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [credSaving, setCredSaving] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('');

  useEffect(() => {
    let active = true;
    settingsAPI.get().then(res => {
      if (active && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { active = false };
  }, []);

  const handleChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleContactArray = (field, index, value) => {
    const newArr = [...(settings.contact[field] || [])];
    newArr[index] = value;
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: newArr }
    }));
  };

  const addContactItem = (field) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: [...(prev.contact[field] || []), ''] }
    }));
  };

  const removeContactItem = (field, index) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: prev.contact[field].filter((_, i) => i !== index) }
    }));
  };

  // Promo Banner Handlers
  const addPromoBanner = () => {
    setSettings(prev => ({
      ...prev,
      promoBanners: [...(prev.promoBanners || []), { title: '', subtitle: '', cta: '', color: '#000000', image: { url: '' }, link: '' }]
    }));
  };

  const removePromoBanner = (index) => {
    setSettings(prev => ({
      ...prev,
      promoBanners: prev.promoBanners.filter((_, i) => i !== index)
    }));
  };

  const handlePromoChange = (index, field, value) => {
    const newPromos = [...(settings.promoBanners || [])];
    newPromos[index] = { ...newPromos[index], [field]: value };
    setSettings(prev => ({ ...prev, promoBanners: newPromos }));
  };

  const handleImageUpload = async (e, section, field = null, promoIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const id = promoIndex !== null ? `promo-${promoIndex}` : (field ? `${section}-${field}` : section);
    setUploading(id);

    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await uploadAPI.images(formData);
      
      if (res.success && res.images?.length > 0) {
        const uploaded = res.images[0];
        const imageUrl = typeof uploaded === 'string' ? uploaded : uploaded.url;
        const publicId = typeof uploaded === 'string' ? '' : uploaded.public_id || '';

        if (promoIndex !== null) {
          setSettings(prev => ({
            ...prev,
            promoBanners: (prev.promoBanners || []).map((promo, index) =>
              index === promoIndex ? { ...promo, image: uploaded } : promo
            ),
          }));
        } else if (field) {
          setSettings(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: uploaded }
          }));
        } else if (section === 'favicon' || section === 'logo') {
          setSettings(prev => ({
            ...prev,
            [section]: { url: imageUrl, public_id: publicId }
          }));
        } else {
          setSettings(prev => ({ ...prev, [section]: imageUrl }));
        }
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading('');
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        hero: {
          ...(settings.hero || {}),
          image: settings.hero?.image && typeof settings.hero.image === 'object'
            ? {
                url: settings.hero.image.url || '',
                public_id: settings.hero.image.public_id || '',
              }
            : { url: '', public_id: '' },
        },
      };
      const res = await settingsAPI.update(payload);
      if (res.success) {
        toast.success('Settings saved!');
        if (settings.storeName) localStorage.setItem('storeName', settings.storeName);
        if (settings.logo?.url) localStorage.setItem('storeLogo', settings.logo.url);
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (credForm.newPassword && credForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (credForm.newPassword && !credForm.currentPassword) {
      toast.error('Please enter your current password to change password');
      return;
    }
    setCredSaving(true);
    try {
      if (credForm.newPassword) {
        await authAPI.changePassword({ currentPassword: credForm.currentPassword, newPassword: credForm.newPassword });
      }
      if (credForm.email) {
        await authAPI.updateProfile({ email: credForm.email });
      }
      toast.success('Credentials updated! Please log in again if email changed.');
      setCredForm({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // Show server-provided message when available
      const message = err?.response?.data?.message || 'Failed to update credentials.';
      toast.error(message);
    } finally {
      setCredSaving(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Head>
        <title>Settings — Admin</title>
      </Head>
      <AdminLayout title="Settings" subtitle="Configure your storefront layout, branding, and contact info">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* General & Branding Section */}
            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink">Branding & Hero</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Store Name</label>
                  <input type="text" value={settings.storeName} onChange={(e) => handleChange(null, 'storeName', e.target.value)} className={inputClass} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className={labelClass}>Website Logo</label>
                    <div className="flex items-center gap-4">
                      {settings.logo?.url && <img src={settings.logo.url} alt="Logo" className="h-12 w-12 object-contain bg-surface-muted rounded-xl" />}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 h-11 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-border rounded-xl transition-colors text-sm font-semibold">
                        <UploadCloud className="w-4 h-4" />
                        {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} />
                      </label>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div>
                    <label className={labelClass}>Favicon</label>
                    <div className="flex items-center gap-4">
                      {settings.favicon?.url && <img src={settings.favicon.url} alt="Favicon" className="h-12 w-12 object-contain bg-surface-muted rounded-xl" />}
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 h-11 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-border rounded-xl transition-colors text-sm font-semibold">
                        <UploadCloud className="w-4 h-4" />
                        {uploading === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'favicon')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border">
                  <label className={labelClass}>Hero Title</label>
                  <input type="text" value={settings.hero?.title || ''} onChange={(e) => handleChange('hero', 'title', e.target.value)} className={inputClass} placeholder="e.g. The Perfect iPhone" />
                </div>
                <div>
                  <label className={labelClass}>Hero Subtitle</label>
                  <input type="text" value={settings.hero?.subtitle || ''} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} className={inputClass} placeholder="e.g. Discover the latest..." />
                </div>
                <div>
                  <label className={labelClass}>Hero Image</label>
                  <div className="flex items-center gap-4">
                    {settings.hero?.image?.url && <img src={settings.hero.image.url} alt="Hero" className="h-20 w-20 object-cover bg-surface-muted rounded-xl" />}
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 h-11 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-border rounded-xl transition-colors text-sm font-semibold">
                      <UploadCloud className="w-4 h-4" />
                      {uploading === 'hero-image' ? 'Uploading...' : 'Upload Hero Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'hero', 'image')} />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border">
                  <div className="flex items-center justify-between mb-4">
                    <label className={labelClass}>Hero Carousel Images</label>
                    <button type="button" onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        heroImages: [...(prev.heroImages || []), { url: '', public_id: '' }]
                      }));
                    }} className="text-xs font-bold text-ink hover:text-ink/70">+ Add Image</button>
                  </div>
                  <div className="space-y-3">
                    {(settings.heroImages || []).map((img, idx) => (
                      <div key={idx} className="flex items-end gap-3">
                        <div className="flex-1">
                          {img.url && <img src={img.url} alt={`Hero ${idx + 1}`} className="h-16 w-full object-cover bg-surface-muted rounded-lg mb-2" />}
                          <label className="cursor-pointer w-full inline-flex items-center justify-center gap-2 px-4 h-10 bg-surface-muted text-ink-muted hover:text-ink hover:bg-surface-border rounded-xl transition-colors text-sm font-semibold">
                            <UploadCloud className="w-4 h-4" />
                            {uploading === `heroImage-${idx}` ? 'Uploading...' : 'Upload'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(`heroImage-${idx}`);
                              const formData = new FormData();
                              formData.append('images', file);
                              uploadAPI.images(formData).then(res => {
                                if (res.success && res.images?.length > 0) {
                                  const newImages = [...(settings.heroImages || [])];
                                  newImages[idx] = res.images[0];
                                  setSettings(prev => ({ ...prev, heroImages: newImages }));
                                }
                              }).catch(() => alert('Upload failed')).finally(() => setUploading(''));
                            }} />
                          </label>
                        </div>
                        <button type="button" onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            heroImages: (prev.heroImages || []).filter((_, i) => i !== idx)
                          }));
                        }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Promo Section */}
            <section className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-ink">Promo Banners</h2>
                </div>
                <button type="button" onClick={addPromoBanner} className="text-sm font-bold text-ink hover:text-ink/70">
                  + Add Banner
                </button>
              </div>
              <div className="space-y-8">
                {settings.promoBanners?.map((promo, idx) => (
                  <div key={idx} className="p-6 rounded-2xl border border-surface-border bg-surface-muted/30 relative">
                    <button type="button" onClick={() => removePromoBanner(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="space-y-4 pr-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Title</label>
                          <input type="text" value={promo.title || ''} onChange={(e) => handlePromoChange(idx, 'title', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Subtitle</label>
                          <input type="text" value={promo.subtitle || ''} onChange={(e) => handlePromoChange(idx, 'subtitle', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>CTA Button Text</label>
                          <input type="text" value={promo.cta || ''} onChange={(e) => handlePromoChange(idx, 'cta', e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Link URL</label>
                          <input type="text" value={promo.link || ''} onChange={(e) => handlePromoChange(idx, 'link', e.target.value)} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Background Color</label>
                          <input type="color" value={promo.color || '#000000'} onChange={(e) => handlePromoChange(idx, 'color', e.target.value)} className="w-full h-11 p-1 rounded-xl border border-transparent" />
                        </div>
                        <div>
                          <label className={labelClass}>Pattern</label>
                          <select value={promo.pattern || 'none'} onChange={(e) => handlePromoChange(idx, 'pattern', e.target.value)} className={inputClass}>
                            <option value="none">None</option>
                            <option value="dots">Dots</option>
                            <option value="waves">Waves</option>
                            <option value="grid">Grid</option>
                            <option value="lines">Lines</option>
                            <option value="zigzag">Zigzag</option>
                            <option value="cross">Cross</option>
                            <option value="diamonds">Diamonds</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className={labelClass}>Promo Image</label>
                        <div className="flex items-center gap-3">
                          {promo.image?.url && <img src={promo.image.url} alt="Promo" className="h-11 w-11 object-cover rounded-lg" />}
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 h-11 bg-white border border-surface-border text-ink-muted hover:text-ink rounded-xl text-sm font-semibold">
                            <UploadCloud className="w-4 h-4" />
                            {uploading === `promo-${idx}` ? '...' : 'Upload'}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, null, null, idx)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!settings.promoBanners?.length && <p className="text-sm text-ink-muted">No promo banners added. Click "+ Add Banner" to create one.</p>}
              </div>
            </section>

            {/* Filters Configuration Section */}
            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink">Shop Filters</h2>
              </div>
              <div className="space-y-8">
                {/* Brands Filter */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className={labelClass}>Brand Options</label>
                    <button type="button" onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        filters: { ...prev.filters, brands: [...(prev.filters?.brands || []), { name: '', enabled: true }] }
                      }));
                    }} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {(settings.filters?.brands || []).map((brand, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input type="text" value={brand.name || ''} onChange={(e) => {
                          const newBrands = [...(settings.filters?.brands || [])];
                          newBrands[idx] = { ...newBrands[idx], name: e.target.value };
                          setSettings(prev => ({ ...prev, filters: { ...prev.filters, brands: newBrands } }));
                        }} className={inputClass} placeholder="e.g. Apple" />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={brand.enabled} onChange={(e) => {
                            const newBrands = [...(settings.filters?.brands || [])];
                            newBrands[idx] = { ...newBrands[idx], enabled: e.target.checked };
                            setSettings(prev => ({ ...prev, filters: { ...prev.filters, brands: newBrands } }));
                          }} className="w-4 h-4 rounded border-surface-border text-ink" />
                          <span className="text-sm text-ink-muted">Show</span>
                        </label>
                        <button type="button" onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            filters: { ...prev.filters, brands: (prev.filters?.brands || []).filter((_, i) => i !== idx) }
                          }));
                        }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className={labelClass}>Condition Options</label>
                    <button type="button" onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        filters: { ...prev.filters, conditions: [...(prev.filters?.conditions || []), { name: '', enabled: true }] }
                      }));
                    }} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {(settings.filters?.conditions || []).map((cond, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input type="text" value={cond.name || ''} onChange={(e) => {
                          const newConds = [...(settings.filters?.conditions || [])];
                          newConds[idx] = { ...newConds[idx], name: e.target.value };
                          setSettings(prev => ({ ...prev, filters: { ...prev.filters, conditions: newConds } }));
                        }} className={inputClass} placeholder="e.g. Brand New" />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={cond.enabled} onChange={(e) => {
                            const newConds = [...(settings.filters?.conditions || [])];
                            newConds[idx] = { ...newConds[idx], enabled: e.target.checked };
                            setSettings(prev => ({ ...prev, filters: { ...prev.filters, conditions: newConds } }));
                          }} className="w-4 h-4 rounded border-surface-border text-ink" />
                          <span className="text-sm text-ink-muted">Show</span>
                        </label>
                        <button type="button" onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            filters: { ...prev.filters, conditions: (prev.filters?.conditions || []).filter((_, i) => i !== idx) }
                          }));
                        }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Filter */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className={labelClass}>Storage Options</label>
                    <button type="button" onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        filters: { ...prev.filters, storage: [...(prev.filters?.storage || []), { name: '', enabled: true }] }
                      }));
                    }} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add</button>
                  </div>
                  <div className="space-y-2">
                    {(settings.filters?.storage || []).map((stor, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input type="text" value={stor.name || ''} onChange={(e) => {
                          const newStor = [...(settings.filters?.storage || [])];
                          newStor[idx] = { ...newStor[idx], name: e.target.value };
                          setSettings(prev => ({ ...prev, filters: { ...prev.filters, storage: newStor } }));
                        }} className={inputClass} placeholder="e.g. 128GB" />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={stor.enabled} onChange={(e) => {
                            const newStor = [...(settings.filters?.storage || [])];
                            newStor[idx] = { ...newStor[idx], enabled: e.target.checked };
                            setSettings(prev => ({ ...prev, filters: { ...prev.filters, storage: newStor } }));
                          }} className="w-4 h-4 rounded border-surface-border text-ink" />
                          <span className="text-sm text-ink-muted">Show</span>
                        </label>
                        <button type="button" onClick={() => {
                          setSettings(prev => ({
                            ...prev,
                            filters: { ...prev.filters, storage: (prev.filters?.storage || []).filter((_, i) => i !== idx) }
                          }));
                        }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact & Map Section */}
            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink">Contact & Location</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${labelClass} mb-0`}>WhatsApp Numbers</label>
                    <button type="button" onClick={() => addContactItem('whatsapp')} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add Number</button>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(settings.contact?.whatsapp) ? settings.contact.whatsapp : []).map((num, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={num} onChange={(e) => handleContactArray('whatsapp', idx, e.target.value)} className={inputClass} placeholder="+233..." />
                        <button type="button" onClick={() => removeContactItem('whatsapp', idx)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${labelClass} mb-0`}>Phone Numbers</label>
                    <button type="button" onClick={() => addContactItem('phones')} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add Number</button>
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(settings.contact?.phones) ? settings.contact.phones : []).map((num, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={num} onChange={(e) => handleContactArray('phones', idx, e.target.value)} className={inputClass} placeholder="+233..." />
                        <button type="button" onClick={() => removeContactItem('phones', idx)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" value={settings.contact?.email || ''} onChange={(e) => handleChange('contact', 'email', e.target.value)} className={inputClass} placeholder="info@example.com" />
                </div>

                <div>
                  <label className={labelClass}>Physical Address</label>
                  <textarea rows={2} value={settings.contact?.address || ''} onChange={(e) => handleChange('contact', 'address', e.target.value)} className={textareaClass} placeholder="Enter full address" />
                </div>

                <div>
                  <label className={labelClass}>Website</label>
                  <input type="url" value={settings.contact?.website || ''} onChange={(e) => handleChange('contact', 'website', e.target.value)} className={inputClass} placeholder="https://example.com" />
                </div>

                <div>
                  <label className={labelClass}>Google Maps Link or Embed Code</label>
                  <input type="text" value={settings.contact?.googleMapEmbedUrl || ''} onChange={(e) => handleChange('contact', 'googleMapEmbedUrl', e.target.value)} className={inputClass} placeholder="https://www.google.com/maps/... or <iframe src=..." />
                </div>
              </div>
            </section>

            {/* Delivery Locations */}
            <section className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Truck className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink">Delivery Regions</h2>
                <p className="mt-2 text-sm text-ink-muted">List Ghana's regions and their capitals. Delivery charges are not added at checkout.</p>
              </div>
              <div className="space-y-4">
                {(Array.isArray(settings.delivery?.locations) ? settings.delivery.locations : []).map((loc, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className={labelClass}>Region</label>
                      <input type="text" value={loc.region || ''} onChange={(e) => {
                        const newLocs = [...(settings.delivery?.locations || [])];
                        newLocs[idx] = { ...newLocs[idx], region: e.target.value };
                        setSettings(prev => ({ ...prev, delivery: { ...prev.delivery, locations: newLocs } }));
                      }} className={inputClass} placeholder="Region name" />
                    </div>
                    <button type="button" onClick={() => {
                      setSettings(prev => ({
                        ...prev,
                        delivery: { ...prev.delivery, locations: (prev.delivery?.locations || []).filter((_, i) => i !== idx) }
                      }));
                    }} className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    delivery: { 
                      ...prev.delivery, 
                      locations: [...(prev.delivery?.locations || []), { region: '', fee: 0 }]
                    }
                  }));
                }} className="text-xs font-bold text-xs font-bold text-ink hover:text-ink/70">+ Add Location</button>
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1 space-y-8">
            <div className={`${cardClass} lg:sticky lg:top-24`}>
              
              {/* Social Media Links */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
                    <LinkIcon className="h-5 w-5" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-ink">Social Links</h2>
                </div>
                <div className="space-y-4">
                  {['facebook', 'instagram', 'twitter', 'tiktok'].map(platform => (
                    <div key={platform}>
                      <label className={labelClass}>{platform}</label>
                      <input type="text" value={settings.social?.[platform] || ''} onChange={(e) => handleChange('social', platform, e.target.value)} className={inputClass} placeholder={`https://${platform}.com/...`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments */}
              <div className="flex items-center gap-3 mb-6 pt-6 border-t border-surface-border">
                <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <CreditCard className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-ink">Payments</h2>
              </div>
              <div className="space-y-4">
                {['paystack', 'payOnPickup'].map((key) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-surface-border cursor-pointer hover:bg-surface-muted transition-colors">
                    <span className="text-sm font-semibold text-ink">{key === 'payOnPickup' ? 'Pay on Pickup' : 'Paystack'}</span>
                    <input type="checkbox" checked={!!settings.payment?.[key]} onChange={(e) => handleChange('payment', key, e.target.checked)} className="w-5 h-5 rounded border-surface-border text-ink focus:ring-ink" />
                  </label>
                ))}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Payment account name</label>
                    <input value={settings.payment?.accountName || ''} onChange={(e) => handleChange('payment', 'accountName', e.target.value)} className={inputClass} placeholder="Optional account or MoMo name" />
                  </div>
                  <div>
                    <label className={labelClass}>Payment account / number</label>
                    <input value={settings.payment?.accountNumber || ''} onChange={(e) => handleChange('payment', 'accountNumber', e.target.value)} className={inputClass} placeholder="Optional account or MoMo number" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Payment instructions</label>
                  <textarea value={settings.payment?.instructions || ''} onChange={(e) => handleChange('payment', 'instructions', e.target.value)} className={textareaClass} rows={3} placeholder="Optional instructions shown on invoices" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-surface-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-10 w-10 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                  </span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-ink">Promo Codes</h2>
                    <p className="text-xs text-ink-subtle">Create discount codes for customers</p>
                  </div>
                </div>

                {/* Add new promo code */}
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} className={inputClass} placeholder="CODE (e.g. SAVE20)" />
                  <input type="number" value={newPromoDiscount} onChange={(e) => setNewPromoDiscount(e.target.value)} className={inputClass} placeholder="%" min="1" max="100" style={{ width: '80px' }} />
                  <button type="button" onClick={() => {
                    if (!newPromoCode.trim() || !newPromoDiscount) return;
                    const code = { code: newPromoCode.toUpperCase().trim(), discount: Number(newPromoDiscount), isActive: true };
                    setSettings(prev => ({ ...prev, promoCodes: [...(prev.promoCodes || []), code] }));
                    setNewPromoCode('');
                    setNewPromoDiscount('');
                  }} className="h-11 px-4 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors whitespace-nowrap">Add</button>
                </div>

                {/* List promo codes */}
                <div className="space-y-2">
                  {(settings.promoCodes || []).map((promo, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-surface-border">
                      <div className="flex items-center gap-3">
                        <span className={`h-8 w-8 inline-flex items-center justify-center rounded-lg text-xs font-bold ${promo.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {promo.discount}%
                        </span>
                        <div>
                          <p className="text-sm font-bold text-ink">{promo.code}</p>
                          <p className="text-xs text-ink-subtle">
                            {promo.isActive ? 'Active' : 'Inactive'} · Used {promo.usedCount || 0}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''} times
                            {promo.expiresAt ? ` · Expires ${new Date(promo.expiresAt).toLocaleDateString()}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => {
                          const updated = [...settings.promoCodes];
                          updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                          setSettings(prev => ({ ...prev, promoCodes: updated }));
                        }} className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors ${promo.isActive ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                          {promo.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" onClick={() => {
                          setSettings(prev => ({ ...prev, promoCodes: prev.promoCodes.filter((_, i) => i !== idx) }));
                        }} className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!settings.promoCodes || settings.promoCodes.length === 0) && (
                    <p className="text-xs text-ink-subtle text-center py-4">No promo codes created yet.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Save Button */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-ink text-white font-bold hover:bg-ink/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-smooth flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>

              {/* Credentials */}
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-ink mb-4">Change Credentials</h3>
                <form onSubmit={handleChangeCredentials} className="space-y-3">
                  <div>
                    <label className={labelClass}>New Email</label>
                    <input type="email" value={credForm.email} onChange={(e) => setCredForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="new@email.com" />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Current Password
                      <Info className="inline-block ml-2 w-4 h-4 text-ink-subtle align-middle" title="We require your current password to confirm and authorize password changes." />
                    </label>
                    <PasswordInput value={credForm.currentPassword} onChange={(e) => setCredForm(f => ({ ...f, currentPassword: e.target.value }))} className={inputClass} placeholder="Enter current password" />
                    <p className="text-xs text-ink-subtle mt-2">We require your current password to confirm and authorize password changes.</p>
                  </div>
                  <div>
                    <label className={labelClass}>New Password</label>
                    <PasswordInput value={credForm.newPassword} onChange={(e) => setCredForm(f => ({ ...f, newPassword: e.target.value }))} className={inputClass} placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <PasswordInput value={credForm.confirmPassword} onChange={(e) => setCredForm(f => ({ ...f, confirmPassword: e.target.value }))} className={inputClass} placeholder="Re-enter password" />
                  </div>
                  <button type="submit" disabled={credSaving} className="w-full h-10 rounded-xl bg-surface-muted text-ink font-bold hover:bg-surface-border transition-colors disabled:opacity-60">
                    {credSaving ? 'Updating...' : 'Update Credentials'}
                  </button>
                </form>
              </section>

              {/* Brands */}
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-ink mb-4">Brands</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" id="newBrand" className={inputClass} placeholder="New brand name" />
                  <button type="button" onClick={() => {
                    const input = document.getElementById('newBrand');
                    const val = input.value.trim();
                    if (!val) return;
                    if (settings.brands?.includes(val)) return;
                    setSettings(prev => ({ ...prev, brands: [...(prev.brands || []), val] }));
                    input.value = '';
                  }} className="h-10 px-3 rounded-xl bg-ink text-white text-sm font-bold hover:bg-ink/80">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(settings.brands || []).map((brand, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-muted text-sm font-medium text-ink">
                      {brand}
                      <button type="button" onClick={() => setSettings(prev => ({ ...prev, brands: prev.brands.filter((_, idx) => idx !== i) }))} className="text-ink-subtle hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Categories */}
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-ink mb-4">Categories</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" id="newCategory" className={inputClass} placeholder="New category name" />
                  <button type="button" onClick={() => {
                    const input = document.getElementById('newCategory');
                    const val = input.value.trim();
                    if (!val) return;
                    if (settings.categories?.includes(val)) return;
                    setSettings(prev => ({ ...prev, categories: [...(prev.categories || []), val] }));
                    input.value = '';
                  }} className="h-10 px-3 rounded-xl bg-ink text-white text-sm font-bold hover:bg-ink/80">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(settings.categories || []).map((cat, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-muted text-sm font-medium text-ink">
                      {cat}
                      <button type="button" onClick={() => setSettings(prev => ({ ...prev, categories: prev.categories.filter((_, idx) => idx !== i) }))} className="text-ink-subtle hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Our Story */}
              <section className={cardClass}>
                <h3 className="text-lg font-bold text-ink mb-4">Our Story</h3>
                <textarea
                  value={settings.ourStory || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, ourStory: e.target.value }))}
                  className={textareaClass}
                  rows={6}
                  placeholder="Tell your customers your story..."
                />
              </section>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAdminAuth(AdminSettings);

AdminSettings.getLayout = (page) => page;
