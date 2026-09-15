import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/portal/AdminLayout';
import withAdminAuth from '../../components/portal/withAdminAuth';
import { Download, FileSpreadsheet, TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../lib/api';

function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getAll({ limit: 10000 });
        if (active) setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrders();
    return () => { active = false; };
  }, []);

  const filteredOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    if (dateFrom && date < new Date(dateFrom)) return false;
    if (dateTo && date > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const groupOrders = () => {
    const groups = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;
      if (period === 'daily') key = date.toLocaleDateString('en-GB');
      else if (period === 'monthly') key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      else key = date.getFullYear().toString();

      if (!groups[key]) groups[key] = { orders: 0, revenue: 0, items: 0 };
      groups[key].orders += 1;
      groups[key].revenue += order.total || order.totalGHS || 0;
      groups[key].items += (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
    });
    return groups;
  };

  const grouped = groupOrders();
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || o.totalGHS || 0), 0);
  const totalItems = filteredOrders.reduce((s, o) => s + (o.items || []).reduce((ss, i) => ss + (i.quantity || 1), 0), 0);

  const downloadCSV = () => {
    const rows = [['Period', 'Orders', 'Items Sold', 'Revenue (GHS)']];
    Object.entries(grouped).forEach(([periodLabel, data]) => {
      rows.push([periodLabel, data.orders, data.items, data.revenue.toFixed(2)]);
    });
    rows.push(['', '', '', '']);
    rows.push(['TOTAL', filteredOrders.length, totalItems, totalRevenue.toFixed(2)]);

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpha-istore-report-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV report downloaded!');
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const rows = Object.entries(grouped).map(([p, d]) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${p}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.orders}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.items}</td>
        <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">GHS ${d.revenue.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sales Report — Alpha iStore</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
          h1 { color: #000000; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th { background: #000000; color: white; padding: 12px 10px; text-align: left; }
          th:nth-child(2), th:nth-child(3) { text-align: center; }
          th:nth-child(4) { text-align: right; }
          .total-row td { font-weight: 800; background: #f0f9ff; padding: 14px 10px; }
          .summary { display: flex; gap: 24px; margin: 24px 0; }
          .stat { background: #f8fafc; border-radius: 12px; padding: 16px 20px; flex: 1; }
          .stat-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
          .stat-value { font-size: 22px; font-weight: 800; color: #000000; }
        </style>
      </head>
      <body>
        <h1>Alpha iStore — Sales Report</h1>
        <p style="color:#64748b;">Generated: ${new Date().toLocaleString()} | Period: ${period.charAt(0).toUpperCase() + period.slice(1)}</p>
        ${dateFrom || dateTo ? `<p style="color:#64748b;">Date range: ${dateFrom || 'Start'} to ${dateTo || 'Today'}</p>` : ''}
        <div class="summary">
          <div class="stat"><div class="stat-label">Total Orders</div><div class="stat-value">${filteredOrders.length}</div></div>
          <div class="stat"><div class="stat-label">Items Sold</div><div class="stat-value">${totalItems}</div></div>
          <div class="stat"><div class="stat-label">Total Revenue</div><div class="stat-value">GHS ${totalRevenue.toFixed(2)}</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Orders</th>
              <th>Items Sold</th>
              <th>Revenue (GHS)</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td>TOTAL</td>
              <td style="text-align:center;">${filteredOrders.length}</td>
              <td style="text-align:center;">${totalItems}</td>
              <td style="text-align:right;">GHS ${totalRevenue.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
    toast.success('PDF report opened!');
  };

  return (
    <>
      <Head><title>Reports — Admin</title></Head>
      <AdminLayout title="Sales Reports" subtitle="View and export sales data">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Group By</label>
            <select value={period} onChange={e => setPeriod(e.target.value)} style={{ height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', background: '#fff' }}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ height: '40px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' }} />
          </div>
          <button onClick={downloadCSV} style={{ height: '40px', padding: '0 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button onClick={downloadPDF} style={{ height: '40px', padding: '0 16px', background: '#000000', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Orders', value: filteredOrders.length, icon: ShoppingBag, color: '#000000' },
            { label: 'Items Sold', value: totalItems, icon: Package, color: '#7c3aed' },
            { label: 'Total Revenue', value: `GHS ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#16a34a' },
            { label: 'Avg Order Value', value: filteredOrders.length ? `GHS ${(totalRevenue / filteredOrders.length).toFixed(2)}` : 'GHS 0', icon: TrendingUp, color: '#ea580c' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Revenue by {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
          {loading ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No data for selected period</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingBottom: '30px', overflowX: 'auto' }}>
              {Object.entries(grouped).map(([label, data]) => {
                const maxRevenue = Math.max(...Object.values(grouped).map(d => d.revenue));
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 160 : 0;
                return (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                    <span style={{ fontSize: '10px', color: '#000000', fontWeight: 700 }}>GHS {data.revenue.toFixed(0)}</span>
                    <div title={`${label}: GHS ${data.revenue.toFixed(2)}`} style={{ width: '40px', height: `${Math.max(height, 4)}px`, background: 'linear-gradient(180deg, #000000, #333333)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s', cursor: 'pointer' }} />
                    <span style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: 1.2, maxWidth: '60px', wordBreak: 'break-word' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Period</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Orders</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Items Sold</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
              ) : Object.entries(grouped).length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No orders found for selected period.</td></tr>
              ) : (
                Object.entries(grouped).map(([p, d]) => (
                  <tr key={p} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{p}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{d.orders}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>{d.items}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#000000' }}>GHS {d.revenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
              {!loading && Object.keys(grouped).length > 0 && (
                <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f5f5f5' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>TOTAL</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>{filteredOrders.length}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>{totalItems}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#000000' }}>GHS {totalRevenue.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    </>
  );
}

export default withAdminAuth(AdminReports);
AdminReports.getLayout = (page) => page;
