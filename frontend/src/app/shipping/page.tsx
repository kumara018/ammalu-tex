import Link from 'next/link';
import {
  Truck, Clock, MapPin, Package,
  CheckCircle, Headphones,
} from 'lucide-react';
import { STORE } from '@/lib/config';

export const metadata = {
  title: 'Shipping Policy — Ammalu Tex',
  description: 'Standard delivery 5–7 business days across India. Shipping charged based on order weight via Delhivery.',
};

export default function ShippingPage() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 py-[clamp(3rem,9vh,6rem)] sm:px-10">

      {/* Header */}
      <div className="mb-[clamp(2.5rem,7vh,4.5rem)]">
        
        <h1 className="text-3xl font-display font-normal text-graphite mb-3">Shipping Policy</h1>
        <p className="text-graphite-faint max-w-xl mx-auto text-sm">
          We deliver across India with care. Here&apos;s everything you need to know about
          our shipping timelines, fees, and tracking.
        </p>
      </div>

      {/* Shipping info banner */}
      <div className="bg-gradient-to-r from-maroon-800 to-maroon-900 text-white rounded-sm p-6 mb-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="text-5xl">🚚</div>
        <div>
          <p className="text-xl font-normal mb-1">Reliable Shipping via Delhivery</p>
          <p className="text-maroon-200 text-sm">
            A flat ₹{STORE.shippingFee} shipping fee applies to all orders. Final shipping cost
            is calculated based on parcel weight and will be shown at checkout.
          </p>
        </div>
      </div>

      {/* Delivery timelines */}
      <h2 className="text-xl font-normal text-graphite mb-4">Delivery Options</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {[
          {
            title: 'Standard Delivery',
            time: '5–7 Business Days',
            fee: `Flat ₹${STORE.shippingFee} shipping`,
            note: 'Available pan-India including remote areas via Delhivery.',
          },
          {
            title: 'Express Delivery',
            time: '1–3 Business Days',
            fee: 'Additional charges apply',
            note: 'Available in select cities. Choose at checkout.',
          },
        ].map(({ title, time, fee, note }) => (
          <div key={title} className="card p-5">
            <p className="font-normal text-graphite mb-1">{title}</p>
            <div className="space-y-1.5 text-sm text-graphite-muted">
              <p className="flex items-center gap-2"><Clock size={14} className="text-graphite-muted" /> {time}</p>
              <p className="flex items-center gap-2"><span className="text-graphite-muted font-normal text-base leading-none">₹</span> {fee}</p>
              <p className="text-graphite-faint text-xs mt-2">{note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <h2 className="text-xl font-normal text-graphite mb-4">How It Works</h2>
      <div className="card p-6 mb-10">
        <div className="grid sm:grid-cols-4 gap-6 text-center">
          {[
            { step: '1', label: 'Place Order',   desc: 'Add items to cart & checkout' },
            { step: '2', label: 'Confirmed',      desc: 'We confirm & process within 24h' },
            { step: '3', label: 'Dispatched',     desc: 'Packed & handed to Delhivery' },
            { step: '4', label: 'Delivered',      desc: 'Delivered to your doorstep' },
          ].map(({ step, label, desc }) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-maroon-100 text-maroon-800 font-normal text-sm flex items-center justify-center mb-2">{step}</div>
              <p className="font-semibold text-graphite text-sm">{label}</p>
              <p className="text-xs text-graphite-faint mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage + Tracking */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="card p-5">
          <p className="font-normal text-graphite mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-graphite-muted" /> Service Coverage
          </p>
          <ul className="space-y-2 text-sm text-graphite-muted">
            {[
              'All 28 states & 8 union territories',
              'Tier 1, Tier 2, and Tier 3 cities',
              'Rural and remote areas (1–2 extra days)',
              'J&K, North-East — standard timelines apply',
            ].map(i => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <p className="font-normal text-graphite mb-3 flex items-center gap-2">
            <Package size={16} className="text-graphite-muted" /> Order Tracking
          </p>
          <ul className="space-y-2 text-sm text-graphite-muted">
            {[
              'Tracking number sent via SMS & email',
              'Real-time updates from Delhivery',
              'Check status in My Orders anytime',
              'Delivery agent contact shared on the day',
            ].map(i => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" /> {i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Packaging note */}
      <div className="card p-5 mb-10 flex items-start gap-4">
        <div>
          <p className="font-normal text-graphite mb-1">Premium Packaging</p>
          <p className="text-sm text-graphite-muted leading-relaxed">
            All garments are carefully folded and packed in protective covers to maintain their
            quality during transit. Delicate fabrics (silk, embroidered pieces) are individually
            wrapped in tissue paper and placed in rigid boxes for added protection.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="btn-primary flex items-center gap-2 justify-center">
          <Truck size={16} /> Shop Now
        </Link>
        <Link href="/support#returns" className="btn-outline flex items-center gap-2 justify-center text-maroon-800 border-maroon-300 hover:bg-maroon-50">
          Return Policy
        </Link>
        <Link href="/support" className="flex items-center gap-2 justify-center px-5 py-2.5 rounded-sm border border-paper-edge text-graphite-muted hover:bg-paper text-sm font-medium">
          <Headphones size={15} /> Need Help?
        </Link>
      </div>

    </div>
  );
}
