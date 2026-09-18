import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
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

const cloudinaryImage = (url, width) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
};

export default function ProductCard({ product, priority = false }) {
  const router = useRouter();
  const { addToCart, buyNow, wishlist, toggleWishlist } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);
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
  const originalImageUrl = getImageUrl(product.images?.[0]) || FALLBACK_IMAGE;
  const imageUrl = cloudinaryImage(originalImageUrl, 600);
  const imageSrcSet = [400, 600, 800]
    .map((width) => `${cloudinaryImage(originalImageUrl, width)} ${width}w`)
    .join(', ');
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

  const handleBuyNow = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;
    buyNow(product, 1, product.variants?.[0] || null);
    router.push('/checkout');
    toast.success('Checkout ready!');
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-muted transition-shadow hover:shadow-md" style={{ border: '2px solid #000' }}>
      <div className="relative overflow-hidden bg-surface-muted" style={{ aspectRatio: '4 / 5', borderBottom: '3px solid #000' }}>
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
        {!imageLoaded && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-slate-100" />}
        <img
          src={imageUrl}
          srcSet={imageSrcSet}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={product.name || 'Product'}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          width="500"
          height="500"
          onError={(event) => {
            setImageLoaded(true);
            if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="absolute inset-0 h-full w-full bg-white object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] sm:p-6"
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

      <div className="flex flex-grow flex-col p-1 sm:p-2">
        <div className="mb-0 flex min-w-0 items-center gap-1">
          <p className="max-w-[34%] shrink-0 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">{product.brand}</p>
          <Link href={`/product/${productId}`} className="min-w-0 flex-1">
            <h3 className="truncate text-[14px] font-semibold leading-[1.125rem] text-ink">{product.name}</h3>
          </Link>
        </div>
        {product.condition && (
          <p className="mb-0 max-w-[96%] truncate text-[10px] leading-3.5 text-ink-muted sm:text-[11px] sm:leading-4">
            {product.condition}
            {hasVariants && <span> · {isOutOfStock ? 'Out of stock' : 'In stock'}</span>}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex min-h-[1.5rem] items-center gap-1 sm:min-h-[1.75rem]">
            <p className="text-sm font-bold text-ink sm:text-lg">{formatPrice(price)}</p>
            {hasDiscount && <p className="truncate text-[11px] text-ink-subtle line-through">{formatPrice(comparePrice)}</p>}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Out of stock' : 'Add to cart'}
              title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
              className="btn-primary flex h-8 w-9 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-10 sm:rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={15} />
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex h-9 flex-[1.25] items-center justify-center gap-1 rounded-lg border-2 border-ink bg-white px-2 text-[11px] font-bold text-ink transition-colors hover:bg-surface-muted sm:h-11 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap size={15} /> Buy now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}