'use client';
import { useState, useEffect } from 'react';
import { STORE, WHATSAPP_URL, MAIL_URL, CALL_URL } from '@/lib/config';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp,
  MessageCircle, Package, RotateCcw, Truck, Shield,
  Ruler, FileText, Lock, HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Size data ────────────────────────────────────────────────────────────────
const SIZE_ROWS = [
  { size: 'S',    chest: '32–34" / 81–86 cm',    waist: '26–28" / 66–71 cm',   hip: '35–37" / 89–94 cm'    },
  { size: 'M',    chest: '34–36" / 86–91 cm',    waist: '28–30" / 71–76 cm',   hip: '37–39" / 94–99 cm'    },
  { size: 'L',    chest: '36–38" / 91–97 cm',    waist: '30–32" / 76–81 cm',   hip: '39–41" / 99–104 cm'   },
  { size: 'XL',   chest: '38–40" / 97–102 cm',   waist: '32–34" / 81–86 cm',   hip: '41–43" / 104–109 cm'  },
  { size: 'XXL',  chest: '40–42" / 102–107 cm',  waist: '34–36" / 86–91 cm',   hip: '43–45" / 109–114 cm'  },
  { size: 'XXXL', chest: '42–44" / 107–112 cm',  waist: '36–38" / 91–97 cm',   hip: '45–47" / 114–119 cm'  },
];

// ── Accordion component ──────────────────────────────────────────────────────
function Accordion({
  id, title, icon: Icon, children, defaultOpen = false, color = 'maroon',
}: {
  id?: string;
  title: string;
  // React 19 infers `never` for ElementType props; name what we pass instead.
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Auto-expand when arriving via a #anchor link (e.g. footer "Shipping Policy")
  // — a plain browser anchor only scrolls here, it doesn't know this section
  // is collapsed by default. Runs client-side only, after the hash-safe
  // initial render, so it can't cause a hydration mismatch.
  useEffect(() => {
    if (id && window.location.hash === `#${id}`) setOpen(true);
  }, [id]);

  return (
    <div id={id} className="card overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${open ? 'bg-maroon-50' : 'bg-white hover:bg-paper'}`}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 bg-maroon-100 rounded-sm text-maroon-800">
            <Icon size={18} />
          </span>
          <span className="font-normal text-graphite text-base">{title}</span>
        </div>
        {open
          ? <ChevronUp size={20} className="text-maroon-700 flex-shrink-0" />
          : <ChevronDown size={20} className="text-graphite-faint flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-6 pt-4 border-t border-maroon-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// ── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-maroon-200 rounded-sm overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-start gap-4 px-4 py-3.5 text-left transition-colors ${open ? 'bg-maroon-50' : 'bg-white hover:bg-paper'}`}
      >
        <span className="font-semibold text-graphite text-sm leading-snug">{q}</span>
        {open
          ? <ChevronUp size={17} className="text-maroon-700 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={17} className="text-graphite-faint flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 text-sm text-graphite-muted leading-relaxed border-t border-maroon-200 bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { user } = useAuth();

  // Rating form state
  // Rating widget removed — ratings are now sent via unique link after each support interaction
  // Admin logs CS interaction → customer receives email/WhatsApp with rating link

  return (
    <div className="mx-auto w-full max-w-[84rem] px-6 py-[clamp(3rem,9vh,6rem)] sm:px-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <MessageCircle size={15} /> Customer Support
        </div>
        <h1 className="font-display text-chapter font-normal text-graphite mb-4">How can we help you?</h1>
        <p className="text-graphite-faint max-w-xl mx-auto text-sm">
          Our support team at Ammalu Tex is here to help. Reach us through any of the
          channels below, or find quick answers in our policy sections.
        </p>
      </div>

      {/* ── Contact cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <a href={CALL_URL}
          className="card p-4 text-center transition-colors duration-500 group">
          <div className="inline-flex p-2.5 bg-transparent rounded-sm mb-2 text-blue-700 group-hover:bg-blue-100 transition-colors">
            <Phone size={20} />
          </div>
          <p className="font-normal text-graphite text-sm mb-0.5">Call Us</p>
          <p className="text-xs text-graphite-muted">{STORE.phone1}</p>
          <p className="text-xs text-graphite-muted">{STORE.phone2}</p>
          <p className="text-xs text-graphite-faint mt-1">{STORE.weekdays}</p>
        </a>

        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="card p-4 text-center transition-colors duration-500 group">
          <div className="inline-flex p-2.5 bg-transparent rounded-sm mb-2 text-green-700 group-hover:bg-green-100 transition-colors">
            <MessageCircle size={20} />
          </div>
          <p className="font-normal text-graphite text-sm mb-0.5">WhatsApp</p>
          <p className="text-xs text-graphite-muted">{STORE.phone1}</p>
          <p className="text-xs text-graphite-faint mt-1">Chat with us anytime</p>
        </a>

        <a href={MAIL_URL}
          className="card p-4 text-center transition-colors duration-500 group">
          <div className="inline-flex p-2.5 bg-maroon-50 rounded-sm mb-2 text-orange-700 group-hover:bg-orange-100 transition-colors">
            <Mail size={20} />
          </div>
          <p className="font-normal text-graphite text-sm mb-0.5">Email Us</p>
          <p className="text-xs text-graphite-muted break-all">{STORE.email}</p>
          <p className="text-xs text-graphite-faint mt-1">Reply within 24 hours</p>
        </a>

        <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="card p-4 text-center transition-colors duration-500 group">
          <div className="inline-flex p-2.5 bg-transparent rounded-sm mb-2 text-purple-700 group-hover:bg-purple-100 transition-colors">
            <MapPin size={20} />
          </div>
          <p className="font-normal text-graphite text-sm mb-0.5">Visit Store</p>
          <p className="text-xs text-graphite-muted">{STORE.shopNo}</p>
          <p className="text-xs text-graphite-muted">{STORE.area}</p>
          <p className="text-xs text-graphite-faint mt-1">Open in Maps</p>
        </a>
      </div>

      {/* ── Quick links ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Package,   label: 'Track My Order',  href: '/orders'      },
          { icon: RotateCcw, label: 'Return & Refund', href: '#returns'     },
          { icon: Truck,     label: 'Shipping Info',   href: '#shipping'    },
          { icon: Ruler,     label: 'Size Guide',      href: '#size-guide'  },
        ].map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href}
            className="card p-4 flex items-center gap-3 hover:border-maroon-200 border-2 border-transparent transition-all">
            <Icon size={18} className="text-maroon-700 flex-shrink-0" />
            <span className="text-sm font-semibold text-graphite-muted">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Size Guide ─────────────────────────────────────────────────── */}
      <Accordion id="size-guide" title="Size Guide" icon={Ruler} defaultOpen>
        <p className="text-sm text-graphite-faint mb-5">
          Take your body measurements (chest, waist, hips) in a relaxed position and compare
          with the chart below for the perfect fit.
        </p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-maroon-700 uppercase tracking-wide mb-1">
            Tops &amp; Crop Tops — S to XXXL
          </p>
          <div className="overflow-x-auto rounded-sm border border-maroon-200">
            <table className="w-full text-sm">
              <thead className="">
                <tr className="text-maroon-800 font-semibold text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Chest</th>
                  <th className="px-4 py-3 text-left">Waist</th>
                  <th className="px-4 py-3 text-left">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {SIZE_ROWS.map((row) => (
                  <tr key={row.size} className="hover:bg-maroon-50 transition-colors">
                    <td className="px-4 py-3 font-normal text-maroon-900">{row.size}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.chest}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.waist}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-maroon-700 uppercase tracking-wide mb-1">
            Chudithar, Lehenga, Half Saree &amp; Party Wears — L to XXXL
          </p>
          <div className="overflow-x-auto rounded-sm border border-maroon-200">
            <table className="w-full text-sm">
              <thead className="">
                <tr className="text-maroon-800 font-semibold text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Chest</th>
                  <th className="px-4 py-3 text-left">Waist</th>
                  <th className="px-4 py-3 text-left">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {SIZE_ROWS.filter((r) => ['L', 'XL', 'XXL', 'XXXL'].includes(r.size)).map((row) => (
                  <tr key={row.size} className="hover:bg-maroon-50 transition-colors">
                    <td className="px-4 py-3 font-normal text-maroon-900">{row.size}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.chest}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.waist}</td>
                    <td className="px-4 py-3 text-graphite-muted">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-transparent rounded-sm text-xs text-graphite-muted border border-amber-100">
          💡 <b>Measurement Tips:</b> Use a soft measuring tape. Measure chest at the fullest
          part, waist at the narrowest, and hips at the widest. For fitted styles (bodycon),
          choose your exact size. For flowing styles (lehenga, half saree), you can go one size
          down. When in doubt, size up.
        </div>
      </Accordion>

      {/* ── Shipping Policy ────────────────────────────────────────────── */}
      <Accordion id="shipping" title="Shipping Policy" icon={Truck}>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: 'Standard Delivery',
              desc:  '5–7 business days across India. A flat ₹49 shipping fee applies to all orders.',
            },
            {
              title: 'Express Delivery',
              desc:  '1–3 business days available in select cities. Additional charges apply based on location. Select at checkout.',
            },
            {
              title: 'Packaging',
              desc:  'All items are carefully packed to prevent damage. Delicate fabrics are wrapped in tissue paper for extra protection.',
            },
            {
              title: 'Service Areas',
              desc:  'We deliver across all 28 states and 8 union territories of India. Remote / hilly areas may take 1–2 extra days.',
            },
            {
              title: 'Order Processing',
              desc:  'Orders are confirmed and dispatched within 1–2 business days. You will receive an SMS/email with tracking details once shipped.',
            },
            {
              title: 'Order Tracking',
              desc:  'Track your shipment anytime from the "My Orders" section in your account, or use the tracking link sent to your registered email/phone.',
            },
          ].map(({ title, desc }) => (
            <div key={title} className="p-4 bg-paper rounded-sm border border-paper-edge">
              <p className="font-normal text-graphite mb-1.5">{title}</p>
              <p className="text-sm text-graphite-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Cancellation, Return & Exchange ────────────────────────────── */}
      <Accordion id="returns" title="Cancellation, Return & Exchange Policy" icon={RotateCcw}>
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="p-4 bg-transparent rounded-sm border border-red-100">
            <h3 className="font-normal text-red-700 mb-1.5 text-sm">Cancel</h3>
            <p className="text-xs text-graphite-muted">Within <b>1 hour</b> of purchase. Instant, automatic — no reason needed, refund auto-initiated if paid.</p>
          </div>
          <div className="p-4 bg-transparent rounded-sm border border-blue-100">
            <h3 className="font-normal text-blue-700 mb-1.5 text-sm">↩️ Return</h3>
            <p className="text-xs text-graphite-muted">Within <b>4 hours</b> of delivery. Size issue or damage only, with photo proof — admin-approved, then refunded via Razorpay after pickup.</p>
          </div>
          <div className="p-4 bg-transparent rounded-sm border border-green-100">
            <h3 className="font-normal text-green-700 mb-1.5 text-sm">Exchange</h3>
            <p className="text-xs text-graphite-muted">Within <b>12 hours</b> of delivery. Size issue or damage only — swap for any product of equal or higher value (pay the difference if higher).</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-5">
          <div>
            <h3 className="font-normal text-green-700 mb-3 text-sm">Eligible</h3>
            <ul className="space-y-2 text-sm text-graphite-muted">
              {[
                'Cancel any order within 1 hour of purchase — no reason required',
                'Return within 4 hours of delivery for a size issue or damage, with 2–3 photos as proof',
                'Exchange within 12 hours of delivery for a size issue or damage — choose any replacement of equal or higher value',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 font-normal mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-normal text-red-700 mb-3 text-sm">NOT Available</h3>
            <ul className="space-y-2 text-sm text-graphite-muted">
              {[
                'Cancellation after 1 hour of purchase',
                'Return or exchange requests raised after their time window has closed',
                'Reasons other than a genuine size issue or damage — change of mind is not valid',
                'Requests without the required photo proof',
                'Washed or used items (unless damaged on arrival)',
                'A cheaper replacement product on exchange, to get money back',
                'Items marked Non-Returnable (unless genuinely damaged)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-500 font-normal mt-0.5">✗</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-transparent rounded-sm text-sm text-graphite-muted border border-blue-100 mb-3">
          <b className="text-graphite">How to Request:</b> Go to My Orders → Select the
          order → Cancel, Return or Exchange (only options still inside their window will show). Or contact us on WhatsApp at{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-maroon-700 font-medium hover:underline">
            {STORE.phone1}
          </a>{' '}
          and we will guide you through.
        </div>

        <div className="p-4 bg-transparent rounded-sm text-sm text-graphite-muted border border-green-100">
          <b className="text-graphite">Return refund timeline:</b> Once your returned item is picked up and confirmed,
          a refund is automatically initiated with Razorpay to your original payment method — you'll get an email/WhatsApp
          with the exact expected credit date. See the full{' '}
          <Link href="/cancellation" className="text-maroon-700 font-semibold hover:underline">Cancellation, Return & Exchange Policy</Link> for details.
        </div>
      </Accordion>

      {/* ── Terms & Conditions ─────────────────────────────────────────── */}
      <Accordion id="terms" title="Terms & Conditions" icon={FileText}>
        <div className="space-y-4 text-sm text-graphite-muted leading-relaxed">
          <div>
            <b className="text-graphite">1. Acceptance of Terms</b>
            <p className="mt-1">By accessing or using the Ammalu Tex website or placing an order, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </div>
          <div>
            <b className="text-graphite">2. Use of Service</b>
            <p className="mt-1">You agree to provide accurate, current, and complete information when registering or placing an order. The platform may only be used for lawful personal purchases. Commercial reselling without written consent is prohibited.</p>
          </div>
          <div>
            <b className="text-graphite">3. Account Responsibility</b>
            <p className="mt-1">You are solely responsible for maintaining the confidentiality of your account credentials. Notify us immediately at <a href={MAIL_URL} className="text-maroon-700 hover:underline">{STORE.email}</a> of any unauthorized access or security breach.</p>
          </div>
          <div>
            <b className="text-graphite">4. Product Accuracy</b>
            <p className="mt-1">We strive to display accurate product images, colours, and descriptions. Minor colour variations due to different screen settings and lighting are not grounds for return unless the item is significantly different from what was described.</p>
          </div>
          <div>
            <b className="text-graphite">5. Pricing & Availability</b>
            <p className="mt-1">All prices are in Indian Rupees (INR) and inclusive of applicable GST. Prices and availability are subject to change without prior notice. We reserve the right to cancel orders if a product is unavailable or if the listed price was erroneous.</p>
          </div>
          <div>
            <b className="text-graphite">6. Intellectual Property</b>
            <p className="mt-1">All content on this website — including logos, images, product descriptions, and design — is the intellectual property of Ammalu Tex and may not be reproduced or used without prior written permission.</p>
          </div>
          <div>
            <b className="text-graphite">7. Cancellation, Return & Exchange</b>
            <p className="mt-1">Orders can be cancelled within 1 hour of purchase. Returns (for refund) can be requested within 4 hours of delivery, and exchanges within 12 hours of delivery — both require a valid reason (size issue or damage) with photo proof and admin approval. See our full <Link href="/cancellation" className="text-maroon-700 hover:underline">Cancellation, Return & Exchange Policy</Link>.</p>
          </div>
          <div>
            <b className="text-graphite">8. Governing Law</b>
            <p className="mt-1">These Terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Erode, Tamil Nadu.</p>
          </div>
        </div>
      </Accordion>

      {/* ── Privacy Policy ─────────────────────────────────────────────── */}
      <Accordion id="privacy" title="Privacy Policy" icon={Lock}>
        <div className="space-y-4 text-sm text-graphite-muted leading-relaxed">
          <div>
            <b className="text-graphite">Information We Collect</b>
            <p className="mt-1">We collect personal information such as your name, email address, phone number, and delivery address when you register or place an order. We also collect browsing data (pages visited, time spent) to improve our services.</p>
          </div>
          <div>
            <b className="text-graphite">How We Use Your Information</b>
            <p className="mt-1">Your data is used exclusively for: processing and delivering your orders; providing customer support; sending order updates via SMS/email; improving our website and product offerings. We do not use your data for unrelated marketing without your explicit consent.</p>
          </div>
          <div>
            <b className="text-graphite">Payment Security</b>
            <p className="mt-1">We do not store payment card details on our servers. All transactions are processed through PCI-DSS compliant payment gateways. Your financial data is fully encrypted end-to-end.</p>
          </div>
          <div>
            <b className="text-graphite">Data Sharing</b>
            <p className="mt-1">We do not sell, rent, or trade your personal information to third parties. We may share your delivery address with our logistics partners solely for shipping purposes.</p>
          </div>
          <div>
            <b className="text-graphite">Cookies</b>
            <p className="mt-1">We use cookies to maintain session state, remember your cart, and analyse site usage. You may disable cookies in your browser settings, but some features may not work correctly.</p>
          </div>
          <div>
            <b className="text-graphite">Data Retention</b>
            <p className="mt-1">We retain your account and order data for as long as your account is active or as required by law. You may request deletion of your account and associated data at any time from Account Settings.</p>
          </div>
          <div>
            <b className="text-graphite">Your Rights</b>
            <p className="mt-1">You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href={MAIL_URL} className="text-maroon-700 hover:underline">{STORE.supportEmail}</a>.</p>
          </div>
        </div>
      </Accordion>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Accordion id="faq" title="Frequently Asked Questions" icon={HelpCircle}>
        {[
          {
            q: 'What are your delivery timelines?',
            a: `Standard delivery takes 5–7 business days across India. Express delivery (1–3 days) is available in select cities. A flat ₹49 shipping fee applies to all orders.`,
          },
          {
            q: 'What is your cancellation, return and exchange policy?',
            a: 'You can cancel an order within 1 hour of purchase — instant and automatic. After delivery, you can request a return (for refund) within 4 hours, or an exchange within 12 hours — both need a valid reason (size issue or damage) with 2–3 photos as proof, and go through admin approval. Returns are refunded via Razorpay once the item is picked up; exchanges can be swapped for any product of equal or higher value.',
          },
          {
            q: 'How do I track my order?',
            a: 'Once your order is shipped, you will receive a tracking number via SMS/email. You can also view order status in the "My Orders" section after logging in.',
          },
          {
            q: 'Are the colours accurate in product photos?',
            a: 'We strive for accurate colour representation. However, slight variations may occur due to different screen settings. If the colour is significantly different from what was shown, this counts as damage/defect — you can request a return or exchange within 4/12 hours of delivery.',
          },
          {
            q: 'How do I choose the right size?',
            a: 'Check the Size Guide above. Measure your chest, waist, and hips and compare with the chart. For Tops/Crop Tops we offer S–XXXL; for Chudithar/Lehenga/Half Saree/Party Wears we offer L–XXXL. When in doubt, size up.',
          },
          {
            q: 'Can I change or cancel my order after placing it?',
            a: 'You can cancel an order yourself from My Orders within 1 hour of placing it — after that, we begin processing and it can no longer be cancelled or changed, so please double-check your size, colour and address before confirming. Once delivered, a size issue or damage can be handled via Return (4 hours) or Exchange (12 hours).',
          },
          {
            q: 'Do you offer Cash on Delivery?',
            a: 'No, we currently accept online payments only (Cards, Net Banking, UPI and EMI) for a faster and more secure checkout experience.',
          },
          {
            q: `What are your store timings?`,
            a: `${STORE.weekdays}. ${STORE.weekend}. Visit us at ${STORE.shopNo}, ${STORE.area}, ${STORE.city}, ${STORE.state}.`,
          },
          {
            q: 'How do I contact customer support?',
            a: `Call or WhatsApp us at ${STORE.phone1} or ${STORE.phone2}. You can also email us at ${STORE.email}. We are available ${STORE.weekdays}.`,
          },
          {
            q: 'What payment methods do you accept?',
            a: 'We accept Credit/Debit Cards (Visa, Mastercard, RuPay), UPI (PhonePe, Google Pay, Paytm, BHIM), and Cash on Delivery. All online transactions are secured with SSL encryption.',
          },
        ].map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </Accordion>

      {/* ── Store Timings card ─────────────────────────────────────────── */}
      <div className="card p-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-maroon-100 rounded-sm text-maroon-800 flex-shrink-0">
          <Clock size={22} />
        </div>
        <div className="flex-1">
          <p className="font-normal text-graphite mb-1">Store Timings</p>
          <p className="text-sm text-graphite-muted">{STORE.weekdays}</p>
          <p className="text-sm text-graphite-muted">{STORE.weekend}</p>
          <p className="text-xs text-graphite-faint mt-1">{STORE.shopNo}, {STORE.area}, {STORE.city} – {STORE.pincode}</p>
        </div>
        <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="btn-primary text-sm flex-shrink-0">
          Open in Maps
        </a>
      </div>

    </div>
  );
}
