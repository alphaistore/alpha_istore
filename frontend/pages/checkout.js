import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Smartphone, CreditCard, Truck, User, Lock, Share } from 'lucide-react';
import { useStore } from '../store';
import { ordersAPI, paymentsAPI, validatePromoCode } from '../lib/api';
import { useSettings } from '../hooks/useSettings';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';
import siteConfig from '../config';

const PAYMENT_METHODS_MAP = {
  mtnMomo: { id: 'mtn_momo', label: 'MTN Mobile Money', color: '#FFC107' },
  telecel: { id: 'telecel', label: 'Telecel Cash', color: '#E53935' },
  airteltigo: { id: 'airteltigo', label: 'AirtelTigo Money', color: '#FF5722' },
  card: { id: 'card', label: 'Card', color: '#607D8B' },
  paystack: { id: 'paystack', label: 'Paystack', color: '#00AEEF' },
  payOnPickup: { id: 'pay_on_pickup', label: 'Pay on Pickup', color: '#388E3C' },
};

const DEFAULT_DELIVERY_REGIONS = [
  { region: 'Pickup — Adum, near Alife Supermarket, opposite Jolly Shop', fee: 0 },
  { region: 'Ahafo — Goaso', fee: 0 },
  { region: 'Ashanti — Kumasi', fee: 0 },
  { region: 'Bono — Sunyani', fee: 0 },
  { region: 'Bono East — Techiman', fee: 0 },
  { region: 'Central — Cape Coast', fee: 0 },
  { region: 'Eastern — Koforidua', fee: 0 },
  { region: 'Greater Accra — Accra', fee: 0 },
  { region: 'North East — Nalerigu', fee: 0 },
  { region: 'Northern — Tamale', fee: 0 },
  { region: 'Oti — Dambai', fee: 0 },
  { region: 'Savannah — Damongo', fee: 0 },
  { region: 'Upper East — Bolgatanga', fee: 0 },
  { region: 'Upper West — Wa', fee: 0 },
  { region: 'Volta — Ho', fee: 0 },
  { region: 'Western — Sekondi-Takoradi', fee: 0 },
  { region: 'Western North — Sefwi Wiawso', fee: 0 },
];

const isKumasiPickup = (region) =>
  region === 'Pickup — Adum, near Alife Supermarket, opposite Jolly Shop'
  || region === 'Pickup — Kumasi (Adum)'
  || region === 'Pickup at Kumasi Adum';

const inputClass =
  'w-full h-11 px-4 text-sm bg-surface-muted border border-transparent rounded-xl text-ink placeholder:text-ink-subtle focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all';

const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-2';

const cardClass =
  'rounded-3xl border border-surface-border bg-white p-7';

const DEFAULT_PAYMENT_METHODS = [PAYMENT_METHODS_MAP.paystack, PAYMENT_METHODS_MAP.payOnPickup];

export default function Checkout() {
  const router = useRouter();
  const cart = useStore((s) => s.cart);
  const user = useStore((s) => s.user);
  const clearCart = useStore((s) => s.clearCart);

  const { settings } = useSettings();
  const [deliveryRegions, setDeliveryRegions] = useState(DEFAULT_DELIVERY_REGIONS);
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_PAYMENT_METHODS);
  
  const [form, setForm] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [region, setRegion] = useState(deliveryRegions[0]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('mtn_momo');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!settings) return;

    const configuredRegions = settings.delivery?.locations?.length > 0
      ? settings.delivery.locations
      : DEFAULT_DELIVERY_REGIONS;
    const regions = configuredRegions.filter(({ region }) =>
      region !== 'Pickup — Accra' && region !== 'Pickup (Accra)'
    );
    setDeliveryRegions(regions);
    setRegion(regions[0]);

    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setPayment(DEFAULT_PAYMENT_METHODS[0].id);
  }, [settings]);

  const subtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cart.length > 0 && !user && router.pathname !== '/auth/login') {
      router.replace(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [cart.length, user, router]);

  const handlePromo = async () => {
    if (!promo.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    try {
      const res = await validatePromoCode(promo);
      const discountAmount = Math.round(subtotal * (res.promo.discount / 100));
      setDiscount(discountAmount);
      toast.success(`Promo code applied: ${res.promo.discount}% off!`);
    } catch {
      toast.error('Invalid promo code');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'AlphaiStore Order',
      text: `My order total: ${formatPrice(total)}`,
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

  const openPaystackCheckout = async (payload) => {
    if (typeof window === 'undefined' || !window.Paystack) {
      toast.error('Paystack is not available right now. Please try again.');
      return;
    }

    const publicKey = siteConfig.paystackPublicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      toast.error('Paystack public key is missing. Please configure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.');
      return;
    }

    const orderPayload = {
      ...payload,
      payment: {
        method: 'paystack',
      },
    };

    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: publicKey,
      email: payload.guestInfo.email,
      amount: Math.round(total * 1.02 * 100),
      currency: 'GHS',
      ref: `AIS-${Date.now()}`,
      metadata: {
        custom_fields: [{ display_name: 'Customer', variable_name: 'customer', value: payload.guestInfo.name }],
      },
      onSuccess: async (response) => {
        try {
          setSubmitting(true);
          const verification = await paymentsAPI.verifyPaystack(response.reference);
          if (!verification?.success || verification?.data?.status !== 'success') {
            throw new Error(verification?.message || 'Payment verification failed.');
          }

          const data = await ordersAPI.create({
            ...orderPayload,
            payment: {
              method: 'paystack',
              status: 'paid',
              reference: response.reference,
            },
          });

          clearCart();
          const orderNumber = data?.order?.orderNumber || data?.data?.order?.orderNumber;
          if (!orderNumber) {
            throw new Error('Order created but order number was missing');
          }

          router.push(`/order-confirm?order=${orderNumber}`);
        } catch (error) {
          console.error('Paystack verification error:', error);
          const msg = error?.response?.data?.message || error?.message || 'Paystack payment failed. Please contact support.';
          toast.error(msg);
        } finally {
          setSubmitting(false);
        }
      },
      onCancel: () => {
        toast.error('Paystack payment was cancelled.');
        setSubmitting(false);
      },
    });
  };

  const handleSubmit = async () => {
    const fullName = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();
    const inputAddress = address.trim();

    if (!fullName || fullName.length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    if (!/^\+?[0-9\s-]{8,15}$/.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!user && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!isKumasiPickup(region?.region) && address.trim().length < 5) {
      toast.error('Please enter your delivery address');
      return;
    }
    if (payment === 'pay_on_pickup' && !isKumasiPickup(region?.region)) {
      toast.error('Pay on Pickup is only available for pickup locations.');
      return;
    }
    const safeCart = Array.isArray(cart) ? cart.filter(Boolean) : [];
    console.log('Cart items:', safeCart.length, safeCart);
    if (!safeCart.length) {
      toast.error('Your cart is empty');
      return;
    }
    const invalidItem = safeCart.find((item) => !(item.id || item._id));
    if (invalidItem) {
      toast.error('Your cart contains an invalid item. Please remove it and try again.');
      return;
    }
    setSubmitting(true);
    try {
      const isPickup = isKumasiPickup(region?.region);
      const deliveryAddressFinal = isPickup ? region.region : inputAddress;
      
      // Split name into parts
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const payload = {
        items: safeCart.map((item) => ({
          product: item.id || item._id,
          quantity: item.quantity,
          variant: item.variant || null,
        })),
        delivery: {
          method: isPickup ? 'pickup' : 'delivery',
          region: region.region,
          address: deliveryAddressFinal,
          fee: 0,
          notes: notes || undefined,
        },
        payment: { method: payment, status: payment === 'pay_on_pickup' ? 'pending' : undefined },
        guestInfo: {
          name: fullName,
          firstName,
          lastName,
          email: user?.email || email,
          phone,
        },
        promoCode: promo || undefined,
        discount: discount || 0,
        authToken: authToken || undefined,
      };
      console.log('Checkout payload:', payload);

      if (payment === 'paystack') {
        await openPaystackCheckout(payload);
        return;
      }

      const data = await ordersAPI.create(payload);
      clearCart();
      const orderNumber = data?.order?.orderNumber || data?.data?.order?.orderNumber;
      if (!orderNumber) {
        throw new Error('Order created but order number was missing');
      }
      router.push(`/order-confirm?order=${orderNumber}`);
    } catch (e) {
      console.error('Checkout error:', e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout — AlphaiStore</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className={cardClass}>
              <div className="flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-ink-subtle" />
                <h2 className="text-base font-semibold tracking-tightish text-ink">
                  Your details
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full name</label>
                  <input
                    className={inputClass}
                    placeholder="Kwame Asante"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-center gap-2 mb-5">
                <Truck className="h-4 w-4 text-ink-subtle" />
                <h2 className="text-base font-semibold tracking-tightish text-ink">
                  Delivery
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Region</label>
                  <select
                    className={inputClass}
                    value={region.region}
                    onChange={(e) =>
                      setRegion(
                        deliveryRegions.find((r) => r.region === e.target.value)
                      )
                    }
                  >
                    {deliveryRegions.map((r) => (
                      <option key={r.region} value={r.region}>
                        {r.region}
                      </option>
                    ))}
                  </select>
                </div>
                {!isKumasiPickup(region.region) && (
                  <>
                    <div>
                      <label className={labelClass}>Address</label>
                      <input
                        className={inputClass}
                        placeholder="House number, street, area…"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Notes <span className="normal-case text-ink-subtle">(optional)</span>
                      </label>
                      <input
                        className={inputClass}
                        placeholder="Landmark, gate colour…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className={cardClass}>
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="h-4 w-4 text-ink-subtle" />
                <h2 className="text-base font-semibold tracking-tightish text-ink">
                  Payment method
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {paymentMethods.map(method => (
                  <label key={method.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px', borderRadius: '12px', cursor: 'pointer',
                    border: payment === method.id ? '2px solid #000000' : '2px solid #e2e8f0',
                    background: payment === method.id ? '#f5f5f5' : '#fff',
                    transition: 'all 0.15s',
                    opacity: method.id === 'pay_on_pickup' && !isKumasiPickup(region?.region) ? 0.55 : 1,
                  }}>
                    <input type="radio" name="payment" value={method.id}
                      checked={payment === method.id}
                      onChange={() => {
                        if (method.id === 'pay_on_pickup' && !isKumasiPickup(region?.region)) {
                          toast.error('Select a pickup location to use Pay on Pickup.');
                          return;
                        }
                        setPayment(method.id);
                      }}
                      style={{ display: 'none' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{method.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-3xl border border-surface-border bg-white p-6 lg:sticky lg:top-24">
              <h2 className="text-base font-semibold tracking-tightish text-ink mb-5">
                Order summary
              </h2>

              <ul className="divide-y divide-surface-border mb-5">
                {cart.map((item) => (
                  <li
                    key={item.id + JSON.stringify(item.variant || {})}
                    className="flex items-start gap-3 py-3"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-md bg-surface-muted border border-surface-border overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Smartphone className="h-5 w-5 text-ink-subtle" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-xs text-ink-subtle">
                        {item.variant?.storage || (typeof item.variant?.color === 'object' ? item.variant?.color?.name : item.variant?.color) || ''} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handlePromo}
                  className="h-11 px-4 rounded-xl border border-surface-border text-sm font-medium text-ink hover:bg-surface-muted"
                >
                  Apply
                </button>
              </div>

              <dl className="space-y-2 text-sm border-t border-surface-border pt-4">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="text-ink font-medium">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Delivery region</dt>
                  <dd className="text-ink font-medium">{region.region}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-status-success">
                    <dt>Promo discount</dt>
                    <dd className="font-medium">
                      − {formatPrice(discount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-surface-border">
                  <dt className="text-ink font-semibold">Total</dt>
                  <dd className="text-ink font-semibold text-base">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 inline-flex w-full h-12 items-center justify-center gap-2 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink/80 disabled:opacity-60 disabled:cursor-not-allowed shadow-smooth transition-all"
              >
                <Lock className="h-4 w-4" />
                {submitting ? 'Placing order…' : `Place order — ${formatPrice(total)}`}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="mt-2 inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg border border-surface-border bg-white text-ink text-sm font-medium hover:bg-surface-muted"
              >
                <Share className="h-4 w-4" />
                Share order
              </button>
              <p className="mt-2 text-center text-xs text-ink-subtle">
                Your details are secure and encrypted.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}