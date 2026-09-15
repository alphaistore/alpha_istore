import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useStore } from '../../store';
import { authAPI } from '../../lib/api';
import PasswordInput from '../../components/ui/PasswordInput';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const password = form.password.trim();

    if (firstName.length < 2 || lastName.length < 2) {
      toast.error('Please enter your first and last name');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (phone && !/^\+?[0-9\s-]{8,15}$/.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register({ ...form, firstName, lastName, email, phone, password });
      login(res.user, res.token);
      toast.success('Account created!');
      const redirectTo = typeof router.query.redirect === 'string' ? router.query.redirect : '/';
      router.push(redirectTo);
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Create Account — Alpha iStore</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: "url('/images/hero%20background.jpg') center / cover fixed", padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>AlphaiStore</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>Create your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>First Name</label>
                <input type="text" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Kofi"
                  style={{ width: '100%', height: '44px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Last Name</label>
                <input type="text" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Mensah"
                  style={{ width: '100%', height: '44px', padding: '0 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Email</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+233 XXX XXX XXX"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Password</label>
              <PasswordInput value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 8 characters"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '46px', background: '#fff', color: '#0f172a', border: '1px solid #0f172a', borderRadius: '999px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Already have an account? <Link href="/auth/login" style={{ color: '#000000', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
