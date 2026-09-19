import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, ChevronUp, ChevronDown, Mail, Phone, MapPin, BookOpen } from 'lucide-react';
import siteConfig from '../../config';
import { useSettings } from '../../hooks/useSettings';

function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  const storeName = settings?.storeName || siteConfig.name;
  const social = settings?.social || siteConfig.social;
  const configuredContact = settings?.contact || {};
  const contact = {
    ...siteConfig.contact,
    ...configuredContact,
    phone: configuredContact.phones?.[0] || configuredContact.phone || siteConfig.contact.phone,
    whatsapp: configuredContact.whatsapp?.[0] || siteConfig.whatsappNumber,
  };
  const ourStory = settings?.ourStory || '';

  return (
    <footer className="mt-auto bg-white border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toggle Button */}
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-ink transition-colors uppercase tracking-widest px-4 py-2 rounded-full hover:bg-surface-muted"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Content */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mb-12' : 'max-h-0 opacity-0 mb-0'}`}>
          {/* Contact - first on all devices */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-6">Contact</h3>
            <ul className="space-y-3 text-sm text-ink-muted list-none">
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-ink-subtle" />
                  <span>{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-ink transition-colors">
                    <Phone className="h-4 w-4 shrink-0 text-ink-subtle" />
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.whatsapp && (
                <li>
                  <a href={`https://wa.me/${String(contact.whatsapp).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-ink transition-colors">
                    <Phone className="h-4 w-4 shrink-0 text-ink-subtle" />
                    WhatsApp: {contact.whatsapp}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-ink transition-colors">
                    <Mail className="h-4 w-4 shrink-0 text-ink-subtle" />
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-6">Shop</h3>
            <ul className="space-y-4 text-sm text-ink-muted list-none">
              <li><Link href="/shop" className="hover:text-ink transition-colors">Shop All</Link></li>
              <li><Link href="/wishlist" className="hover:text-ink transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-6">Support</h3>
            <ul className="space-y-4 text-sm text-ink-muted list-none">
              <li><Link href="/track" className="hover:text-ink transition-colors">Order Tracking</Link></li>
              <li><Link href="/contact" className="hover:text-ink transition-colors">Contact Us</Link></li>
              {ourStory && (
                <li>
                  <span className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 shrink-0 text-ink-subtle" />
                    <span className="text-ink-muted">{ourStory}</span>
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink mb-6">{storeName}</h3>
            <div className="flex flex-wrap items-center gap-3">
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-surface-muted text-ink hover:bg-surface-border transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {social?.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="X" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-surface-muted text-ink hover:bg-surface-border transition-colors">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {social?.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-surface-muted text-ink hover:bg-surface-border transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {social?.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-10 w-10 inline-flex items-center justify-center rounded-full bg-surface-muted text-ink hover:bg-surface-border transition-colors">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.13-3.65-5.46-.24-2.42.88-4.94 2.87-6.23 1.56-1.04 3.51-1.3 5.31-1.02V13.3c-1.3-.11-2.61.27-3.59 1.05-1.27 1.02-1.74 2.75-1.16 4.24.47 1.25 1.58 2.26 2.89 2.54 1.83.43 3.86-.25 4.96-1.72.63-.82.94-1.85.94-2.88V0h3.81z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Compact Footer Bottom */}
        <div className={`pt-6 ${isExpanded ? 'border-t border-surface-border' : ''} flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300`}>
          <p className="text-xs font-medium text-ink-muted">
            © {currentYear} {storeName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-ink-muted">
            <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs font-medium text-ink-muted">
          Developed by{' '}
          <a href="https://sethowusu.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:underline">
            SETH
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
