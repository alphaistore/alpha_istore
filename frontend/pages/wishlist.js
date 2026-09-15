import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import useStore from '../store';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const getItemImage = (item) => {
    if (typeof item === 'object') {
      return item.images?.[0]?.url || item.imageUrl || '/Apple-iPhone-18-Pro.png';
    }
    return '/Apple-iPhone-18-Pro.png';
  };

  const getItemName = (item) => {
    if (typeof item === 'object') return item.name;
    return 'Product';
  };

  const getItemPrice = (item) => {
    if (typeof item === 'object') return item.price || item.basePrice || 0;
    return 0;
  };

  const getItemId = (item) => {
    if (typeof item === 'object') return item._id || item.id;
    return item;
  };

  const handleRemove = (item) => {
    toggleWishlist(item);
  };

  const handleAddToCart = (item) => {
    const product = {
      id: getItemId(item),
      name: getItemName(item),
      basePrice: getItemPrice(item),
      images: [{ url: getItemImage(item) }],
    };
    addToCart(product, 1, null);
  };

  return (
    <>
      <Head>
        <title>Wishlist — AlphaiStore</title>
        <meta name="description" content="Your saved items on AlphaiStore." />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Heart className="h-7 w-7 text-ink" />
          <h1 className="text-3xl font-bold tracking-tight text-ink">Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-3xl border border-surface-border bg-white p-16 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink/10 text-ink mx-auto">
              <Heart className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Save items you love by tapping the heart icon on any product.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 items-center gap-2 px-8 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80 shadow-smooth"
            >
              Explore products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item, idx) => {
              const id = getItemId(item);
              const name = getItemName(item);
              const price = getItemPrice(item);
              const image = getItemImage(item);

              return (
                <article
                  key={id || idx}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-smooth-lg transition-all duration-300"
                >
                  <Link
                    href={`/product/${id}`}
                    className="relative aspect-square bg-white overflow-hidden p-6"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex flex-col flex-1 p-6">
                    <Link
                      href={`/product/${id}`}
                      className="text-base font-bold text-ink hover:text-ink/70 line-clamp-1"
                    >
                      {name}
                    </Link>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-xl font-bold text-ink">{formatPrice(price)}</span>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-background text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
