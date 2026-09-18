import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ChevronLeft,
  Share,
} from 'lucide-react';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { useStore } from '../../store';
import { productsAPI } from '../../lib/api';
import { useSettings } from '../../hooks/useSettings';
import { formatPrice } from '../../lib/utils';
import siteConfig from '../../config';

const renderStars = (rating) => {
  const stars = [];
  const filled = Math.round(rating);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < filled
            ? 'fill-amber-400 text-amber-400'
            : 'fill-slate-200 text-slate-200'
        }`}
      />
    );
  }
  return stars;
};

function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, buyNow, user } = useStore();
  const { settings } = useSettings();

  const [selectedImage, setSelectedImage] = useState(null);
  const touchStartX = useRef(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.get(id);
        setProduct(res.product || res);
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setSelectedImage(
        product.images?.[0]?.url || '/Apple-iPhone-18-Pro.png'
      );
      if (product.variants?.length > 0) {
        setSelectedVariant(
          product.variants.reduce(
            (prev, cur) => (cur.price < prev.price ? cur : prev),
            product.variants[0]
          )
        );
      } else {
        setSelectedVariant({
          price: product.basePrice || 0,
        });
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Please select product options.');
      return;
    }
    addToCart(product, quantity, selectedVariant);
    toast.success('Added to cart');
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error('Please select product options.');
      return;
    }
    buyNow(product, quantity, selectedVariant);
    toast.success('Checkout ready');
    router.push('/checkout');
    setQuantity(1);
  };

  const handleGalleryTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (event) => {
    if (touchStartX.current === null || !images || images.length < 2) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;

    const currentIndex = images.findIndex((image) => {
      const url = typeof image === 'string' ? image : image.url;
      return url === selectedImage;
    });
    const nextIndex = distance < 0
      ? (currentIndex + 1) % images.length
      : (currentIndex - 1 + images.length) % images.length;
    const nextImage = images[nextIndex];
    setSelectedImage(typeof nextImage === 'string' ? nextImage : nextImage.url);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at ${formatPrice(currentPrice)}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      // User cancelled
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <SkeletonLoader height="560px" className="rounded-3xl mb-4" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} width="80px" height="80px" className="rounded-2xl" />
              ))}
            </div>
          </div>
          <div>
            <SkeletonLoader width="70%" height="32px" className="mb-3" />
            <SkeletonLoader width="40%" height="20px" className="mb-6" />
            <SkeletonLoader width="100%" height="80px" className="mb-8" />
            <SkeletonLoader width="100%" height="52px" className="mb-3 rounded-full" />
            <SkeletonLoader width="100%" height="52px" className="rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink">Product not found</h1>
        <p className="mt-2 text-sm text-ink-muted">We couldn't find that product.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 inline-flex h-11 px-6 items-center rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
    );
  }

  const {
    name,
    description,
    images,
    variants,
    reviews,
    specifications,
    isHotDeal,
    isFeatured,
    flashSale,
    comparePrice,
    brand,
    condition,
  } = product;

  const currentPrice = selectedVariant?.price || product.basePrice || 0;
  const uniqueColors = Array.from(
    new Map(
      (variants || []).filter((v) => v.color).map((v) => [v.color, v])
    ).values()
  );
  const uniqueStorages = Array.from(
    new Set((variants || []).map((v) => v.storage).filter(Boolean))
  ).sort();

  const waMessage = `Hi, I'm interested in ${name}${
    selectedVariant?.storage ? ` (${selectedVariant.storage})` : ''
  }${selectedVariant?.color ? ` ${typeof selectedVariant.color === 'object' ? selectedVariant.color.name : selectedVariant.color}` : ''} at ${formatPrice(currentPrice)}. Link: ${
    typeof window !== 'undefined' ? window.location.href : ''
  }`;
  const waNumber = (settings?.contact?.whatsapp?.[0] || siteConfig?.contact?.whatsappNumber || '').replace(/[^0-9]/g, '');
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}` : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <Head>
        <title>{name} — AlphaiStore</title>
        <meta name="description" content={description || `Buy ${name} on AlphaiStore`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <div>
            <div
              className="relative aspect-square rounded-3xl overflow-hidden bg-white border-2 border-black touch-pan-y"
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <img
                src={selectedImage || '/Apple-iPhone-18-Pro.png'}
                alt={name}
                className="w-full h-full object-contain p-8"
              />
              {flashSale?.endDate && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  <Zap className="h-3.5 w-3.5" />
                  Flash sale
                </span>
              )}
            </div>

            {images?.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => {
                  const url = typeof img === 'string' ? img : img.url;
                  const active = selectedImage === url;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(url)}
                      className={`relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border-2 bg-white transition-all ${
                        active
                          ? 'border-black ring-2 ring-ink/20'
                          : 'border-black hover:border-ink-subtle'
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={url} alt={`${name} view ${i + 1}`} className="w-full h-full object-contain p-2" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-3xl border-2 border-black bg-surface-muted p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-ink/10 text-ink text-xs font-bold tracking-wider uppercase">
                  Featured
                </span>
              )}
              {isHotDeal && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wider uppercase">
                  Hot deal
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">{name}</h1>
            {brand && (
              <p className="mt-2 text-sm text-ink-muted">
                {brand}{condition ? ` · ${condition}` : ''}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center">{renderStars(product.rating || 0)}</div>
              <span className="text-xs text-ink-subtle">({reviews?.length || 0} reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-ink">{formatPrice(currentPrice)}</span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-base text-ink-subtle line-through">{formatPrice(comparePrice)}</span>
              )}
            </div>

            {description && (
              <p className="mt-5 text-sm text-ink-muted leading-relaxed">{description}</p>
            )}

            {/* Color */}
            {uniqueColors.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold text-ink mb-3">
                  Color: <span className="text-ink-muted font-normal">{typeof selectedVariant?.color === 'object' ? selectedVariant?.color?.name : selectedVariant?.color || ''}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((v) => {
                    const active = (typeof selectedVariant?.color === 'object' ? selectedVariant?.color?.name : selectedVariant?.color) === (typeof v.color === 'object' ? v.color?.name : v.color);
                    return (
                      <button
                        key={`${typeof v.color === 'object' ? v.color?.name : v.color}-${v.storage || ''}`}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        aria-label={typeof v.color === 'object' ? v.color?.name : v.color}
                        aria-pressed={active}
                        title={typeof v.color === 'object' ? v.color?.name : v.color}
                        style={{
                          width: '48px', height: '48px',
                          borderRadius: '50%',
                          background: v.colorHex || (typeof v.color === 'object' ? v.color?.hex : v.color) || '#ccc',
                          border: active ? '3px solid #000000' : '3px solid #e2e8f0',
                          boxShadow: active ? '0 0 0 3px rgba(0,0,0,0.25)' : 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {active && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage */}
            {uniqueStorages.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-ink mb-3">Storage</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueStorages.map((storage) => {
                    const matchingVariant = variants.find((v) => v.storage === storage);
                    const active = selectedVariant?.storage === storage;
                    return (
                      <button
                        key={storage}
                        type="button"
                        onClick={() => setSelectedVariant(matchingVariant)}
                        aria-pressed={active}
                        className={`h-10 px-5 rounded-full border text-sm font-semibold transition-all ${
                          active
                            ? 'border-ink bg-ink text-white'
                            : 'border-surface-border bg-white text-ink hover:border-ink hover:text-ink'
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-ink mb-3">Quantity</p>
              <div className="inline-flex items-center rounded-full border border-surface-border bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease"
                  className="h-11 w-11 inline-flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase"
                  className="h-11 w-11 inline-flex items-center justify-center text-ink-muted hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink text-white text-base font-bold hover:bg-ink/80 shadow-smooth transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ink bg-white text-ink text-base font-bold hover:bg-surface-muted transition-all"
              >
                <Zap className="h-5 w-5" />
                Buy now
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 inline-flex h-14 items-center justify-center gap-2 rounded-full border border-surface-border bg-white text-ink text-base font-bold hover:bg-surface-muted transition-all"
              >
                <Share className="h-5 w-5" />
                Share
              </button>
            </div>

            {/* Specifications */}
            {specifications && Object.keys(specifications).length > 0 && (
              <div className="mt-10 rounded-2xl bg-white border border-surface-border p-6">
                <h2 className="text-base font-bold text-ink mb-4">Specifications</h2>
                <dl className="divide-y divide-surface-border">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-3 text-sm">
                      <dt className="text-ink-muted">{key}</dt>
                      <dd className="text-ink font-semibold text-right">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-ink mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <article
                  key={review._id || i}
                  className="rounded-3xl bg-white border border-surface-border p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">{renderStars(review.rating || 0)}</div>
                    <span className="text-sm font-semibold text-ink">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">"{review.comment}"</p>
                  <p className="mt-3 text-xs text-ink-subtle">— {review.user?.firstName || 'Anonymous'}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default ProductDetailPage;