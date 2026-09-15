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
    <div className="flex flex-col bg-surface border-2 border-surface-border rounded-2xl overflow-hidden relative h-full transition-shadow hover:shadow-md">
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-white border border-surface-border shadow-sm hover:bg-surface-muted transition-colors"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={14}
          fill={isWishlisted ? 'currentColor' : 'none'}
          color={isWishlisted ? '#991b1b' : 'var(--ink-subtle)'}
          className={isWishlisted ? 'text-status-danger' : ''}
        />
      </button>

      <Link href={`/product/${productId}`} className="relative block aspect-square bg-surface-muted overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/Apple-iPhone-18-Pro.png'}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain p-3"
        />
      </Link>

      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="badge">New</span>
          {hasDiscount && <span className="badge" style={{ backgroundColor: 'var(--status-danger)' }}>-{discountPct}%</span>}
          {product.isHotDeal && <span className="badge" style={{ backgroundColor: 'var(--status-warning)' }}>Hot</span>}
          {product.isFeatured && <span className="badge">Featured</span>}
        </div>
        <p className="text-[10px] font-semibold text-ink-subtle mb-1 uppercase tracking-wider">{product.brand} · {product.condition}</p>
        <Link href={`/product/${productId}`} className="block">
          <h3 className="text-sm font-bold text-ink leading-tight line-clamp-2 mb-2">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <div>
            {hasDiscount && <p className="text-[11px] text-ink-subtle line-through mb-1">{formatPrice(comparePrice)}</p>}
            <p className="text-lg font-extrabold text-ink">{formatPrice(price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="btn-primary h-11 rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} /> Add to cart
          </button>
          {product.variants?.length > 0 && (
            <p className="text-[10px] font-semibold text-center" style={{ color: totalStock > 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
              {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}