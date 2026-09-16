import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Menu,
  X,
  LogOut,
  Store,
  BarChart2,
  Mail,
} from 'lucide-react';
import { useAdminAuthStore } from '../../store/adminAuth';

const NAV = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/products', label: 'Products', icon: Package },
  { href: '/portal/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/portal/messages', label: 'Messages', icon: Mail },
  { href: '/portal/reports', label: 'Reports', icon: BarChart2 },
  { href: '/portal/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children, title, subtitle, hideSidebar = false }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdminAuthStore();

  const handleSignOut = () => {
    logout();
    toast.success('Signed out successfully');
    router.push('/portal/login');
  };

  if (hideSidebar) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div aria-hidden style={{ position: 'fixed', inset: '-18px', background: "url('/images/hero%20background.jpg') center / cover", filter: 'blur(8px)', transform: 'scale(1.04)', zIndex: 0 }} />
        <div style={{ width: '100%', maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
          {title && (
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <div aria-hidden style={{ position: 'fixed', inset: '-18px', background: "url('/images/hero%20background.jpg') center / cover", filter: 'blur(8px)', transform: 'scale(1.04)', zIndex: 0 }} />
      
      {/* Sidebar */}
      <aside style={{
        width: '240px', background: '#0f172a', color: '#fff',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-240px',
        height: '100vh', zIndex: 50, transition: 'left 0.25s',
      }}
        className="lg-sidebar"
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#000000', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '15px', margin: 0 }}>AlphaiStore</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                background: active ? '#000000' : 'transparent',
                color: active ? '#fff' : '#94a3b8',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>
            <LogOut size={16} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: '0', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }} className="admin-main">
        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
              {sidebarOpen ? <X size={22} color="#0f172a" /> : <Menu size={22} color="#0f172a" />}
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
              {subtitle && <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#fee2e2';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </header>

        <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar { left: 0 !important; }
          .admin-main { margin-left: 240px !important; }
        }
      `}</style>
    </div>
  );
}
