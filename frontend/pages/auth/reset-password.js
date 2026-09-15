import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { resetPassword } from '../../lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const otp = form.otp.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, password });
      toast.success('Password reset successful');
      router.push('/auth/login');
    } catch (error) {
      toast.error(error?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Reset Password — Alpha iStore</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#000000', margin: 0 }}>Reset Password</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>Enter your email, OTP code, and new password.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="you@email.com"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>OTP Code</label>
              <input
                type="text"
                value={form.otp}
                onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value }))}
                placeholder="123456"
                maxLength={6}
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>New Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="New password"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '46px', background: '#000000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            Remembered your password? <Link href="/auth/login" style={{ color: '#000000', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
