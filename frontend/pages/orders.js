import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Package, ShoppingBag, Repeat, MapPin, Smartphone } from 'lucide-react';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { ordersAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { useStore } from '../store';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-status-warning',
  processing: 'bg-amber-50 text-status-warning',
  shipped: 'bg-neutral-50 text-ink',
  delivered: 'bg-green-50 text-status-success',
  cancelled: 'bg-red-50 text-status-danger',
};

export default function Orders() {
  const router = useRouter();
  const { user, token } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      router.replace('/auth/login?redirect=/orders');
      return;
    }
    setAuthChecked(true);

    (async () => {
      try {
        const res = await ordersAPI.myOrders();
        setOrders(res.orders || []);
      } catch (e) {
        console.error(e);
        if (e.response?.status === 401) {
          setAuthChecked(false);
          router.replace('/auth/login?redirect=/orders');
          return;
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router, token]);

  return (
    <>
      <Head>
        <title>My orders — AlphaiStore</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tightish text-ink mb-8">
          My orders
        </h1>

        {!authChecked || loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-surface-border bg-white p-6"
              >
                <SkeletonLoader width="40%" height="16px" className="mb-3" />
                <SkeletonLoader width="60%" height="48px" className="mb-3" />
                <SkeletonLoader width="30%" height="14px" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-white p-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-ink">
              <Package className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tightish text-ink">
              No orders yet
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Your orders will appear here once you make a purchase.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center gap-2 px-5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink/80 shadow-smooth"
            >
              <ShoppingBag className="h-4 w-4" />
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const statusClass =
                STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              const itemCount = order.items?.length || 0;
              return (
                <li
                  key={order._id}
                  className="rounded-2xl border border-surface-border bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-surface-border">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-ink-subtle mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(
                          'en-GB',
                          { day: 'numeric', month: 'long', year: 'numeric' }
                        )}
                        {' · '}
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <p className="text-sm text-ink-muted mt-2 line-clamp-2">
                          {(order.items || []).slice(0, 3).map(i => i.name).filter(Boolean).join(', ')}{order.items.length > 3 ? `, +${order.items.length - 3} more` : ''}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClass}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {(order.items || []).slice(0, 4).map((item, i) => (
                      <span key={i} className="h-12 w-12 inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-white">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Smartphone className="h-5 w-5 text-ink-subtle" />
                        )}
                      </span>
                    ))}
                    {itemCount > 4 && (
                      <span className="h-12 w-12 inline-flex items-center justify-center rounded-xl bg-neutral-50 text-ink text-xs font-semibold">
                        +{itemCount - 4}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-base font-semibold text-ink">
                      {formatPrice(order.total)}
                    </span>
                    <div className="flex items-center gap-2">
                      {order.status !== 'delivered' &&
                        order.status !== 'cancelled' && (
                          <Link
                            href={`/track?order=${order.orderNumber}`}
                            className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl border border-ink bg-white text-ink text-xs font-medium hover:bg-neutral-50"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Track
                          </Link>
                        )}
                      {order.status === 'delivered' && (
                        <Link
                          href="/shop"
                          className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl border border-surface-border bg-white text-ink-muted text-xs font-medium hover:bg-surface-muted"
                        >
                          <Repeat className="h-3.5 w-3.5" />
                          Buy again
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}