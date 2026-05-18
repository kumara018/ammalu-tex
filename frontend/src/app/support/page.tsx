'use client';
import { useState } from 'react';
import { STORE, FULL_ADDRESS } from '@/lib/config';
import Link from 'next/link';
import {
  Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp,
  MessageCircle, Package, RotateCcw, Truck, Shield, Star,
} from 'lucide-react';

const FAQS = [
  { q: 'What are your delivery timelines?', a: 'Standard delivery takes 3–7 business days across India. Express delivery (1–2 days) is available in select cities. Free shipping on orders above ₹999.' },
  { q: 'What is your return and refund policy?', a: 'We offer a 7-day hassle-free return policy. Items must be unused, unwashed, and in original packaging with tags. Refunds are processed within 5–7 business days after we receive the returned item.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via SMS/email. You can also view order status in the "My Orders" section after logging in.' },
  { q: 'Are the colours accurate in product photos?', a: 'We strive for accurate colour representation. However, slight variations may occur due to different screen settings. If you are unhappy with the colour, you can return the item within 7 days.' },
  { q: 'How do I choose the right size?', a: 'Check our Size Guide below. For the best fit, take your body measurements (chest, waist, hips) and compare with the size chart. When in doubt, we recommend sizing up.' },
  { q: 'Can I change or cancel my order after placing it?', a: 'Orders can be cancelled within 24 hours of placement if they are in "Pending" or "Confirmed" status. Go to My Orders → Select order → Cancel. Once shipped, cancellation is not possible.' },
  { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available across India with no extra charges. Please keep exact change ready at the time of delivery.' },
  { q: 'Are the products genuine and original?', a: 'Absolutely! All products at Ammalu Tex are 100% authentic and sourced directly from trusted manufacturers and weavers. We guarantee quality.' },
  { q: 'How do I contact customer support?', a: `You can reach us via phone (${STORE.phone1}), email (${STORE.email}), or visit our store at ${STORE.shopNo}, ${STORE.area}. We are available ${STORE.weekdays}.` },
  { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit Cards (Visa, Mastercard, RuPay), UPI (PhonePe, Google Pay, Paytm, BHIM), and Cash on Delivery. All online transactions are secured with SSL encryption.' },
];

const SIZE_CHART = [
  { size: 'XS', chest: '30–32"', waist: '24–26"', hip: '33–35"' },
  { size: 'S',  chest: '32–34"', waist: '26–28"', hip: '35–37"' },
  { size: 'M',  chest: '34–36"', waist: '28–30"', hip: '37–39"' },
  { size: 'L',  chest: '36–38"', waist: '30–32"', hip: '39–41"' },
  { size: 'XL', chest: '38–40"', waist: '32–34"', hip: '41–43"' },
  { size: 'XXL',chest: '40–42"', waist: '34–36"', hip: '43–45"' },
];

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-orange-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex justify-between items-start gap-4 p-4 text-left hover:bg-orange-50 transition-colors ${open ? 'bg-orange-50' : 'bg-white'}`}
      >
        <span className="font-semibold text-gray-800 text-sm leading-snug">{q}</span>
        {open ? <ChevronUp size={18} className="text-maroon-700 flex-shrink-0 mt-0.5" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-orange-100 pt-3 bg-white">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <MessageCircle size={15} /> Customer Support
        </div>
        <h1 className="section-title mb-3">How can we help you?</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Our support team at Ammalu Tex is here to help. Reach us through any of the channels below,
          or find quick answers in our FAQ section.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            icon: Phone, title: 'Call Us', color: 'bg-blue-50 text-blue-700',
            lines: [STORE.phone1, STORE.phone2],
            sub: STORE.weekdays,
          },
          {
            icon: Mail, title: 'Email Us', color: 'bg-green-50 text-green-700',
            lines: [STORE.email, STORE.supportEmail],
            sub: 'Reply within 24 hours',
          },
          {
            icon: MapPin, title: 'Visit Store', color: 'bg-orange-50 text-orange-700',
            lines: [STORE.shopNo, `${STORE.area}, ${STORE.state}`],
            sub: `${STORE.weekdays} | ${STORE.sunday}`,
          },
          {
            icon: MessageCircle, title: 'WhatsApp', color: 'bg-purple-50 text-purple-700',
            lines: [STORE.whatsapp],
            sub: 'Chat with us anytime',
          },
        ].map(({ icon: Icon, title, color, lines, sub }) => (
          <div key={title} className="card p-5 text-center hover:shadow-md transition-shadow">
            <div className={`inline-flex p-3 rounded-xl mb-3 ${color}`}><Icon size={22} /></div>
            <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
            {lines.map((l, i) => <p key={i} className="text-sm text-gray-700 font-medium">{l}</p>)}
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { icon: Package,   label: 'Track My Order',   href: '/orders'    },
          { icon: RotateCcw, label: 'Return & Refund',  href: '#returns'   },
          { icon: Truck,     label: 'Shipping Info',    href: '#shipping'  },
          { icon: Star,      label: 'Size Guide',       href: '#size-guide'},
        ].map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href}
            className="card p-4 flex items-center gap-3 hover:shadow-md hover:border-maroon-200 border-2 border-transparent transition-all">
            <Icon size={20} className="text-maroon-700 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <section id="faq" className="mb-12">
        <h2 className="section-title mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => <FAQ key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* Size guide */}
      <section id="size-guide" className="mb-12">
        <h2 className="section-title mb-2">Size Guide</h2>
        <p className="text-gray-500 text-sm mb-5">Measure your body and compare with the chart below for the perfect fit.</p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
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
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="hover:bg-orange-50">
                    <td className="px-4 py-3 font-bold text-maroon-900">{row.size}</td>
                    <td className="px-4 py-3 text-gray-700">{row.chest}</td>
                    <td className="px-4 py-3 text-gray-700">{row.waist}</td>
                    <td className="px-4 py-3 text-gray-700">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-orange-50 text-xs text-gray-600">
            💡 <b>Tip:</b> For fitted styles like bodycon dresses, choose your exact size. For flowing styles like lehengas, you can go one size down.
          </div>
        </div>
      </section>

      {/* Shipping policy */}
      <section id="shipping" className="mb-12">
        <h2 className="section-title mb-5">Shipping Policy</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: '🚚 Standard Delivery', desc: '3–7 business days across India. Free shipping on orders above ₹999. Flat ₹49 for orders below ₹999.' },
            { title: '⚡ Express Delivery', desc: '1–2 business days available in select cities. Additional charges apply. Select at checkout.' },
            { title: '📦 Packaging', desc: 'All items are carefully packed to prevent damage. Delicate fabrics are wrapped in tissue paper for extra protection.' },
            { title: '🌍 Service Areas', desc: 'We ship across all 28 states and 8 union territories of India. Remote areas may take 1–2 extra days.' },
          ].map(({ title, desc }) => (
            <div key={title} className="card p-5">
              <p className="font-bold text-gray-800 mb-2">{title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Returns policy */}
      <section id="returns" className="mb-12">
        <h2 className="section-title mb-5">Return &amp; Refund Policy</h2>
        <div className="card p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-green-700 mb-3">✅ Items Eligible for Return</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  'Unused and unwashed items',
                  'Items with original tags attached',
                  'Returns within 7 days of delivery',
                  'Wrong size or colour received',
                  'Defective or damaged items',
                ].map((item) => <li key={item} className="flex items-center gap-2"><span className="text-green-500">✓</span>{item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-700 mb-3">❌ Items NOT Eligible for Return</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  'Washed or used items',
                  'Items without original tags',
                  'Returns after 7 days of delivery',
                  'Undergarments or innerwear',
                  'Items bought on final sale',
                ].map((item) => <li key={item} className="flex items-center gap-2"><span className="text-red-500">✗</span>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-orange-100 text-sm text-gray-600">
            <b>How to return:</b> Go to My Orders → Select order → Request Return. Or contact us at +91 98765 43210. Refunds are processed within 5–7 business days after we receive the item.
          </div>
        </div>
      </section>

      {/* Terms and Privacy */}
      <section id="terms" className="mb-8">
        <h2 className="section-title mb-4">Terms &amp; Conditions</h2>
        <div className="card p-6 text-sm text-gray-600 space-y-3 leading-relaxed">
          <p><b className="text-gray-800">1. Use of Service:</b> By using Ammalu Tex, you agree to provide accurate information and use the platform only for lawful purchases.</p>
          <p><b className="text-gray-800">2. Account Responsibility:</b> You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access.</p>
          <p><b className="text-gray-800">3. Product Accuracy:</b> We strive to display accurate product images and descriptions. Minor colour variations due to screen settings are not grounds for return unless the item is significantly different.</p>
          <p><b className="text-gray-800">4. Pricing:</b> All prices are in Indian Rupees (INR) and inclusive of GST. Prices may change without notice.</p>
          <p><b className="text-gray-800">5. Governing Law:</b> These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of courts in Tamil Nadu.</p>
        </div>
      </section>

      <section id="privacy">
        <h2 className="section-title mb-4">Privacy Policy</h2>
        <div className="card p-6 text-sm text-gray-600 space-y-3 leading-relaxed">
          <p><b className="text-gray-800">Data Collection:</b> We collect your name, email, phone, and address for order processing. Payment details are encrypted and never stored on our servers.</p>
          <p><b className="text-gray-800">Data Use:</b> Your data is used solely for order fulfillment, customer support, and service improvement. We do not sell your data to third parties.</p>
          <p><b className="text-gray-800">Security:</b> All data is transmitted over SSL-encrypted connections. We follow industry-standard security practices.</p>
          <p><b className="text-gray-800">Contact:</b> For privacy concerns, email us at privacy@ammalutex.com or call +91 98765 43210.</p>
        </div>
      </section>
    </div>
  );
}
