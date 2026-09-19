import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Package, Search, ExternalLink, Trash2, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import AdminLayout from '../../components/portal/AdminLayout';
import withAdminAuth from '../../components/portal/withAdminAuth';
import { ordersAPI } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import Link from 'next/link';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-status-warning',
  processing: 'bg-amber-50 text-status-warning',
  shipped: 'bg-primary-50 text-primary',
  delivered: 'bg-green-50 text-status-success',
  cancelled: 'bg-red-50 text-status-danger',
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUS_STYLES = {
  paid: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
};
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed'];

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' })
  : '—';

const shortReference = (reference) => reference
  ? `${reference.slice(0, 8)}${reference.length > 8 ? '…' : ''}`
  : '—';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll({ limit: 1000 });
      setOrders(data.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!active) return;
      await fetchOrders();
    };
    load();
    return () => { active = false; };
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersAPI.updateStatus(id, status);
      await fetchOrders();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!confirm(`Delete order ${order.orderNumber}? This action cannot be undone.`)) return;
    setDeletingId(order._id);
    try {
      await ordersAPI.delete(order._id);
      setOrders((current) => current.filter((item) => item._id !== order._id));
      if (expandedOrderId === order._id) setExpandedOrderId(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeletingId(null);
    }
  };

  const getCustomerName = (order) => {
    // Try customer field first
    if (order.customer?.firstName && order.customer?.lastName) {
      return `${order.customer.firstName} ${order.customer.lastName}`;
    }
    if (order.customer?.firstName) return order.customer.firstName;
    // Then try user reference
    const user = order.user || {};
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    // Then try guestInfo
    const guest = order.guestInfo || {};
    if (guest.firstName && guest.lastName) return `${guest.firstName} ${guest.lastName}`;
    if (guest.firstName) return guest.firstName;
    if (guest.name) return guest.name;
    return 'Guest';
  };

  const getCustomerEmail = (order) => order.customer?.email || order.user?.email || order.guestInfo?.email || '';
  const getCustomerPhone = (order) => order.customer?.phone || order.user?.phone || order.guestInfo?.phone || '';
  const getDeliverySummary = (order) => [order.delivery?.address || order.deliveryAddress || '', order.delivery?.region || ''].filter(Boolean).join(' • ');
  const visibleOrders = orders.filter((order) => {
    const paymentStatus = order.payment?.status || 'pending';
    const matchesStatus = paymentFilter === 'all' || paymentStatus === paymentFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query
      || order.orderNumber?.toLowerCase().includes(query)
      || getCustomerName(order).toLowerCase().includes(query)
      || order.payment?.reference?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
  const paymentCounts = orders.reduce((counts, order) => {
    const status = order.payment?.status || 'pending';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, { paid: 0, pending: 0, failed: 0 });

  const handlePaymentStatus = async (order, status) => {
    setUpdatingId(order._id);
    try {
      await ordersAPI.updatePaymentStatus(order._id, status, order.payment?.reference);
      await fetchOrders();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Head>
        <title>Orders — Admin</title>
      </Head>
      <AdminLayout title="Orders" subtitle="Manage customer orders and updates">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
            <span>{visibleOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            <span className="text-green-700">Paid: {paymentCounts.paid}</span>
            <span className="text-amber-700">Pending: {paymentCounts.pending}</span>
            <span className="text-red-700">Failed: {paymentCounts.failed}</span>
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, customer, or Paystack reference" className="h-10 w-full rounded-xl border border-surface-border bg-white pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="h-10 rounded-xl border border-surface-border bg-white px-3 text-sm outline-none focus:border-primary" aria-label="Filter by payment status">
            <option value="all">All payments</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
          </select>
        </div>
        <div className="rounded-3xl border border-surface-border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-border text-sm">
              <thead className="bg-surface-muted/50">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-ink-subtle">
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Delivery</th>
                  <th className="px-6 py-4">Total / Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-ink-subtle animate-pulse">Loading orders...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-ink-subtle">No orders found.</td></tr>
                ) : (
                  visibleOrders.map(order => (
                    <React.Fragment key={order._id}>
                    <tr className="hover:bg-surface-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)} className="font-semibold text-primary hover:underline flex items-center gap-1">
                          {order.orderNumber}
                          {expandedOrderId === order._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <Link href={`/track?order=${order.orderNumber}`} className="mt-1 flex items-center gap-1 text-xs text-ink-subtle hover:underline">
                          View tracking <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {getCustomerName(order)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {getCustomerEmail(order)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {getCustomerPhone(order)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-ink-muted">
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {order.delivery?.method || 'delivery'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {getDeliverySummary(order) || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-ink">
                        {formatPrice(order.total)}
                        <div className="mt-2 flex items-center gap-1 text-xs font-normal text-ink-muted" title={order.payment?.reference || ''}>
                          <CreditCard className="h-3 w-3" />
                          {shortReference(order.payment?.reference)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                        <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ${PAYMENT_STATUS_STYLES[order.payment?.status || 'pending']}`}>
                          Payment: {order.payment?.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className="h-9 px-3 text-sm bg-surface-muted border border-surface-border rounded-lg text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order)}
                          disabled={deletingId === order._id}
                          className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-subtle hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          aria-label={`Delete order ${order.orderNumber}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order._id && (
                      <tr className="bg-surface-muted/30">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
                            <div className="rounded-2xl border border-surface-border bg-white p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-subtle"><CreditCard className="h-4 w-4" /> Payment details</h3>
                                <select value={order.payment?.status || 'pending'} disabled={updatingId === order._id} onChange={(e) => handlePaymentStatus(order, e.target.value)} className={`rounded-lg border-0 px-3 py-2 text-xs font-bold capitalize ${PAYMENT_STATUS_STYLES[order.payment?.status || 'pending']}`} aria-label={`Update payment status for ${order.orderNumber}`}>
                                  {PAYMENT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                              </div>
                              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
                                <div><p className="text-xs text-ink-subtle">Status</p><p className="font-semibold capitalize">{order.payment?.status || 'pending'}</p></div>
                                <div><p className="text-xs text-ink-subtle">Method</p><p className="font-semibold">{(order.payment?.method || '—').replace(/_/g, ' ')}</p></div>
                                <div><p className="text-xs text-ink-subtle">Reference</p><p className="break-all font-semibold" title={order.payment?.reference || ''}>{order.payment?.reference || '—'}</p></div>
                                <div><p className="text-xs text-ink-subtle">Paid at</p><p className="font-semibold">{formatDateTime(order.payment?.paidAt)}</p></div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted">
                                <span>Amount paid: <strong className="text-ink">{formatPrice(order.total)}</strong></span>
                                <Link href={`/order-receipt?order=${order.orderNumber}`} target="_blank" className="font-semibold text-primary hover:underline">View receipt</Link>
                              </div>
                            </div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Products in this order</h3>
                            {(order.items || []).length > 0 ? order.items.map((item, index) => (
                              <div key={`${item.product?._id || item.product || item.name}-${index}`} className="flex items-start gap-3 border-b border-surface-border pb-3 last:border-0 last:pb-0">
                                {(item.image || item.product?.images?.[0]?.url) ? <img src={item.image || item.product.images[0].url} alt="" className="h-12 w-12 rounded-lg border border-surface-border bg-white object-contain p-1" /> : <Package className="h-5 w-5 text-ink-subtle" />}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-ink">{item.name || item.product?.name || 'Unnamed product'}</p>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                                    {(item.category || item.product?.category) && <span>Type: {item.category || item.product.category}</span>}
                                    {(item.brand || item.product?.brand) && <span>Brand: {item.brand || item.product.brand}</span>}
                                    {(item.condition || item.product?.condition) && <span>Condition: {item.condition || item.product.condition}</span>}
                                    <span>Qty: {item.quantity}</span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-ink">
                                    {item.variant?.storage && <span>Storage: {item.variant.storage}</span>}
                                    {item.variant?.color && <span>Color: {typeof item.variant.color === 'object' ? item.variant.color.name : item.variant.color}</span>}
                                    <span>Unit price: {formatPrice(item.price)}</span>
                                  </div>
                                </div>
                                <p className="text-sm font-semibold text-ink">{formatPrice((item.price || 0) * (item.quantity || 0))}</p>
                              </div>
                            )) : <p className="text-sm text-ink-muted">No product details available for this order.</p>}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAdminAuth(AdminOrders);

AdminOrders.getLayout = (page) => page;
