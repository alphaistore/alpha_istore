import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useStore from '../store';
import { formatPrice } from '../lib/utils';

function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    user,
  } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleRemove = (id, variant) => {
    removeFromCart(id, variant);
    toast.success('Item removed');
  };

  return (
    <>
      <Head>
        <title>Cart — AlphaiStore</title>
        <meta
          name="description"
          content="Review your selected items before checkout."
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-8">Your cart</h1>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-surface-border bg-white p-16 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink/10 text-ink">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-ink">Your cart is empty</h2>
            <p className="mt-2 text-sm text-ink-muted">Browse our phones and add a few.</p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 items-center gap-2 px-8 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80 shadow-smooth"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-surface-border bg-white overflow-hidden">
                <ul className="divide-y divide-surface-border">
                  {cart.map((item) => (
                    <li key={item.id + JSON.stringify(item.variant || {})} className="p-6 flex gap-5">
                      <div className="h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-surface-muted border border-surface-border flex items-center justify-center">
                        <img
                          src={item.imageUrl || '/Apple-iPhone-18-Pro.png'}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.id}`}
                              className="text-sm font-semibold text-ink hover:text-ink/70 line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="mt-1 text-xs text-ink-subtle">
                                {Object.entries(item.variant)
                                  .map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? (v?.name || '') : v}`)
                                  .join(' · ')}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-bold text-ink whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-surface-border overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease"
                              className="h-9 w-9 inline-flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                              aria-label="Increase"
                              className="h-9 w-9 inline-flex items-center justify-center text-ink-muted hover:text-ink"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id, item.variant)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-3xl border border-surface-border bg-white p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-ink mb-6">Order summary</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Subtotal</dt>
                    <dd className="text-ink font-semibold">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Shipping</dt>
                    <dd className="text-ink font-semibold">{formatPrice(shipping)}</dd>
                  </div>
                  <div className="pt-4 border-t border-surface-border flex justify-between">
                    <dt className="text-ink font-bold text-base">Total</dt>
                    <dd className="text-ink font-bold text-base">{formatPrice(total)}</dd>
                  </div>
                </dl>

                <Link
                  href="/checkout"
                  className="mt-6 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80 shadow-smooth"
                >
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => { clearCart(); toast.success('Cart cleared'); }}
                  className="mt-4 w-full text-center text-xs font-semibold text-ink-muted hover:text-red-500 transition-colors"
                >
                  Empty cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

export default CartPage;