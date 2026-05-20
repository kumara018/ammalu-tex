'use client';
import { useState } from 'react';
import { STORE, WHATSAPP_URL, MAIL_URL, CALL_URL } from '@/lib/config';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp,
  MessageCircle, Package, RotateCcw, Truck, Shield,
  Ruler, FileText, Lock, HelpCircle, Star,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supportAPI } from '@/lib/api';
import toast from 'react-hot-toast';

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
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="card overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors ${open ? 'bg-maroon-50' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 bg-maroon-100 rounded-lg text-maroon-800">
            <Icon size={18} />
          </span>
          <span className="font-bold text-gray-800 text-base">{title}</span>
        </div>
        {open
          ? <ChevronUp size={20} className="text-maroon-700 flex-shrink-0" />
          : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-6 pt-4 border-t border-orange-100 bg-white">
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
    <div className="border border-orange-100 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-start gap-4 px-4 py-3.5 text-left transition-colors ${open ? 'bg-orange-50' : 'bg-white hover:bg-gray-50'}`}
      >
        <span className="font-semibold text-gray-800 text-sm leading-snug">{q}</span>
        {open
          ? <ChevronUp size={17} className="text-maroon-700 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={17} className="text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 text-sm text-gray-600 leading-relaxed border-t border-orange-100 bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

const SUPPORT_CATEGORIES = [
  'Order Issue', 'Product Quality', 'Delivery', 'Payment', 'General Query', 'Other',
];

export default function SupportPage() {
  const { user } = useAuth();

  // Rating form state
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingForm, setRatingForm] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: '',
    message: '',
  });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingValue === 0) { toast.error('Please select a star rating'); return; }
    if (!ratingForm.name.trim()) { toast.error('Please enter your name'); return; }
    if (!ratingForm.email.trim()) { toast.error('Please enter your email'); return; }
    setRatingSubmitting(true);
    try {
      await supportAPI.submitRating({
        name: ratingForm.name.trim(),
        email: ratingForm.email.trim(),
        phone: ratingForm.phone.trim() || undefined,
        rating: ratingValue,
        category: ratingForm.category || undefined,
        message: ratingForm.message.trim() || undefined,
      });
      setRatingSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <MessageCircle size={15} /> Customer Support
        </div>
        <h1 className="section-title mb-3">How can we help you?</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          Our support team at Ammalu Tex is here to help. Reach us through any of the
          channels below, or find quick answers in our policy sections.
        </p>
      </div>

      {/* ── Contact cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <a href={CALL_URL}
          className="card p-4 text-center hover:shadow-md transition-shadow group">
          <div className="inline-flex p-2.5 bg-blue-50 rounded-xl mb-2 text-blue-700 group-hover:bg-blue-100 transition-colors">
            <Phone size={20} />
          </div>
          <p className="font-bold text-gray-800 text-sm mb-0.5">Call Us</p>
          <p className="text-xs text-gray-600">{STORE.phone1}</p>
          <p className="text-xs text-gray-600">{STORE.phone2}</p>
          <p className="text-xs text-gray-400 mt-1">{STORE.weekdays}</p>
        </a>

        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="card p-4 text-center hover:shadow-md transition-shadow group">
          <div className="inline-flex p-2.5 bg-green-50 rounded-xl mb-2 text-green-700 group-hover:bg-green-100 transition-colors">
            <MessageCircle size={20} />
          </div>
          <p className="font-bold text-gray-800 text-sm mb-0.5">WhatsApp</p>
          <p className="text-xs text-gray-600">{STORE.phone1}</p>
          <p className="text-xs text-gray-400 mt-1">Chat with us anytime</p>
        </a>

        <a href={MAIL_URL}
          className="card p-4 text-center hover:shadow-md transition-shadow group">
          <div className="inline-flex p-2.5 bg-orange-50 rounded-xl mb-2 text-orange-700 group-hover:bg-orange-100 transition-colors">
            <Mail size={20} />
          </div>
          <p className="font-bold text-gray-800 text-sm mb-0.5">Email Us</p>
          <p className="text-xs text-gray-600 break-all">{STORE.email}</p>
          <p className="text-xs text-gray-400 mt-1">Reply within 24 hours</p>
        </a>

        <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="card p-4 text-center hover:shadow-md transition-shadow group">
          <div className="inline-flex p-2.5 bg-purple-50 rounded-xl mb-2 text-purple-700 group-hover:bg-purple-100 transition-colors">
            <MapPin size={20} />
          </div>
          <p className="font-bold text-gray-800 text-sm mb-0.5">Visit Store</p>
          <p className="text-xs text-gray-600">{STORE.shopNo}</p>
          <p className="text-xs text-gray-600">{STORE.area}</p>
          <p className="text-xs text-gray-400 mt-1">Open in Maps</p>
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
            className="card p-4 flex items-center gap-3 hover:shadow-md hover:border-maroon-200 border-2 border-transparent transition-all">
            <Icon size={18} className="text-maroon-700 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Size Guide ─────────────────────────────────────────────────── */}
      <Accordion id="size-guide" title="Size Guide" icon={Ruler} defaultOpen>
        <p className="text-sm text-gray-500 mb-5">
          Take your body measurements (chest, waist, hips) in a relaxed position and compare
          with the chart below for the perfect fit.
        </p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-maroon-700 uppercase tracking-wide mb-1">
            Tops &amp; Crop Tops — S to XXXL
          </p>
          <div className="overflow-x-auto rounded-xl border border-orange-100">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50">
                <tr className="text-maroon-800 font-semibold text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Chest</th>
                  <th className="px-4 py-3 text-left">Waist</th>
                  <th className="px-4 py-3 text-left">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {SIZE_ROWS.map((row) => (
                  <tr key={row.size} className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-maroon-900">{row.size}</td>
                    <td className="px-4 py-3 text-gray-700">{row.chest}</td>
                    <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                    <td className="px-4 py-3 text-gray-700">{row.hip}</td>
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
          <div className="overflow-x-auto rounded-xl border border-orange-100">
            <table className="w-full text-sm">
              <thead className="bg-maroon-50">
                <tr className="text-maroon-800 font-semibold text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Size</th>
                  <th className="px-4 py-3 text-left">Chest</th>
                  <th className="px-4 py-3 text-left">Waist</th>
                  <th className="px-4 py-3 text-left">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {SIZE_ROWS.filter((r) => ['L', 'XL', 'XXL', 'XXXL'].includes(r.size)).map((row) => (
                  <tr key={row.size} className="hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-maroon-900">{row.size}</td>
                    <td className="px-4 py-3 text-gray-700">{row.chest}</td>
                    <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                    <td className="px-4 py-3 text-gray-700">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl text-xs text-gray-600 border border-amber-100">
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
              title: '🚚 Standard Delivery',
              desc:  '5–7 business days across India. Free shipping on orders above ₹1,499. Flat ₹49 shipping fee for orders below ₹1,499.',
            },
            {
              title: '⚡ Express Delivery',
              desc:  '1–3 business days available in select cities. Additional charges apply based on location. Select at checkout.',
            },
            {
              title: '📦 Packaging',
              desc:  'All items are carefully packed to prevent damage. Delicate fabrics are wrapped in tissue paper for extra protection.',
            },
            {
              title: '🌍 Service Areas',
              desc:  'We deliver across all 28 states and 8 union territories of India. Remote / hilly areas may take 1–2 extra days.',
            },
            {
              title: '📬 Order Processing',
              desc:  'Orders are confirmed and dispatched within 1–2 business days. You will receive an SMS/email with tracking details once shipped.',
            },
            {
              title: '🔍 Order Tracking',
              desc:  'Track your shipment anytime from the "My Orders" section in your account, or use the tracking link sent to your registered email/phone.',
            },
          ].map(({ title, desc }) => (
            <div key={title} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="font-bold text-gray-800 mb-1.5">{title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Return & Refund ────────────────────────────────────────────── */}
      <Accordion id="returns" title="Return & Refund Policy" icon={RotateCcw}>
        <div className="grid md:grid-cols-2 gap-6 mb-5">
          <div>
            <h3 className="font-bold text-green-700 mb-3 text-sm">✅ Eligible for Return</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Unused and unwashed items',
                'Items with original tags still attached',
                'Return request within 7 days of delivery',
                'Wrong size or colour received',
                'Defective or damaged items received',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 font-bold mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-red-700 mb-3 text-sm">❌ NOT Eligible for Return</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'Washed or used items',
                'Items without original tags or packaging',
                'Return request after 7 days of delivery',
                'Undergarments or innerwear (hygiene reasons)',
                'Items purchased on final sale / clearance',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl text-sm text-gray-700 border border-blue-100 mb-3">
          <b className="text-gray-800">How to Initiate a Return:</b> Go to My Orders → Select the
          order → Tap "Request Return" and follow the steps. Or contact us on WhatsApp at{' '}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-maroon-700 font-medium hover:underline">
            {STORE.phone1}
          </a>{' '}
          and we will guide you through.
        </div>

        <div className="p-4 bg-green-50 rounded-xl text-sm text-gray-700 border border-green-100">
          <b className="text-gray-800">Refund Timeline:</b> Refunds are processed within{' '}
          <b>5–7 business days</b> after we receive and inspect the returned item. Amount is
          credited back to your original payment method (bank account for COD orders).
        </div>
      </Accordion>

      {/* ── Terms & Conditions ─────────────────────────────────────────── */}
      <Accordion id="terms" title="Terms & Conditions" icon={FileText}>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <b className="text-gray-800">1. Acceptance of Terms</b>
            <p className="mt-1">By accessing or using the Ammalu Tex website or placing an order, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </div>
          <div>
            <b className="text-gray-800">2. Use of Service</b>
            <p className="mt-1">You agree to provide accurate, current, and complete information when registering or placing an order. The platform may only be used for lawful personal purchases. Commercial reselling without written consent is prohibited.</p>
          </div>
          <div>
            <b className="text-gray-800">3. Account Responsibility</b>
            <p className="mt-1">You are solely responsible for maintaining the confidentiality of your account credentials. Notify us immediately at <a href={MAIL_URL} className="text-maroon-700 hover:underline">{STORE.email}</a> of any unauthorized access or security breach.</p>
          </div>
          <div>
            <b className="text-gray-800">4. Product Accuracy</b>
            <p className="mt-1">We strive to display accurate product images, colours, and descriptions. Minor colour variations due to different screen settings and lighting are not grounds for return unless the item is significantly different from what was described.</p>
          </div>
          <div>
            <b className="text-gray-800">5. Pricing & Availability</b>
            <p className="mt-1">All prices are in Indian Rupees (INR) and inclusive of applicable GST. Prices and availability are subject to change without prior notice. We reserve the right to cancel orders if a product is unavailable or if the listed price was erroneous.</p>
          </div>
          <div>
            <b className="text-gray-800">6. Intellectual Property</b>
            <p className="mt-1">All content on this website — including logos, images, product descriptions, and design — is the intellectual property of Ammalu Tex and may not be reproduced or used without prior written permission.</p>
          </div>
          <div>
            <b className="text-gray-800">7. Governing Law</b>
            <p className="mt-1">These Terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of courts in Erode, Tamil Nadu.</p>
          </div>
        </div>
      </Accordion>

      {/* ── Privacy Policy ─────────────────────────────────────────────── */}
      <Accordion id="privacy" title="Privacy Policy" icon={Lock}>
        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <div>
            <b className="text-gray-800">Information We Collect</b>
            <p className="mt-1">We collect personal information such as your name, email address, phone number, and delivery address when you register or place an order. We also collect browsing data (pages visited, time spent) to improve our services.</p>
          </div>
          <div>
            <b className="text-gray-800">How We Use Your Information</b>
            <p className="mt-1">Your data is used exclusively for: processing and delivering your orders; providing customer support; sending order updates via SMS/email; improving our website and product offerings. We do not use your data for unrelated marketing without your explicit consent.</p>
          </div>
          <div>
            <b className="text-gray-800">Payment Security</b>
            <p className="mt-1">We do not store payment card details on our servers. All transactions are processed through PCI-DSS compliant payment gateways. Your financial data is fully encrypted end-to-end.</p>
          </div>
          <div>
            <b className="text-gray-800">Data Sharing</b>
            <p className="mt-1">We do not sell, rent, or trade your personal information to third parties. We may share your delivery address with our logistics partners solely for shipping purposes.</p>
          </div>
          <div>
            <b className="text-gray-800">Cookies</b>
            <p className="mt-1">We use cookies to maintain session state, remember your cart, and analyse site usage. You may disable cookies in your browser settings, but some features may not work correctly.</p>
          </div>
          <div>
            <b className="text-gray-800">Data Retention</b>
            <p className="mt-1">We retain your account and order data for as long as your account is active or as required by law. You may request deletion of your account and associated data at any time from Account Settings.</p>
          </div>
          <div>
            <b className="text-gray-800">Your Rights</b>
            <p className="mt-1">You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href={MAIL_URL} className="text-maroon-700 hover:underline">{STORE.supportEmail}</a>.</p>
          </div>
        </div>
      </Accordion>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <Accordion id="faq" title="Frequently Asked Questions" icon={HelpCircle}>
        {[
          {
            q: 'What are your delivery timelines?',
            a: `Standard delivery takes 5–7 business days across India. Express delivery (1–3 days) is available in select cities. Free shipping on orders above ₹1,499; flat ₹49 for orders below ₹1,499.`,
          },
          {
            q: 'What is your return and refund policy?',
            a: 'We offer a 7-day hassle-free return policy. Items must be unused, unwashed, and in original packaging with tags. Refunds are processed within 5–7 business days after we receive the returned item.',
          },
          {
            q: 'How do I track my order?',
            a: 'Once your order is shipped, you will receive a tracking number via SMS/email. You can also view order status in the "My Orders" section after logging in.',
          },
          {
            q: 'Are the colours accurate in product photos?',
            a: 'We strive for accurate colour representation. However, slight variations may occur due to different screen settings. If the colour is significantly different from what was shown, you can return within 7 days.',
          },
          {
            q: 'How do I choose the right size?',
            a: 'Check the Size Guide above. Measure your chest, waist, and hips and compare with the chart. For Tops/Crop Tops we offer S–XXXL; for Chudithar/Lehenga/Half Saree/Party Wears we offer L–XXXL. When in doubt, size up.',
          },
          {
            q: 'Can I change or cancel my order after placing it?',
            a: 'Orders can be cancelled within 24 hours of placement if they are in "Pending" or "Confirmed" status. Go to My Orders → Select the order → Cancel. Once the order is shipped, cancellation is not possible.',
          },
          {
            q: 'Do you offer Cash on Delivery?',
            a: 'Yes! COD is available across India with no extra charges. Please keep the exact amount ready at the time of delivery.',
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
        <div className="p-3 bg-maroon-100 rounded-xl text-maroon-800 flex-shrink-0">
          <Clock size={22} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 mb-1">Store Timings</p>
          <p className="text-sm text-gray-600">{STORE.weekdays}</p>
          <p className="text-sm text-gray-600">{STORE.weekend}</p>
          <p className="text-xs text-gray-400 mt-1">{STORE.shopNo}, {STORE.area}, {STORE.city} – {STORE.pincode}</p>
        </div>
        <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="btn-primary text-sm flex-shrink-0">
          Open in Maps
        </a>
      </div>

      {/* ── Support Rating Form ─────────────────────────────────────────── */}
      <div className="card p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2 bg-maroon-100 rounded-lg text-maroon-800"><Star size={20} /></span>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Rate Your Support Experience</h2>
            <p className="text-sm text-gray-500">Your feedback helps us serve you better</p>
          </div>
        </div>

        {ratingSubmitted ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🙏</div>
            <h3 className="font-bold text-gray-800 text-xl mb-2">Thank you for your feedback!</h3>
            <p className="text-gray-500 text-sm">Your rating has been submitted. We truly appreciate you taking the time.</p>
            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={28} className={i < ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} fill={i < ratingValue ? '#facc15' : 'none'} />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="space-y-5">
            {/* Star selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your Rating *</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingValue(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={36}
                      className={(hoverRating || ratingValue) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      fill={(hoverRating || ratingValue) >= star ? '#facc15' : 'none'}
                    />
                  </button>
                ))}
                {ratingValue > 0 && (
                  <span className="ml-2 self-center text-sm font-medium text-gray-600">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingValue]}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Your Name *</label>
                <input
                  value={ratingForm.name}
                  onChange={e => setRatingForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  value={ratingForm.email}
                  onChange={e => setRatingForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone (optional)</label>
                <input
                  value={ratingForm.phone}
                  onChange={e => setRatingForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  value={ratingForm.category}
                  onChange={e => setRatingForm(f => ({ ...f, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select a category</option>
                  {SUPPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Comment (optional)</label>
              <textarea
                value={ratingForm.message}
                onChange={e => setRatingForm(f => ({ ...f, message: e.target.value }))}
                rows={3}
                placeholder="Share your experience with our support team..."
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={ratingSubmitting}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {ratingSubmitting ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</>
              ) : (
                <><Star size={16} /> Submit Rating</>
              )}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
