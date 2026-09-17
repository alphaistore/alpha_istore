import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ordersAPI, settingsAPI } from '../lib/api';
import { useSettings } from '../hooks/useSettings';
import { formatPrice } from '../lib/utils';

const valueOrDash = (value) => value || '—';

export default function OrderReceipt() {
  const router = useRouter();
  const orderQuery = router.query.order;
  const orderNumber = Array.isArray(orderQuery) ? orderQuery[0] : orderQuery;
  const [order, setOrder] = useState(null);
  const { settings } = useSettings();
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    ordersAPI.track(orderNumber)
      .then((response) => setOrder(response.order || response.data?.order || response))
      .catch((error) => console.error('Invoice loading failed:', error))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  useEffect(() => {
    settingsAPI.get()
      .then((response) => setInvoiceSettings(response.settings || response))
      .catch((error) => console.error('Invoice settings loading failed:', error));
  }, []);

  if (loading) return <div className="invoice-loading">Loading invoice…</div>;
  if (!order) return <div className="invoice-loading">Invoice not found.</div>;

  const currentSettings = invoiceSettings || settings || {};
  const contact = currentSettings.contact || {};
  const paymentInfo = currentSettings.payment || {};
  const storeName = currentSettings.storeName || 'Alpha iStore';
  const phone = contact.phones?.[0] || contact.phone;
  const logo = currentSettings.favicon?.url || currentSettings.logo?.url || '/favicon.png';
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const customer = order.customer || {};
  const guest = order.guestInfo || {};
  const user = order.user || {};
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
    || [user.firstName, user.lastName].filter(Boolean).join(' ')
    || guest.name;
  const customerEmail = customer.email || user.email || guest.email;
  const customerPhone = customer.phone || user.phone || guest.phone;
  const deliveryFee = Number(order.delivery?.fee || 0);
  const tax = Number(order.tax || 0);
  const subtotal = Number(order.subtotal || 0);
  const discount = Number(order.discount || 0);
  const calculatedTotal = subtotal + deliveryFee + tax - discount;
  const total = Number.isFinite(Number(order.total)) ? Number(order.total) : calculatedTotal;
  const paymentMethod = order.payment?.method?.replace(/_/g, ' ') || 'Not specified';

  return (
    <>
      <Head>
        <title>Invoice {order.invoiceNumber || order.orderNumber} — {storeName}</title>
        <style>{`
          @page { size: A4; margin: 14mm; }
          @media print {
            html, body { background: #fff !important; }
            .invoice-actions { display: none !important; }
            .invoice-page { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
          }
        `}</style>
      </Head>
      <main className="invoice-shell">
        <article className="invoice-page">
          <header className="invoice-header">
            <div className="invoice-brand">
              <img src={logo} alt={`${storeName} logo`} className="invoice-logo" />
              <div className="invoice-business">
                <h1>{storeName}</h1>
                {contact.address && <p>{contact.address}</p>}
                {phone && <p>{phone}</p>}
                {contact.email && <p>{contact.email}</p>}
                {contact.website && <p>{contact.website}</p>}
              </div>
            </div>
            <div className="invoice-heading">
              <div className="invoice-title">INVOICE</div>
              <p><strong>Invoice No:</strong> {order.invoiceNumber || order.orderNumber}</p>
              <p><strong>Date:</strong> {invoiceDate}</p>
            </div>
          </header>

          <section className="invoice-meta">
            <div>
              <h2>Billed To</h2>
              <p className="invoice-strong">{valueOrDash(customerName)}</p>
              {customerPhone && <p>{customerPhone}</p>}
              {customerEmail && <p>{customerEmail}</p>}
              {order.delivery?.address && <p>{order.delivery.address}</p>}
              {order.delivery?.region && <p>{order.delivery.region}</p>}
            </div>
            <div className="invoice-delivery">
              <h2>Payment & Delivery</h2>
              <p>{paymentMethod}</p>
              <p>{order.delivery?.method === 'pickup' ? 'Pickup' : 'Delivery'}</p>
              {order.payment?.status && <p className="invoice-muted">Status: {order.payment.status}</p>}
            </div>
          </section>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, index) => (
                  <tr key={`${item.product || item.name}-${index}`}>
                    <td>
                      <span className="invoice-strong">{item.name}</span>
                      {(item.variant?.storage || item.variant?.color) && (
                        <span className="invoice-variant">
                          {[item.variant.storage, typeof item.variant.color === 'object' ? item.variant.color?.name : item.variant.color].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.price)}</td>
                    <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="invoice-totals">
            <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            {discount > 0 && <div><span>Discount</span><strong>− {formatPrice(discount)}</strong></div>}
            {deliveryFee > 0 && <div><span>Shipping / Delivery</span><strong>{formatPrice(deliveryFee)}</strong></div>}
            {tax > 0 && <div><span>Tax</span><strong>{formatPrice(tax)}</strong></div>}
            <div className="invoice-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
          </section>

          {(paymentInfo.accountName || paymentInfo.accountNumber || paymentInfo.instructions) && (
            <section className="invoice-payment">
              <h2>Payment Information</h2>
              {paymentInfo.accountName && <p>{paymentInfo.accountName}</p>}
              {paymentInfo.accountNumber && <p>{paymentInfo.accountNumber}</p>}
              {paymentInfo.instructions && <p className="invoice-payment-instructions">{paymentInfo.instructions}</p>}
            </section>
          )}

          <footer className="invoice-footer">
            <p className="invoice-thanks">Thank you for shopping with {storeName}.</p>
            {(phone || contact.email || contact.address) && (
              <p>{[phone, contact.email, contact.address].filter(Boolean).join(' · ')}</p>
            )}
          </footer>
        </article>
        <div className="invoice-actions">
          <button type="button" onClick={() => window.print()}>Print / Save as PDF</button>
          <button type="button" onClick={() => router.back()} className="invoice-secondary-action">Back</button>
        </div>
      </main>
      <style jsx>{`
        .invoice-shell { background: #f5f5f5; min-height: 100vh; padding: 32px 16px; color: #171717; }
        .invoice-page { background: #fff; max-width: 820px; margin: 0 auto; padding: 64px 72px; box-shadow: 0 10px 30px rgba(0,0,0,.06); font-family: Inter, Arial, sans-serif; font-size: 13px; line-height: 1.5; }
        .invoice-header { display: flex; justify-content: space-between; gap: 32px; padding-bottom: 52px; }
        .invoice-brand { display: flex; align-items: flex-start; gap: 16px; min-width: 0; }
        .invoice-logo, .invoice-logo-placeholder { width: 64px; height: 64px; flex: 0 0 64px; object-fit: contain; }
        .invoice-logo-placeholder { display: flex; align-items: center; justify-content: center; background: #171717; color: #fff; font-size: 28px; font-weight: 700; }
        .invoice-business h1 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
        .invoice-business p, .invoice-heading p, .invoice-meta p, .invoice-payment p, .invoice-footer p { margin: 2px 0; color: #525252; overflow-wrap: anywhere; }
        .invoice-heading { text-align: right; min-width: 190px; }
        .invoice-title { margin-bottom: 12px; font-size: 36px; line-height: 1; letter-spacing: .04em; font-weight: 700; }
        .invoice-heading strong { color: #171717; font-weight: 600; }
        .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 22px 0 42px; }
        .invoice-meta h2, .invoice-payment h2 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; font-weight: 700; }
        .invoice-strong { color: #171717 !important; font-weight: 700; }
        .invoice-muted, .invoice-variant { color: #737373 !important; font-size: 12px; }
        .invoice-variant { display: block; margin-top: 3px; }
        .invoice-table-wrap { overflow-x: auto; }
        .invoice-table { width: 100%; min-width: 560px; border-collapse: collapse; }
        .invoice-table th { padding: 12px 0; border-top: 1px solid #171717; border-bottom: 1px solid #171717; text-align: left; font-size: 12px; font-weight: 700; }
        .invoice-table th:not(:first-child), .invoice-table td:not(:first-child) { text-align: right; }
        .invoice-table th:nth-child(2), .invoice-table td:nth-child(2) { width: 70px; }
        .invoice-table th:nth-child(3), .invoice-table td:nth-child(3), .invoice-table th:nth-child(4), .invoice-table td:nth-child(4) { width: 125px; }
        .invoice-table td { padding: 16px 0; border-bottom: 1px solid #d4d4d4; vertical-align: top; }
        .invoice-totals { width: 320px; max-width: 100%; margin: 28px 0 48px auto; }
        .invoice-totals > div { display: flex; justify-content: space-between; gap: 20px; padding: 6px 0; }
        .invoice-total { margin-top: 8px; padding: 14px 16px !important; background: #171717; color: #fff; font-size: 17px; }
        .invoice-payment { border-top: 1px solid #d4d4d4; padding-top: 24px; max-width: 380px; }
        .invoice-payment-instructions { white-space: pre-line; }
        .invoice-footer { margin-top: 72px; padding-top: 20px; border-top: 1px solid #d4d4d4; text-align: center; }
        .invoice-thanks { color: #171717 !important; font-size: 15px; font-weight: 700; }
        .invoice-actions { display: flex; justify-content: center; gap: 10px; margin: 20px auto 0; }
        .invoice-actions button { border: 0; background: #171717; color: #fff; padding: 12px 20px; cursor: pointer; font-weight: 600; }
        .invoice-actions .invoice-secondary-action { background: #fff; color: #171717; border: 1px solid #d4d4d4; }
        .invoice-loading { min-height: 60vh; display: grid; place-items: center; color: #525252; }
        @media (max-width: 640px) {
          .invoice-shell { padding: 0; }
          .invoice-page { padding: 32px 20px; box-shadow: none; }
          .invoice-header { flex-direction: column; padding-bottom: 32px; }
          .invoice-heading { text-align: left; }
          .invoice-title { font-size: 30px; }
          .invoice-meta { grid-template-columns: 1fr; gap: 24px; padding-bottom: 30px; }
          .invoice-totals { margin-bottom: 36px; }
        }
      `}</style>
    </>
  );
}
