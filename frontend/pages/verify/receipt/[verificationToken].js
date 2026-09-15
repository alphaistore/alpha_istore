import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { ordersAPI } from '../../../lib/api';
import siteConfig from '../../../config';
import { formatPrice } from '../../../lib/utils';

export default function VerifyReceiptPage() {
  const router = useRouter();
  const { verificationToken } = router.query;
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying receipt authenticity...');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!verificationToken) return;

    const verify = async () => {
      setStatus('loading');
      setMessage('Verifying receipt authenticity...');
      try {
        const res = await ordersAPI.verifyReceipt(verificationToken);
        setOrder(res.order || res.data?.order || res);
        setStatus('success');
        setMessage('Receipt authenticity verified successfully.');
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || 'Unable to verify receipt authenticity.';
        setStatus('error');
        setMessage(errMsg);
      }
    };

    verify();
  }, [verificationToken]);

  const title =
    status === 'success'
      ? 'Receipt Verified'
      : status === 'error'
      ? 'Verification Failed'
      : 'Verifying Receipt';
  const iconClass =
    status === 'success'
      ? 'text-green-600'
      : status === 'error'
      ? 'text-red-600'
      : 'text-slate-600';

  return (
    <>
      <Head>
        <title>{title} — AlphaiStore</title>
      </Head>

      <main className="min-h-screen bg-surface-muted px-4 py-10 text-ink">
        <div className="mx-auto max-w-4xl rounded-3xl border border-surface-border bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted ${iconClass}`}>
              {status === 'success' ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : status === 'error' ? (
                <XCircle className="h-10 w-10" />
              ) : (
                <ShieldCheck className="h-10 w-10 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ink-subtle">
                Receipt verification
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">{title}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted">{message}</p>
            </div>
          </div>

          {status === 'success' && order && (
            <div className="mt-10 rounded-3xl bg-surface-muted p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Invoice Number</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{order.invoiceNumber || order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Order Number</p>
                  <p className="mt-2 text-lg font-semibold text-ink">#{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Purchase Date</p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Grand Total</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-white p-5 border border-surface-border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Payment Status</p>
                    <p className="mt-2 text-lg font-semibold text-ink capitalize">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Delivery Status</p>
                    <p className="mt-2 text-lg font-semibold text-ink capitalize">{order.deliveryStatus}</p>
                  </div>
                </div>

                {order.items?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-subtle">Purchased items</p>
                    <div className="mt-3 space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-2xl bg-surface-muted p-3">
                          <div>
                            <p className="font-semibold text-ink">{item.name}</p>
                            <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-ink">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-surface-border pt-6 text-sm text-ink-muted">
                <p>{siteConfig.name} verifies this invoice using a secure one-time token embedded in the QR code.</p>
                <p className="mt-3">If you have any questions, please contact <a className="text-ink hover:underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-10 rounded-3xl bg-red-50 p-6 text-sm text-red-700">
              <p>The receipt could not be verified. This may be due to an invalid or expired token.</p>
              <p className="mt-3">Make sure you scanned the correct QR code and try again.</p>
              <p className="mt-3">For support, contact <a className="font-semibold text-red-900" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
