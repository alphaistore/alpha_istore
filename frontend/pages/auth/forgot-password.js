import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(normalizedEmail);
      toast.success('OTP sent to your email');
      router.push('/auth/reset-password');
    } catch (error) {
      toast.error(error?.message || 'Unable to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Forgot Password — Alpha iStore</title></Head>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#000000', margin: 0 }}>Forgot Password</h1>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '6px' }}>Enter your email to receive a reset code.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '46px', background: '#000000', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending code...' : 'Send reset code'}
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
