import '../styles/globals.css';
import React, { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import Footer from '../components/layout/Footer';
import { useSettings } from '../hooks/useSettings';
import { useStore } from '../store';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const CartDrawer = dynamic(() => import('../components/cart/CartDrawer'), {
  ssr: false,
  loading: () => null,
});
const WhatsAppFloat = dynamic(() => import('../components/ui/WhatsAppFloat'), {
  ssr: false,
  loading: () => null,
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p>Something went wrong.</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const defaultFavicon = '/favicon.png';

const withVersion = (value, version) => {
  const base = value || defaultFavicon;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}v=${encodeURIComponent(version)}`;
};

const mimeFor = (url) => {
  if (!url) return 'image/png';
  const u = url.split('?')[0].toLowerCase();
  if (u.endsWith('.svg')) return 'image/svg+xml';
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.ico')) return 'image/x-icon';
  return 'image/png';
};

const getFaviconUrl = (settings) => {
  const fav = settings?.favicon;
  if (!fav) return null;

  const url = typeof fav === 'string' ? fav : fav?.url || null;
  if (!url) return null;

  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : null;
  } catch {
    return null;
  }
};

function MyApp({ Component, pageProps }) {
  const { isCartOpen, setCartOpen } = useStore();
  const [favicon, setFavicon] = useState(defaultFavicon);
  const cacheBuster = useMemo(() => encodeURIComponent(new Date().getTime()), []);
  const safeFavicon = favicon || defaultFavicon;
  const faviconVersioned = useMemo(() => withVersion(safeFavicon, cacheBuster), [safeFavicon, cacheBuster]);

  const { settings } = useSettings();

  useEffect(() => {
    let isMounted = true;

    const syncFavicon = () => {
      if (typeof document === 'undefined') return;
      const head = document.head;
      head.querySelectorAll('link[data-alpha-favicon="true"]').forEach((node) => node.remove());

      const createLink = (rel, href, type, sizes) => {
        const link = document.createElement('link');
        link.setAttribute('data-alpha-favicon', 'true');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        if (type) link.setAttribute('type', type);
        if (sizes) link.setAttribute('sizes', sizes);
        head.appendChild(link);
      };

      createLink('icon', faviconVersioned, mimeFor(safeFavicon), '32x32');
      createLink('shortcut icon', faviconVersioned, mimeFor(safeFavicon));
      createLink('apple-touch-icon', withVersion(defaultFavicon, cacheBuster));
    };

    syncFavicon();

    const fav = getFaviconUrl(settings);
    if (isMounted && fav) setFavicon(fav);

    return () => {
      isMounted = false;
    };
  }, [cacheBuster, faviconVersioned, safeFavicon, settings]);

  const getLayout = Component.getLayout;
  const router = useRouter();
  const isPortalRoute = router?.pathname?.startsWith('/portal');

  const headMarkup = (
    <Head>
      <title>{isPortalRoute || getLayout ? 'Admin — Alpha iStore' : 'Alpha iStore'}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link rel="icon" href={faviconVersioned} type={mimeFor(safeFavicon)} key="favicon" />
      <link rel="shortcut icon" href={faviconVersioned} type={mimeFor(safeFavicon)} key="shortcut-icon" />
      <link rel="apple-touch-icon" href={withVersion(defaultFavicon, cacheBuster)} key="apple-touch-icon" />
    </Head>
  );

  if (isPortalRoute || getLayout) {
    return (
      <ErrorBoundary>
        <div className={`${inter.variable} ${inter.className}`}>
          {headMarkup}
          {getLayout ? getLayout(<Component {...pageProps} />) : <Component {...pageProps} />}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0F172A',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 500,
              },
              success: { iconTheme: { primary: '#000000', secondary: '#fff' } },
              error: { iconTheme: { primary: '#991b1b', secondary: '#fff' } },
            }}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`${inter.variable} ${inter.className}`}>
        {headMarkup}
        <>
          <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
          {router.pathname !== '/' && <WhatsAppFloat />}
          <main className="site-main" style={{ minHeight: '100vh' }}>
            <Component {...pageProps} />
          </main>
          <Footer />
        </>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0F172A',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#000000', secondary: '#fff' } },
            error: { iconTheme: { primary: '#991b1b', secondary: '#fff' } },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default MyApp;
