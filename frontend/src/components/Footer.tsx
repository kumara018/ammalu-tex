import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { STORE } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-maroon-950 text-maroon-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">{STORE.name}</h3>
            <p className="text-gold-400 text-xs font-medium tracking-widest uppercase mb-4">
              {STORE.tagline}
            </p>
            <p className="text-sm text-maroon-300 leading-relaxed">
              Your trusted destination for premium quality women&apos;s ethnic and contemporary wear.
              Serving customers since 2010.
            </p>
            <div className="flex gap-3 mt-5">
              <a href={STORE.facebook} className="p-2 bg-maroon-800 hover:bg-gold-600 rounded-lg transition-colors">
                <Facebook size={16} />
              </a>
              <a href={STORE.instagram} className="p-2 bg-maroon-800 hover:bg-gold-600 rounded-lg transition-colors">
                <Instagram size={16} />
              </a>
              <a href={STORE.twitter} className="p-2 bg-maroon-800 hover:bg-gold-600 rounded-lg transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-maroon-300">
              {['Chudithar', 'Tops', 'Lehenga', 'Crop Tops', 'Party Wears'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="hover:text-gold-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-maroon-300">
              <li><Link href="/orders" className="hover:text-gold-400 transition-colors">My Orders</Link></li>
              <li><Link href="/support" className="hover:text-gold-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/support#returns" className="hover:text-gold-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/support#shipping" className="hover:text-gold-400 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/support#size-guide" className="hover:text-gold-400 transition-colors">Size Guide</Link></li>
              <li><Link href="/support#faq" className="hover:text-gold-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-maroon-300">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                <span>
                  {STORE.shopNo},<br />
                  {STORE.area},<br />
                  {STORE.city}, {STORE.state}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-gold-400 flex-shrink-0" />
                <a href={`tel:${STORE.phone1}`} className="hover:text-gold-400 transition-colors">
                  {STORE.phone1}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-gold-400 flex-shrink-0" />
                <a href={`mailto:${STORE.email}`} className="hover:text-gold-400 transition-colors">
                  {STORE.email}
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-maroon-900 rounded-lg text-xs text-maroon-300">
              <p className="font-medium text-white mb-1">Store Timings</p>
              <p>{STORE.weekdays}</p>
              <p>{STORE.sunday}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-maroon-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-maroon-400">
          <p>&copy; {new Date().getFullYear()} Ammalu Tex. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/support#privacy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link href="/support#terms" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-maroon-500">Secure payments:</span>
            <span className="text-maroon-300 font-medium">Visa • Mastercard • UPI • COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
