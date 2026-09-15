import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react';
import useStore from '../../store';

const navItems = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/cart', label: 'Cart', Icon: ShoppingCart },
  { href: '/orders', label: 'Orders', Icon: Package },
  { href: '/sign-in', label: 'Account', Icon: User },
];

export default function Navbar() {
  const { pathname } = useRouter();
  const cart = useStore((s) => s.cart);
  const cartCount = cart.reduce((c, item) => c + item.quantity, 0);

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 bg-white border-t border-surface-border md:hidden z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {navItems.map(({ href, label, Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(`${href}/`);
          const isCart = href === '/cart';
          return (
            <li key={href}>
              <Link
                href={href}
                className={`relative flex flex-col items-center justify-center py-2.5 text-[11px] font-medium ${
                  isActive
                    ? 'text-ink'
                    : 'text-ink-muted hover:text-ink'
                }`}
                aria-current={isActive ? 'page' : undefined}
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}