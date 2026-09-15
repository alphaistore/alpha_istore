import React from 'react';
import { useRouter } from 'next/router';
import { Home, ShoppingBag, ShoppingCart, Package, User, LogOut } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import useStore from '../../store';

export default function MobileNav() {
  const { pathname } = useRouter();
  const { isSignedIn } = useUser();
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((c, item) => c + item.quantity, 0);

  const baseNavItems = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/shop', label: 'Shop', Icon: ShoppingBag },
    { href: '/cart', label: 'Cart', Icon: ShoppingCart },
    { href: '/orders', label: 'Orders', Icon: Package },
  ];

  const navItems = isSignedIn
    ? [...baseNavItems, { href: '#', label: 'Sign Out', Icon: LogOut, isSignOut: true }]
    : [...baseNavItems, { href: '/sign-in', label: 'Account', Icon: User }];

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed bottom-0 inset-x-0 bg-white border-t border-surface-border md:hidden z-40"
    >
      <ul className="grid grid-cols-5">
        {navItems.map(({ href, label, Icon, isSignOut }) => {
          const isActive = !isSignOut && (href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`));
          const isCart = href === '/cart';

          const handleClick = isSignOut ? (e) => {
            e.preventDefault();
          } : undefined;

          return (
            <li key={href + label}>
              {isSignOut ? (
                <span className="relative flex flex-col items-center justify-center py-2.5 text-[11px] font-medium text-ink-muted">
                  <SignOutButton>
                    <button className="relative flex flex-col items-center justify-center py-2.5 text-[11px] font-medium text-ink-muted hover:text-ink">
                      <Icon className="h-5 w-5" />
                      <span className="mt-1">{label}</span>
                    </button>
                  </SignOutButton>
                </span>
              ) : (
                <a
                  href={href}
                  onClick={handleClick}
                  className={`relative flex flex-col items-center justify-center py-2.5 text-[11px] font-medium ${
                    isActive
                      ? 'text-ink'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
{isActive && (
                      <span
                        aria-hidden
                        className="absolute top-0 inset-x-3 h-0.5 bg-ink rounded-b-full"
                      />
                    )}
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {isCart && cartCount > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full bg-status-danger text-[10px] font-semibold text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="mt-1">{label}</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}