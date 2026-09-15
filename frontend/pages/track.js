import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ClipboardList,
  Package,
  Truck,
  Home,
  Check,
  Smartphone,
} from 'lucide-react';
import { ordersAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STEP_LABELS = {
  pending: 'Order placed',
  processing: 'Processing & packing',
  shipped: 'Out for delivery',
  delivered: 'Delivered',
};
const STEP_ICONS = {
  pending: ClipboardList,
  processing: Package,
  shipped: Truck,
  delivered: Home,
};

const STATUS_STYLES = {
  delivered: 'bg-green-50 text-status-success',
  shipped: 'bg-neutral-50 text-ink',
  cancelled: 'bg-red-50 text-status-danger',
  processing: 'bg-amber-50 text-status-warning',
  pending: 'bg-amber-50 text-status-warning',
};

const inputClass =
  'flex-1 h-11 px-3.5 text-sm bg-white border border-surface-border rounded-xl text-ink placeholder:text-ink-subtle focus:border-ink focus:ring-4 focus:ring-ink/10 focus:outline-none transition-shadow';

export default function Track() {
  const router = useRouter();
  const [orderNum, setOrderNum] = useState(router.query.order || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await ordersAPI.track(orderNum.trim().replace('#', ''));
      setOrder(res.order);
    } catch {
      setError('Order not found. Please check the order number and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.order) setOrderNum(router.query.order);
  }, [router.query.order]);

  const curStep = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const statusClass =
    STATUS_STYLES[order?.status] || STATUS_STYLES.pending;

  return (
    <>
      <Head>
        <title>Track order — AlphaiStore</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <section className="rounded-2xl border border-surface-border bg-white p-6">
          <h1 className="text-xl font-semibold tracking-tightish text-ink">
            Track your order
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter your order number to see real-time updates.
          </p>

          <div className="mt-5 flex gap-2">
            <input
              type="text"
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
               placeholder="e.g. AIS-XXXXX-123ABC"
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleTrack}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink/80 disabled:opacity-60 shadow-smooth"
            >
              {loading ? 'Searching…' : 'Track'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-status-danger">{error}</p>
          )}
        </section>

        {order && (
          <section className="rounded-2xl border border-surface-border bg-white p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-subtle font-medium">
                  Order
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tightish text-ink">
                  #{order.orderNumber}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.open(`/order-receipt?order=${order.orderNumber}`, '_blank')}
                  className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg border border-surface-border text-xs font-medium text-ink hover:bg-surface-muted"
                >
                  Download receipt
                </button>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusClass}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <ol className="space-y-6">
              {STATUS_STEPS.map((step, i) => {
                const done = i < curStep || order.status === 'delivered';
                const current =
                  i === curStep && order.status !== 'cancelled';
                const Icon = STEP_ICONS[step];
                const history = order.statusHistory?.find(
                  (h) => h.status === step
                );
                return (
                  <li key={step} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <span
                        className={`h-9 w-9 inline-flex items-center justify-center rounded-full text-sm ${
                          done
                            ? 'bg-ink text-white'
                            : current
                            ? 'bg-neutral-50 text-ink border-2 border-ink'
                            : 'bg-surface-muted text-ink-subtle'
                        }`}
                      >
                        {done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </span>
                      {i < STATUS_STEPS.length - 1 && (
                        <span
                          className={`w-0.5 flex-1 mt-1 ${
                            done ? 'bg-ink' : 'bg-surface-border'
                          }`}
                          style={{ minHeight: 24 }}
                        />
                      )}
                    </div>
                    <div className="pt-1.5 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          done || current ? 'text-ink' : 'text-ink-subtle'
                        }`}
                      >
                        {STEP_LABELS[step]}
                      </p>
                      {history && (
                        <p className="text-xs text-ink-subtle mt-0.5">
                          {new Date(history.updatedAt).toLocaleString()}
                        </p>
                      )}
                      {!history && current && (
                        <p className="text-xs text-ink mt-0.5">
                          In progress…
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {order.items?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-surface-border">
                <h3 className="text-sm font-semibold tracking-tightish text-ink mb-4">
                  Items ordered
                </h3>
                <ul className="space-y-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-surface-muted text-ink-subtle shrink-0">
                        <Smartphone className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink-subtle">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-surface-border flex justify-between">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="text-base font-semibold text-ink">
                {formatPrice(order.total)}
              </span>
            </div>
          </section>
        )}
      </div>
    </>
  );
}