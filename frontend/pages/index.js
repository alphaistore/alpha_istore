import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ShieldCheck,
  Truck,
  PackageCheck,
  HeadphonesIcon,
  ChevronRight,
  Search,
  User,
  ShoppingCart,
} from 'lucide-react';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import useProducts from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import ProductCard from '../components/product/ProductCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import siteConfig from '../config';
import useStore from '../store';

const featureItems = [
  { label: 'Nationwide Delivery', Icon: Truck },
  { label: 'Secure Payment', Icon: ShieldCheck },
  { label: 'Genuine Products', Icon: PackageCheck },
  { label: 'Fast Support', Icon: HeadphonesIcon },
];

const ProductCardSkeleton = () => (
  <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-sm">
    <SkeletonLoader height="208px" className="mb-4 rounded-xl" />
    <SkeletonLoader width="80%" height="16px" className="mb-2" />
    <SkeletonLoader width="50%" height="20px" className="mb-4" />
    <SkeletonLoader width="100%" height="40px" className="rounded-xl" />
  </div>
);

function HomePage() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [openProfile, setOpenProfile] = useState(false);
  const defaultHero = {
    title: "The Perfect iPhone\nfor Every Lifestyle",
    subtitle: "Discover the latest iPhone 17 Pro Max with premium features, stunning displays, and unmatched performance. Shop now for exclusive deals.",
    image: { url: '/Apple-iPhone-18-Pro.png' },
  };

  const defaultSettings = {
    hero: defaultHero,
    contact: { whatsapp: [siteConfig.whatsappNumber || ''] },
    promoBanners: [],
  };

  const getString = (value, fallback) => {
    return typeof value === 'string' && value.trim() ? value : fallback;
  };

  const { featuredProducts, hotDeals, loading, error, fetchHomeProducts } = useProducts();
  const { settings } = useSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const pointerStart = useRef(null);

  useEffect(() => {
    fetchHomeProducts();
  }, [fetchHomeProducts]);

  const heroFromResponse = settings?.hero || {};
  const mergedHero = {
    ...defaultHero,
    ...heroFromResponse,
    title: getString(heroFromResponse.title, defaultHero.title),
    subtitle: getString(heroFromResponse.subtitle, defaultHero.subtitle),
    image: {
      ...defaultHero.image,
      ...heroFromResponse.image,
      url: getString(heroFromResponse?.image?.url, defaultHero.image.url),
    },
  };

  const heroImage = getString(mergedHero.image?.url, defaultHero.image.url);
  const configuredHeroImages = Array.isArray(settings?.heroImages) ? settings.heroImages : [];
  const localHeroImages = [
    { url: '/Apple-iPhone-18-Pro.png' },
    { url: '/iphone-18-duo.png' },
    { url: '/Apple-iPhone-18-Pro-color-lineup.png' },
  ];
  const heroSlides = [
    { ...mergedHero, image: { url: heroImage } },
    ...localHeroImages
      .filter((image) => image.url !== heroImage)
      .map((image) => ({ ...mergedHero, image })),
    ...configuredHeroImages
      .map((image) => (typeof image === 'string' ? { url: image } : image))
      .filter((image) => getString(image?.url, ''))
      .filter((image, index, images) => images.findIndex((item) => item.url === image.url) === index)
      .filter((image) => image.url !== heroImage)
      .map((image) => ({ ...mergedHero, image })),
  ];

  useEffect(() => {
    setActiveSlide((current) => Math.min(current, Math.max(heroSlides.length - 1, 0)));
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2 || isInteracting) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length, isInteracting]);

  const showSlide = (index) => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
    setIsInteracting(true);
  };

  const handlePointerDown = (event) => {
    pointerStart.current = event.clientX;
    setIsInteracting(true);
  };

  const handlePointerUp = (event) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) > 48) showSlide(activeSlide + (distance < 0 ? 1 : -1));
  };

  const handleHeroKeyDown = (event) => {
    if (event.key === 'ArrowRight') showSlide(activeSlide + 1);
    if (event.key === 'ArrowLeft') showSlide(activeSlide - 1);
  };

  // Mocking extra product arrays for "Latest Arrivals" and "Best Sellers" since they aren't provided by the hook directly
  const latestArrivals = featuredProducts ? [...featuredProducts].reverse() : [];
  const bestSellers = hotDeals ? [...hotDeals].reverse() : [];

  const currentHero = heroSlides[activeSlide] || mergedHero;
  const isColorLineup = currentHero.image?.url?.includes('Apple-iPhone-18-Pro-color-lineup');
  const nextHero = heroSlides.length > 1
    ? heroSlides[(activeSlide + 1) % heroSlides.length]
    : null;
  const heroTitle = 'Premium Phones .\nTrusted in Ghana.';
  const heroSubtitle = 'Shop genuine smartphones at competitive prices, with reliable service and convenient delivery across Ghana.';
  const metaDescription = heroSubtitle || defaultHero.subtitle;
  const whatsappNumber = Array.isArray(settings?.contact?.whatsapp) && settings.contact.whatsapp.length > 0
    ? settings.contact.whatsapp[0]
    : siteConfig.whatsappNumber || "";
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}` : "https://wa.me/";

  return (
    <>
      <Head>
        <title>{settings?.storeName || siteConfig.name} — Premium Experience</title>
        <meta name="description" content={metaDescription} />
        {heroSlides.slice(0, 3).map((slide) => (
          <link key={`hero-preload-${slide.image?.url}`} rel="preload" as="image" href={slide.image?.url} />
        ))}
      </Head>

      {/* Hero Section */}
      <section
        aria-roledescription="carousel"
        aria-label="Featured products"
        tabIndex="0"
        onKeyDown={handleHeroKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => { setIsInteracting(false); pointerStart.current = null; }}
        className="group relative min-h-screen overflow-hidden bg-transparent text-white outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero%20background.jpg')" }}
        />
        <div key={`shadow-${currentHero.image?.url}`}         className={`hero-image-shadow pointer-events-none absolute ${isColorLineup ? 'bottom-[41vh]' : 'bottom-[47vh]'} left-1/2 z-[1] h-8 w-[min(14rem,48vw)] -translate-x-1/2 rounded-[50%] bg-white/30 blur-2xl md:bottom-[15vh] md:left-[59%] md:h-12 md:w-[min(24rem,42vw)] lg:left-[61%]`} aria-hidden="true" />
        <img
          key={currentHero.image?.url}
          src={currentHero.image?.url || '/Apple-iPhone-18-Pro.png'}
          alt={currentHero.title || 'Featured iPhone'}
          aria-hidden="true"
          className={`hero-image-enter pointer-events-none absolute ${isColorLineup ? 'bottom-[42vh]' : 'bottom-[48vh]'} left-1/2 z-[2] h-[42vh] max-h-[24rem] w-auto -translate-x-1/2 object-contain md:bottom-[16vh] md:left-[59%] md:h-[68vh] md:max-h-[46rem] lg:left-[61%]`}
        />
        {nextHero?.image?.url && (
          <button
            type="button"
            onClick={() => showSlide(activeSlide + 1)}
            aria-label="Show next hero slide"
            className="hero-next-preview pointer-events-auto absolute bottom-[36vh] left-[88%] z-20 h-16 w-14 -translate-x-1/2 touch-manipulation md:bottom-[3vh] md:left-[78%] md:h-20 md:w-16 lg:left-[76%]"
          >
            <img
              src={nextHero.image.url}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain drop-shadow-xl"
            />
          </button>
        )}
          <div className="absolute left-5 top-5 z-10 text-2xl font-bold tracking-tight text-white sm:left-8 sm:top-7 lg:left-12">
            AlphaiStore
          </div>
          <div className="absolute right-5 top-5 z-10 flex items-center gap-3 sm:right-8 sm:top-7 lg:right-12">
            <Link href="/shop" aria-label="Search products" className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-white/70">
              <Search className="h-5 w-5" />
            </Link>
            {user ? (
              <div className="relative">
                <button type="button" onClick={() => setOpenProfile((open) => !open)} aria-label="Open profile menu" aria-expanded={openProfile} className="inline-flex h-10 w-10 items-center justify-center bg-transparent text-white transition-colors hover:bg-transparent hover:text-white/70">
                  <User className="h-5 w-5" />
                </button>
                {openProfile && (
                  <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-black bg-white text-left shadow-xl">
                    <div className="border-b border-surface-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'My account'}</p>
                      <p className="truncate text-xs text-ink-subtle">{user.email}</p>
                    </div>
                    <Link href="/orders" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">My orders</Link>
                    <Link href="/profile" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">Profile</Link>
                    <button type="button" onClick={() => { logout(); setOpenProfile(false); router.push('/'); }} className="block w-full border-t border-surface-border px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login?redirect=/orders" aria-label="Sign in to view orders" className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-white/70">
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link href="/cart" aria-label="Cart" className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-white/70">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-5 py-24 sm:px-8 lg:px-12">
          <div className="relative z-10 w-full max-w-[min(30rem,72vw)] translate-y-40 pb-20 sm:translate-y-32 md:translate-y-20 md:pb-0">
            <h1 className="animate-[heroTextIn_700ms_ease-out_both] text-2xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
              {heroTitle.split('\n').map((line, index) => <span key={index} className="block">{line}</span>)}
            </h1>
            <p className="mt-4 max-w-sm animate-[heroTextIn_800ms_120ms_ease-out_both] text-sm leading-5 text-slate-200 sm:text-base sm:leading-6">
              {heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-3">
              <Link href="/shop" className="hero-glass-button hero-glass-button-primary hero-shop-button inline-flex h-11 w-1/2 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto">Shop Now</Link>
              <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hero-glass-button hero-whatsapp-button inline-flex h-11 self-start items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-white/90 sm:px-6">
                <WhatsAppIcon className="h-[18px] w-[18px] text-green-600" />
                Order on WhatsApp
              </Link>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <div className="absolute bottom-8 left-5 right-5 z-20 flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12">
              <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
                {heroSlides.map((slide, index) => (
                  <button key={`${slide.image?.url}-${index}`} type="button" role="tab" aria-selected={index === activeSlide} aria-label={`Show slide ${index + 1}`} onClick={() => showSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Bar */}
      <section className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featureItems.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3 group">
                <span className="h-14 w-14 inline-flex items-center justify-center rounded-2xl bg-white shadow-sm text-black group-hover:bg-white transition-colors duration-300">
                  <Icon className="h-6 w-6 text-black" />
                </span>
                <span className="font-semibold text-sm text-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banners Section */}
      {settings?.promoBanners && settings.promoBanners.length > 0 && (
        <section className="bg-transparent py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {settings?.promoBanners?.map((promo, idx) => (
                <div key={idx} style={{ backgroundColor: promo.color || '#EAEBED' }} className={`rounded-2xl md:rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-8 relative h-[180px] md:min-h-[220px] promo-pattern-${promo.pattern || 'none'}`}>
                  <div className="relative z-10 max-w-full md:max-w-[60%] mb-2 md:mb-0 pr-24 md:pr-0">
                    <h3 className="text-base md:text-2xl font-bold text-white mb-1 md:mb-2 leading-tight">{promo.title}</h3>
                    <p className="text-white/80 mb-3 md:mb-6 text-xs md:text-sm">{promo.subtitle}</p>
                    {promo.link && (
                      <Link href={promo.link} className="inline-flex h-8 md:h-10 items-center justify-center px-4 md:px-6 rounded-full bg-white text-ink text-xs md:text-sm font-bold shadow-sm hover:-translate-y-0.5 transition-transform">
                        {promo.cta || 'Shop Now'}
                      </Link>
                    )}
                  </div>
                  {promo.image?.url && (
                    <div className="absolute right-0 bottom-0 md:top-0 w-2/3 md:w-1/2 flex items-end justify-end z-10 h-full md:h-auto">
                      <img src={promo.image.url} alt={promo.title} className="max-h-full md:max-h-[110%] w-auto object-contain object-bottom drop-shadow-xl" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Sections */}
      <div className="bg-background pb-20">
        
        {/* Featured devices */}
        <section className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-ink">
                  Featured Devices
                </h2>
              </div>
              <Link
                href="/shop?featured=true"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            {loading && (
              <div className="products-grid">
                {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            )}

            {!loading && !error && featuredProducts.length > 0 && (
              <div className="products-grid">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <ProductCard key={product._id || product.id} product={product} priority={index < 4} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Flash Deals removed per request */}

      </div>
    </>
  );
}

export default HomePage;