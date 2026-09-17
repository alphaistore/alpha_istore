import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, Package, LogOut } from 'lucide-react';
import useStore from '../store';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login?redirect=/profile');
      return;
    }
    setChecked(true);
  }, [router, user]);

  if (!checked) return null;

  return (
    <>
      <Head><title>Profile — AlphaiStore</title></Head>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border-2 border-black bg-white p-6">
          <div className="flex items-center gap-3 border-b border-surface-border pb-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink"><User className="h-5 w-5" /></span>
            <div>
              <h1 className="text-xl font-bold text-ink">My profile</h1>
              <p className="text-sm text-ink-muted">Your Alpha iStore account</p>
            </div>
          </div>
          <dl className="space-y-3 py-5 text-sm">
            <div><dt className="font-semibold text-ink-subtle">Name</dt><dd className="text-ink">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not provided'}</dd></div>
            <div><dt className="font-semibold text-ink-subtle">Email</dt><dd className="text-ink">{user.email}</dd></div>
            <div><dt className="font-semibold text-ink-subtle">Phone</dt><dd className="text-ink">{user.phone || 'Not provided'}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-3 border-t border-surface-border pt-5">
            <Link href="/orders" className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white"><Package className="h-4 w-4" /> My orders</Link>
            <button type="button" onClick={() => { logout(); router.replace('/'); }} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </section>
      </main>
    </>
  );
}
