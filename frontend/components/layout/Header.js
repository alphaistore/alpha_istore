import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, ShoppingCart, User } from 'lucide-react';
import useStore from '../../store';

export default function Header() {
  const router = useRouter();
  const { user, logout, cart, setCartOpen } = useStore();
  const [openMobile, setOpenMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  const handleProfileClick = () => {
    if (!user) router.push('/auth/login?redirect=/orders');
    else setOpenProfile((open) => !open);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-white/20 bg-cover bg-center text-white shadow-sm"
      style={{ backgroundImage: "url('/images/hero%20background.jpg')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row h-auto lg:h-16 py-3 lg:py-0 items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-white">AlphaiStore</Link>
            <div className="flex lg:hidden items-center gap-3">
              <button type="button" onClick={() => setOpenMobile(!openMobile)} data-no-hover className="inline-flex h-9 w-9 items-center justify-center text-white hover:text-white/70" aria-label="Open search">
                <Search className="h-5 w-5" />
              </button>
              <div className="relative">
                <button type="button" onClick={handleProfileClick} data-no-hover className="inline-flex h-9 w-9 items-center justify-center bg-transparent text-white hover:bg-transparent hover:text-white/70" aria-label="Open profile menu" aria-expanded={openProfile}>
                  <User className="h-5 w-5" />
                </button>
                {user && openProfile && (
                  <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-2xl border border-black bg-white text-left shadow-xl">
                    <div className="border-b border-surface-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'My account'}</p>
                      <p className="truncate text-xs text-ink-subtle">{user.email}</p>
                    </div>
                    <Link href="/orders" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">My orders</Link>
                    <Link href="/profile" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">Profile</Link>
                    <button type="button" onClick={() => { handleSignOut(); setOpenProfile(false); }} className="block w-full border-t border-surface-border px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => setCartOpen(true)} className="relative inline-flex h-9 w-9 items-center justify-center text-white hover:text-white/70" aria-label="Open cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

              <form
            onSubmit={(e) => {
              e.preventDefault();
              const query = e.target.search.value.trim();
              if (query) router.push(`/shop?q=${encodeURIComponent(query)}`);
            }}
            className="w-full lg:flex-1 lg:max-w-md hidden lg:flex mx-auto"
          >
            <div className="relative w-full flex items-center">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" aria-hidden />
              <input type="text" name="search" placeholder="Search for phones, laptops, accessories…" className="w-full h-10 pl-10 pr-4 text-sm bg-white/15 border border-white/30 rounded-md placeholder:text-white/70 text-white focus:bg-white/25 focus:border-white focus:ring-4 focus:ring-white/10 transition-all" />
            </div>
          </form>

          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <nav className="flex items-center gap-6 text-sm font-semibold text-white mr-2">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <Link href="/shop" className="hover:text-white/70 transition-colors">Products</Link>
              <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
            </nav>

            <div className="h-6 w-px bg-white/30 hidden lg:block"></div>

            <div className="flex items-center gap-4 text-sm font-semibold">
              <div className="relative">
                <button type="button" onClick={handleProfileClick} className="inline-flex h-9 w-9 items-center justify-center bg-transparent text-white hover:bg-transparent hover:text-white/70" aria-label="Open profile menu" aria-expanded={openProfile}>
                  <User className="h-5 w-5" />
                </button>
                {user && openProfile && (
                  <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-2xl border border-black bg-white text-left shadow-xl">
                    <div className="border-b border-surface-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'My account'}</p>
                      <p className="truncate text-xs text-ink-subtle">{user.email}</p>
                    </div>
                    <Link href="/orders" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">My orders</Link>
                    <Link href="/profile" onClick={() => setOpenProfile(false)} className="block px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted">Profile</Link>
                    <button type="button" onClick={() => { handleSignOut(); setOpenProfile(false); }} className="block w-full border-t border-surface-border px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
                  </div>
                )}
              </div>

              <button type="button" data-no-hover onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative inline-flex h-9 w-9 items-center justify-center text-white hover:text-white/70">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[20px] h-[20px] px-1 inline-flex items-center justify-center rounded-full bg-white text-[10px] font-bold text-black shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {openMobile && (
          <div className="lg:hidden py-4 space-y-4 border-t border-surface-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value.trim();
                if (query) router.push(`/shop?q=${encodeURIComponent(query)}`);
                setOpenMobile(false);
              }}
              className="px-2"
            >
              <div className="relative w-full flex items-center">
                <input type="text" name="search" placeholder="Search…" className="w-full h-10 px-4 text-sm bg-white/15 border border-white/30 rounded-md placeholder:text-white/70 text-white focus:bg-white/25 focus:border-white outline-none" />
              </div>
            </form>
            <nav className="space-y-1">
              <Link href="/" onClick={() => setOpenMobile(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink transition-colors">Home</Link>
              <Link href="/shop" onClick={() => setOpenMobile(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink transition-colors">Products</Link>
              <Link href="/about" onClick={() => setOpenMobile(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink transition-colors">About</Link>
              {user ? (
                <>
                  <Link href="/orders" onClick={() => setOpenMobile(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-ink transition-colors">My Orders</Link>
                  <button type="button" onClick={handleSignOut} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Sign out</button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setOpenMobile(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold text-white">Sign in</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
