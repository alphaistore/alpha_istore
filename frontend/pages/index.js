import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  PackageCheck,
  HeadphonesIcon,
  ChevronRight,
} from 'lucide-react';
import WhatsAppIcon from '../components/ui/WhatsAppIcon';
import useProducts from '../hooks/useProducts';
import { useSettings } from '../hooks/useSettings';
import ProductCard from '../components/product/ProductCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import siteConfig from '../config';

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
  const defaultHero = {
    title: "The Perfect iPhone\nfor Every Lifestyle",
    subtitle: "Discover the latest iPhone 17 Pro Max with premium features, stunning displays, and unmatched performance. Shop now for exclusive deals.",
    image: { url: '/images/placeholder-phone.jpg' },
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

  // Mocking extra product arrays for "Latest Arrivals" and "Best Sellers" since they aren't provided by the hook directly
  const latestArrivals = featuredProducts ? [...featuredProducts].reverse() : [];
  const bestSellers = hotDeals ? [...hotDeals].reverse() : [];

  const heroTitle = getString(mergedHero.title, defaultHero.title);
  const heroSubtitle = getString(mergedHero.subtitle, defaultHero.subtitle);
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
        {heroImage && (
          <link rel="preload" as="image" href={heroImage} fetchPriority="high" />
        )}
      </Head>

      {/* Hero Section */}
      <section className="bg-white overflow-hidden relative border-b border-surface-border rounded-b-[2.5rem] shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink leading-tight mb-6">
                {heroTitle.split('\n').map((line, idx) => (
                  <span key={idx} className="block">{line}</span>
                ))}
              </h1>
              <p className="text-lg text-ink-muted leading-relaxed max-w-lg mb-10">
                {heroSubtitle}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex h-12 items-center justify-center gap-2 px-8 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink-muted shadow-smooth transition-all"
                >
                  Shop Now
                </Link>
                <Link
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 px-8 rounded-full bg-white text-ink text-sm font-semibold hover:bg-surface-muted shadow-sm border border-surface-border transition-all"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px] text-[#25D366]" />
                  Order on WhatsApp
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center items-center z-0 md:h-[450px] h-[300px]">
              <div className="relative w-full h-full max-w-md">
                <img
                  src={heroImage}
                  alt="Hero image"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-contain rounded-[1rem]"
                  style={{
                    background: '#f8fafc',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bar */}
      <section className="bg-transparent border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featureItems.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3 group">
                <span className="h-14 w-14 inline-flex items-center justify-center rounded-2xl bg-white shadow-sm text-ink group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-semibold text-sm text-ink">{label}</span>
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
        
        {/* Featured iPhones */}
        <section className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-ink">
                  Featured iPhones
                </h2>
              </div>
              <Link
                href="/shop?brand=iphone"
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
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
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