import Link from 'next/link';
import Head from 'next/head';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found — AlphaiStore</title>
      </Head>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <p className="text-7xl md:text-8xl font-semibold tracking-tightish text-surface-border">
            404
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tightish text-ink">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            The page you are looking for doesn't exist. It may have moved or
            been removed.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 px-5 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink/80 shadow-smooth"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center gap-2 px-5 rounded-xl border border-surface-border bg-white text-ink text-sm font-medium hover:bg-surface-muted"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse shop
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}