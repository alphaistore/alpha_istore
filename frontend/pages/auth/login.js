import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useStore } from '../../store';
import { authAPI } from '../../lib/api';
import PasswordInput from '../../components/ui/PasswordInput';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady || !user) return;
    const redirectTo = typeof router.query.redirect === 'string' ? router.query.redirect : '/';
    router.replace(redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/');
  }, [router.isReady, router, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email: normalizedEmail, password: password.trim() });
      login(res.user, res.token);
      toast.success('Welcome back!');
      const requestedRedirect = typeof router.query.redirect === 'string' ? router.query.redirect : '/';
      const redirectTo = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : '/';
      router.replace(redirectTo);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Sign In — Alpha iStore</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: "url('/images/hero%20background.jpg') center / cover fixed", padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>AlphaiStore</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Password</label>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link href="/auth/forgot-password" style={{ fontSize: '13px', color: '#000000', fontWeight: 600 }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', height: '46px', background: '#fff', color: '#0f172a', border: '1px solid #0f172a', borderRadius: '999px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            No account? <Link href="/auth/signup" style={{ color: '#000000', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
