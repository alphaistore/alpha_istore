import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Search, X, Upload, ImageIcon,
  Star, Flame, Tag, Loader2, AlertTriangle,
  PackageCheck, Eye,
} from 'lucide-react';
import AdminLayout from '../../components/portal/AdminLayout';
import withAdminAuth from '../../components/portal/withAdminAuth';
import { productsAPI, uploadAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const BRANDS = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Redmi', 'OnePlus', 'Huawei', 'Tecno', 'Infinix', 'Oppo', 'Vivo', 'Nokia', 'Anker', 'Oraimo', 'Sony', 'Lenovo', 'HP', 'Dell', 'Asus', 'Other'];
const CONDITIONS = ['Brand New', 'UK Used', 'Ghana Used', 'Refurbished'];
const CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Power Bank', 'Laptop Accessories', 'Phone Accessories', 'Charger', 'Cable', 'Earphone', 'Headphones', 'Gaming', 'Other'];

const EMPTY_FORM = {
  name: '', brand: 'Apple', category: 'Smartphone', condition: 'Brand New',
  description: '', basePrice: '', comparePrice: '',
  isFeatured: false, isHotDeal: false, isActive: true,
  images: [],
  variants: [],
  flashSale: { active: false, endsAt: '', salePrice: '' },
  specifications: [],
  tags: '',
};

function InputField({ label, id, error, ...props }) {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-xs font-semibold text-ink-muted mb-1.5">{label}</label>}
      <input
        id={id}
        className={`w-full h-10 px-3 text-sm rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-surface-border bg-white'} focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange, icon: Icon, color = 'bg-primary' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer select-none ${checked ? `border-primary bg-primary/5` : 'border-surface-border bg-white'}`}
    >
      {Icon && <Icon className={`h-4 w-4 ${checked ? 'text-primary' : 'text-ink-subtle'}`} />}
      <span className={`text-sm font-semibold ${checked ? 'text-primary' : 'text-ink-muted'}`}>{label}</span>
      <div className={`ml-auto w-9 h-5 rounded-full transition-colors relative ${checked ? color : 'bg-surface-border'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </button>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newVariant, setNewVariant] = useState({ colorName: '', colorHex: '#000000', storage: '', price: '', stock: '' });
  const [newSpec, setNewSpec] = useState({ k: '', v: '' });
  const fileRef = useRef();

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = async (q = '') => {
    const res = await productsAPI.list({ search: q, limit: 50, page: 1 });
    return res.products || [];
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        setProducts(await fetchProducts());
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setProducts(await fetchProducts(search));
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ── Form helpers ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setNewVariant({ colorName: '', colorHex: '#000000', storage: '', price: '', stock: '' });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product._id);
    setForm({
      name: product.name || '',
      brand: product.brand || 'Apple',
      category: product.category || 'Smartphone',
      condition: product.condition || 'Brand New',
      description: product.description || '',
      basePrice: product.basePrice ?? '',
      comparePrice: product.comparePrice ?? '',
      isFeatured: product.isFeatured || false,
      isHotDeal: product.isHotDeal || false,
      isActive: product.isActive !== false,
      images: product.images || [],
      variants: product.variants || [],
      flashSale: {
        active: product.flashSale?.active || false,
        endsAt: product.flashSale?.endsAt ? product.flashSale.endsAt.split('T')[0] : '',
        salePrice: product.flashSale?.discount ?? '',
      },
      specifications: product.specifications ? (Array.isArray(product.specifications)
        ? product.specifications
        : product.specifications instanceof Map
          ? [...product.specifications.entries()].map(([k, v]) => ({ k, v }))
          : Object.entries(product.specifications || {}).map(([k, v]) => ({ k, v }))
      ) : [],
      tags: (product.tags || []).join(', '),
    });
    setErrors({});
    setNewVariant({ colorName: '', colorHex: '#000000', storage: '', price: '', stock: '' });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setFlash = (key, val) => setForm(f => ({ ...f, flashSale: { ...f.flashSale, [key]: val } }));

  // ── Image upload ────────────────────────────────────────────────────────────
  const handleImages = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    try {
      const res = await uploadAPI.images(fd);
      const uploaded = (res.images || res.urls || []).map(u =>
        typeof u === 'string' ? { url: u, public_id: '' } : u
      );
      setField('images', [...form.images, ...uploaded]);
      toast.success('Images uploaded');
    } catch {
      toast.error('Image upload failed. Check Cloudinary config.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setField('images', form.images.filter((_, i) => i !== idx));

  // ── Variants ────────────────────────────────────────────────────────────────
  const addVariant = () => {
    if (!newVariant.price) return;
    setField('variants', [...form.variants, {
      color: { name: newVariant.colorName, hex: newVariant.colorHex },
      storage: newVariant.storage,
      price: Number(newVariant.price),
      stock: Number(newVariant.stock) || 0,
    }]);
    setNewVariant({ colorName: '', colorHex: '#000000', storage: '', price: '', stock: '' });
  };
  const removeVariant = (idx) => setField('variants', form.variants.filter((_, i) => i !== idx));

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.basePrice || isNaN(form.basePrice)) e.basePrice = 'Valid price required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      brand: form.brand,
      category: form.category,
      condition: form.condition,
      description: form.description,
      basePrice: Number(form.basePrice),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      isFeatured: form.isFeatured,
      isHotDeal: form.isHotDeal,
      isActive: form.isActive,
      images: form.images,
      variants: form.variants,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      specifications: (form.specifications || []).reduce((acc, s) => { if (s.k) acc[s.k] = s.v || ''; return acc; }, {}),
      flashSale: form.flashSale.active ? {
        active: true,
        endsAt: form.flashSale.endsAt || undefined,
        discount: form.flashSale.salePrice ? Number(form.flashSale.salePrice) : undefined,
      } : { active: false },
    };
    try {
      if (editing) {
        await productsAPI.update(editing, payload);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created!');
      }
      closeForm();
      fetchProducts(search);
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      setConfirmDelete(null);
      fetchProducts(search);
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // ── Total stock ─────────────────────────────────────────────────────────────
  const totalStock = (p) => p.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;

  return (
    <>
      <Head><title>Products — Admin</title></Head>
      <AdminLayout title="Products" subtitle="Manage your store inventory">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex h-10 shrink-0 items-center gap-2 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-smooth transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-surface-border bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border text-sm">
              <thead className="bg-surface-muted">
                <tr className="text-left text-xs uppercase tracking-wider text-ink-subtle">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-surface-muted animate-pulse rounded-md" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <PackageCheck className="h-10 w-10 mx-auto text-ink-subtle mb-3" />
                      <p className="text-sm text-ink-subtle font-medium">No products found</p>
                      <p className="text-xs text-ink-subtle mt-1">Click &quot;Add Product&quot; to create your first one.</p>
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product._id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-surface-border bg-surface-muted shrink-0">
                            {product.images?.[0]?.url ? (
                              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-ink-subtle" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-ink text-sm leading-tight">{product.name}</p>
                            <p className="text-xs text-ink-subtle mt-0.5">{product.condition}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{product.brand}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{formatPrice(product.basePrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${totalStock(product) === 0 ? 'text-red-500' : 'text-ink'}`}>
                          {totalStock(product)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {product.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700">Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-surface-border text-ink-subtle">Hidden</span>
                          )}
                          {product.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-700"><Star className="h-2.5 w-2.5" />Featured</span>
                          )}
                          {product.isHotDeal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600"><Flame className="h-2.5 w-2.5" />Hot</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(product)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-surface-muted text-ink-muted hover:text-primary transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(product)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product count */}
        {!loading && products.length > 0 && (
          <p className="mt-3 text-xs text-ink-subtle text-right">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        )}
      </AdminLayout>

      {/* ── Delete Confirmation ──────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-smooth-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-11 w-11 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </span>
              <div>
                <h3 className="font-bold text-ink">Delete Product?</h3>
                <p className="text-sm text-ink-muted">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-ink-muted mb-6 bg-surface-muted rounded-xl px-4 py-3">
              <span className="font-semibold text-ink">{confirmDelete.name}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 h-10 rounded-xl border border-surface-border text-sm font-semibold text-ink hover:bg-surface-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                disabled={deleting === confirmDelete._id}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting === confirmDelete._id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Form Drawer ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeForm} />

          {/* Drawer */}
          <div className="w-full max-w-2xl bg-surface-muted overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-surface-border sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-ink">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-xs text-ink-subtle mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={closeForm} className="h-9 w-9 rounded-full hover:bg-surface-muted flex items-center justify-center text-ink-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 px-6 py-6 space-y-6">

              {/* ── Basic Info ──────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Basic Information</h3>
                <InputField label="Product Name *" id="name" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. iPhone 15 Pro Max" error={errors.name} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1.5">Brand</label>
                    <input list="brand-list" value={form.brand} onChange={e => setField('brand', e.target.value)} className="w-full h-10 px-3 text-sm rounded-xl border border-surface-border bg-white" />
                    <datalist id="brand-list">{BRANDS.map(b => <option key={b} value={b} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1.5">Category</label>
                    <input list="category-list" value={form.category} onChange={e => setField('category', e.target.value)} className="w-full h-10 px-3 text-sm rounded-xl border border-surface-border bg-white" />
                    <datalist id="category-list">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Condition</label>
                  <input list="condition-list" value={form.condition} onChange={e => setField('condition', e.target.value)} className="w-full h-10 px-3 text-sm rounded-xl border border-surface-border bg-white" />
                  <datalist id="condition-list">{CONDITIONS.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    rows={3}
                    placeholder="Describe the product features, specs, box contents…"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setField('tags', e.target.value)}
                    placeholder="iphone, apple, 5g, flagship"
                    className="w-full h-10 px-3 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* ── Pricing ─────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Pricing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Base Price (GHS) *" id="basePrice" type="number" min="0" step="0.01" value={form.basePrice} onChange={e => setField('basePrice', e.target.value)} placeholder="0.00" error={errors.basePrice} />
                  <InputField label="Compare Price (GHS)" id="comparePrice" type="number" min="0" step="0.01" value={form.comparePrice} onChange={e => setField('comparePrice', e.target.value)} placeholder="Original price (optional)" />
                </div>
              </div>

              {/* ── Images ──────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Images</h3>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative group h-20 w-20 overflow-hidden rounded-xl border border-surface-border">
                        <Image src={img.url} alt={`Product image ${idx + 1}`} fill className="object-cover" unoptimized />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleImages(e.target.files)} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-surface-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-ink-subtle hover:text-primary transition-all disabled:opacity-60"
                >
                  {uploading ? (
                    <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-xs font-medium">Uploading…</span></>
                  ) : (
                    <><Upload className="h-6 w-6" /><span className="text-xs font-medium">Click to upload images</span></>
                  )}
                </button>
                <p className="text-[11px] text-ink-subtle">Requires Cloudinary to be configured in backend .env</p>
              </div>

              {/* ── Specifications ───────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Specifications</h3>
                {form.specifications.length > 0 && (
                  <div className="space-y-2">
                    {form.specifications.map((s, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input value={s.k} onChange={e => {
                          const arr = [...form.specifications]; arr[idx] = { ...arr[idx], k: e.target.value }; setField('specifications', arr);
                        }} placeholder="Key (e.g. Battery)" className="col-span-5 h-9 px-3 rounded-xl border border-surface-border" />
                        <input value={s.v} onChange={e => {
                          const arr = [...form.specifications]; arr[idx] = { ...arr[idx], v: e.target.value }; setField('specifications', arr);
                        }} placeholder="Value (e.g. 5000mAh)" className="col-span-6 h-9 px-3 rounded-xl border border-surface-border" />
                        <button type="button" onClick={() => setField('specifications', form.specifications.filter((_, i) => i !== idx))} className="col-span-1 h-9 rounded-xl bg-red-50 text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={newSpec.k}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, k: e.target.value }))}
                    placeholder="Key"
                    className="h-9 px-3 rounded-xl border border-surface-border"
                  />
                  <input
                    value={newSpec.v}
                    onChange={(e) => setNewSpec((prev) => ({ ...prev, v: e.target.value }))}
                    placeholder="Value"
                    className="h-9 px-3 rounded-xl border border-surface-border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const k = newSpec.k.trim();
                      if (!k) return;
                      setField('specifications', [...form.specifications, { k, v: newSpec.v.trim() }]);
                      setNewSpec({ k: '', v: '' });
                    }}
                    className="h-9 rounded-xl bg-surface-muted"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-ink-subtle">Add product specifications such as battery, camera, dimensions, etc.</p>
              </div>

              {/* ── Variants ────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Variants (Color + Storage)</h3>

                {form.variants.length > 0 && (
                  <div className="space-y-2">
                    {form.variants.map((v, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                        {v.color?.hex && <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: v.color.hex, border: '2px solid #e2e8f0', flexShrink: 0 }} />}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', flex: 1 }}>{v.color?.name || 'No color'} — {v.storage || 'No storage'} — GHS {v.price}</span>
                        <label style={{ fontSize: '12px', color: '#64748b' }}>Stock:</label>
                        <input
                          type="number"
                          min="0"
                          value={v.stock || 0}
                          onChange={e => {
                            const updated = [...form.variants];
                            updated[idx] = { ...updated[idx], stock: Number(e.target.value) };
                            setField('variants', updated);
                          }}
                          style={{ width: '70px', height: '32px', padding: '0 8px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}
                        />
                        <button type="button" onClick={() => removeVariant(idx)} style={{ background: '#fef2f2', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#ef4444' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add variant row */}
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Color name (e.g. Black)" value={newVariant.colorName} onChange={e => setNewVariant(v => ({ ...v, colorName: e.target.value }))}
                    className="h-9 px-3 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-ink-subtle shrink-0">Hex:</label>
                    <input type="color" value={newVariant.colorHex} onChange={e => setNewVariant(v => ({ ...v, colorHex: e.target.value }))}
                      className="h-9 w-14 cursor-pointer rounded-lg border border-surface-border bg-white p-1" />
                    <span className="text-xs text-ink-subtle font-mono">{newVariant.colorHex}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Size / Storage (e.g. 128GB)" value={newVariant.storage} onChange={e => setNewVariant(v => ({ ...v, storage: e.target.value }))}
                    className="h-9 px-3 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <input type="number" placeholder="Price (GHS)" value={newVariant.price} onChange={e => setNewVariant(v => ({ ...v, price: e.target.value }))}
                    className="h-9 px-3 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  <input type="number" placeholder="Stock qty" value={newVariant.stock} onChange={e => setNewVariant(v => ({ ...v, stock: e.target.value }))}
                    className="h-9 px-3 text-sm rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <button type="button" onClick={addVariant}
                  className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold rounded-xl bg-surface-muted hover:bg-surface-border text-ink transition-colors">
                  <Plus className="h-4 w-4" /> Add Variant
                </button>
              </div>

              {/* ── Toggles ──────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-3 border border-surface-border">
                <h3 className="text-sm font-bold text-ink">Labels & Visibility</h3>
                <Toggle label="Featured Product" checked={form.isFeatured} onChange={v => setField('isFeatured', v)} icon={Star} />
                <Toggle label="Hot Deal" checked={form.isHotDeal} onChange={v => setField('isHotDeal', v)} icon={Flame} />
                <Toggle label="Active (visible in store)" checked={form.isActive} onChange={v => setField('isActive', v)} icon={Eye} />
              </div>

              {/* ── Flash Sale ───────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 space-y-4 border border-surface-border">
                <Toggle label="Enable Flash Sale" checked={form.flashSale.active} onChange={v => setFlash('active', v)} icon={Tag} />
                {form.flashSale.active && (
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Sale End Date" id="flashEnd" type="date" value={form.flashSale.endsAt} onChange={e => setFlash('endsAt', e.target.value)} />
                    <InputField label="Discount (%)" id="flashPrice" type="number" min="1" max="99" value={form.flashSale.salePrice} onChange={e => setFlash('salePrice', e.target.value)} placeholder="e.g. 20" />
                  </div>
                )}
              </div>

              {/* ── Submit ───────────────────────────────────────── */}
              <div className="flex gap-3 pb-4">
                <button type="button" onClick={closeForm} className="flex-1 h-11 rounded-xl border border-surface-border text-sm font-semibold text-ink hover:bg-surface-muted transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-smooth"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default withAdminAuth(AdminProducts);

AdminProducts.getLayout = (page) => page;
