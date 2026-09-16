import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Package, Search, ExternalLink, Edit2, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
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

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
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

  const handleClearAll = async () => {
    if (!confirm('Are you sure? This will permanently delete ALL orders. This action cannot be undone.')) return;
    try {
      const res = await ordersAPI.clearAll();
      alert(res.data?.message || 'All orders deleted');
      fetchOrders();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Unknown error';
      alert('Failed to delete orders: ' + msg);
      console.error('Delete all orders error:', e);
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

  return (
    <>
      <Head>
        <title>Orders — Admin</title>
      </Head>
      <AdminLayout title="Orders" subtitle="Manage customer orders and updates">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-ink-subtle">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete All Orders
          </button>
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
                  <th className="px-6 py-4">Total</th>
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
                  orders.map(order => (
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
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}>
                          {order.status}
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
                      </td>
                    </tr>
                    {expandedOrderId === order._id && (
                      <tr className="bg-surface-muted/30">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="space-y-3">
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
