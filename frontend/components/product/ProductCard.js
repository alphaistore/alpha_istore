import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const FALLBACK_IMAGE = '/Apple-iPhone-18-Pro.png';

const getImageUrl = (image) => {
  if (Array.isArray(image)) return getImageUrl(image[0]);
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object') return image.url || image.secure_url || '';
  return '';
};

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  if (!product) return null;
  const productId = product._id || product.id;
  const isWishlisted = wishlist?.some(w => (w._id || w.id) === productId);
  const price = product.basePrice || product.variants?.[0]?.price || 0;
  const comparePrice = product.comparePrice;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const totalStock = product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? 0;
  const isOutOfStock = hasVariants && totalStock === 0;
  const imageUrl = getImageUrl(product.images?.[0]) || FALLBACK_IMAGE;
  const badges = [
    hasDiscount && { label: `-${discountPct}%`, tone: 'sale' },
    product.isFeatured && { label: 'Featured', tone: 'neutral' },
    product.isHotDeal && { label: 'Hot deal', tone: 'neutral' },
  ].filter(Boolean).slice(0, 2);

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1, product.variants?.[0] || null);
    toast.success('Added to cart!');
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-black bg-surface transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
      <button
        onClick={handleWishlist}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-white/95 shadow-sm transition-colors hover:bg-surface-muted"
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={16}
          fill={isWishlisted ? 'currentColor' : 'none'}
          color={isWishlisted ? '#991b1b' : 'var(--ink-subtle)'}
          className={isWishlisted ? 'text-status-danger' : ''}
        />
      </button>

      <Link href={`/product/${productId}`} className="relative block h-full w-full">
        <img
          src={imageUrl}
          alt={product.name || 'Product'}
          loading="lazy"
          decoding="async"
          width="500"
          height="500"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] sm:p-6"
        />
      </Link>
      {badges.length > 0 && (
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {badges.map((badge) => (
            <span key={badge.label} className={`rounded-md px-2 py-1 text-[10px] font-semibold ${badge.tone === 'sale' ? 'bg-ink text-white' : 'bg-white/95 text-ink'}`}>
              {badge.label}
            </span>
          ))}
        </div>
      )}
      </div>

      <div className="flex flex-grow flex-col p-3 sm:p-3.5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">{product.brand}</p>
        <Link href={`/product/${productId}`} className="block">
          <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-5 text-ink">{product.name}</h3>
        </Link>
        {product.condition && (
          <p className="mb-2 text-xs text-ink-muted">
            {product.condition}
            {hasVariants && <span> · {isOutOfStock ? 'Out of stock' : 'In stock'}</span>}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-2">
          <div className="min-h-[2.5rem]">
            {hasDiscount && <p className="mb-0.5 text-[11px] text-ink-subtle line-through">{formatPrice(comparePrice)}</p>}
            <p className="text-lg font-bold text-ink sm:text-xl">{formatPrice(price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-primary flex h-10 items-center justify-center gap-2 rounded-xl text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart size={15} /> {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}