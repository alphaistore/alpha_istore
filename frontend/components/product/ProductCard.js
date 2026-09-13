import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  if (!product) return null;
  const productId = product._id || product.id;
  const isWishlisted = wishlist?.some(w => (w._id || w.id) === productId);
  const price = product.basePrice || product.variants?.[0]?.price || 0;
  const comparePrice = product.comparePrice;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1, product.variants?.[0] || null);
    toast.success('Added to cart!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', height: '100%' }}>
      <button onClick={handleWishlist} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
        <Heart size={14} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#94a3b8'} />
      </button>

      <Link href={`/product/${productId}`} style={{ display: 'block', position: 'relative', paddingBottom: '90%', background: '#f8fafc', overflow: 'hidden' }}>
        <img
          src={product.images?.[0]?.url || '/images/placeholder-phone.jpg'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
        />
      </Link>

      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          <span style={{ background: '#0f766e', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>New</span>
          {hasDiscount && <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>-{discountPct}%</span>}
          {product.isHotDeal && <span style={{ background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>Hot</span>}
          {product.isFeatured && <span style={{ background: '#006989', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>Featured</span>}
        </div>
        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>{product.brand} · {product.condition}</p>
        <Link href={`/product/${productId}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
        </Link>
        <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            {hasDiscount && <p style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through', margin: 0 }}>{formatPrice(comparePrice)}</p>}
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{formatPrice(price)}</p>
          </div>
          <button onClick={handleAddToCart} style={{ background: '#006989', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap', width: '100%' }}>
            <ShoppingCart size={14} /> Add to cart
          </button>
          {product.variants?.length > 0 && (
            <p style={{ fontSize: '10px', color: totalStock > 0 ? '#16a34a' : '#ef4444', fontWeight: 600, margin: '2px 0 0' }}>
              {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
