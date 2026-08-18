'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle, MapIcon } from 'lucide-react';

// lucide-react v1 removed every brand glyph, Instagram included, for trademark
// reasons. Inlined rather than pinned to v0 so the icon set stays current.
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import { STORE, WHATSAPP_URL, MAIL_URL, CALL_URL } from '@/lib/config';
import { LogoMark } from './Logo';

const SHOP_CATEGORIES = ['Chudithar', 'Tops', 'Lehenga', 'Half Saree', 'Crop Tops', 'Party Wears'];

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-paper-shade text-graphite-muted mt-0 border-t border-paper-edge">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand + Social */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <LogoMark size={40} className="text-graphite flex-shrink-0" />
              <div>
                <p className="text-graphite font-normal uppercase leading-tight" style={{ fontSize: '15px', letterSpacing: '0.04em' }}>
                  Ammalu Tex
                </p>
                <p className="text-graphite-faint font-semibold uppercase leading-tight mt-1" style={{ fontSize: '9.5px', letterSpacing: '0.1em' }}>
                  Premium Women&apos;s Textiles
                </p>
              </div>
            </Link>
            <p className="text-sm text-graphite-faint leading-relaxed mb-5">
              Your trusted destination for premium quality women&apos;s ethnic and contemporary wear at Texvalley Gangapuram.
            </p>
            <div className="flex gap-2 flex-wrap">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="p-2 bg-graphite hover:bg-thread rounded-sm transition-colors" title="WhatsApp">
                <MessageCircle size={16} />
              </a>
              <a href={STORE.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2 bg-graphite hover:bg-thread rounded-sm transition-colors" title="Instagram">
                <InstagramIcon size={16} />
              </a>
            </div>
          </div>

          {/* Shop — use router.push for reliable navigation */}
          <div>
            <h4 className="font-semibold text-graphite mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-graphite-faint">
              {SHOP_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => router.push(`/products?category=${encodeURIComponent(cat)}`)}
                    className="hover:text-gold-400 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => router.push('/products')} className="hover:text-gold-400 transition-colors">
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="font-semibold text-graphite mb-4">Help & Policies</h4>
            <ul className="space-y-2 text-sm text-graphite-faint">
              <li><Link href="/orders"             className="hover:text-gold-400 transition-colors">My Orders</Link></li>
              <li><Link href="/support"             className="hover:text-gold-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/support#size-guide"  className="hover:text-gold-400 transition-colors">Size Guide</Link></li>
              <li><Link href="/support#shipping"    className="hover:text-gold-400 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/support#returns"     className="hover:text-gold-400 transition-colors">Cancel, Return & Exchange FAQ</Link></li>
              <li><Link href="/cancellation"         className="hover:text-gold-400 transition-colors">Cancellation, Return & Exchange Policy</Link></li>
              <li><Link href="/terms"               className="hover:text-gold-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy"             className="hover:text-gold-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-graphite mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-graphite-faint">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span>{STORE.shopNo},<br />{STORE.area},<br />{STORE.city}, {STORE.state}</span>
                  <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-1.5 text-gold-400 hover:text-gold-300 font-medium text-xs transition-colors">
                    <MapIcon size={12} /> Open in Google Maps
                  </a>
                </div>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-green-400 transition-colors">
                  <MessageCircle size={16} className="text-green-400 flex-shrink-0" />
                  WhatsApp: {STORE.phone1}
                </a>
              </li>
              <li>
                <a href={CALL_URL} className="flex items-center gap-2.5 hover:text-gold-400 transition-colors">
                  <Phone size={16} className="text-gold-400 flex-shrink-0" />
                  {STORE.phone1}
                </a>
              </li>
              <li>
                <a href={`tel:${STORE.phone2}`} className="flex items-center gap-2.5 hover:text-gold-400 transition-colors">
                  <Phone size={16} className="text-gold-400 flex-shrink-0" />
                  {STORE.phone2}
                </a>
              </li>
              <li>
                <a href={MAIL_URL} className="flex items-center gap-2.5 hover:text-gold-400 transition-colors">
                  <Mail size={16} className="text-gold-400 flex-shrink-0" />
                  {STORE.email}
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-paper-bright rounded-sm text-xs text-graphite-muted border border-paper-edge">
              <p className="font-medium text-graphite mb-1">Store Timings</p>
              <p>{STORE.weekdays}</p>
              <p>{STORE.weekend}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-paper-edge mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-thread">
          <p>&copy; {new Date().getFullYear()} Ammalu Tex. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy"      className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms"        className="hover:text-gold-400 transition-colors">Terms of Service</Link>
            <Link href="/cancellation" className="hover:text-gold-400 transition-colors">Cancellation, Return & Exchange</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-maroon-500">Secure payments:</span>
            <span className="text-graphite-faint font-medium">Visa • Mastercard • UPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
