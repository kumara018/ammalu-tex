import Link from 'next/link';
import {
  Shield, CheckCircle, Award,
  ChevronRight, Headphones, Truck,
} from 'lucide-react';

export const metadata = {
  title: '100% Authentic Products — Ammalu Tex',
  description: 'Every product at Ammalu Tex is sourced directly from trusted weavers and manufacturers. Guaranteed authentic.',
};

export default function AuthenticPage() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 py-[clamp(3rem,9vh,6rem)] sm:px-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-graphite-faint mb-6">
        <Link href="/" className="hover:text-graphite-muted">Home</Link>
        <ChevronRight size={12} />
        <span className="text-graphite font-medium">100% Authentic</span>
      </nav>

      {/* Header */}
      <div className="mb-[clamp(2.5rem,7vh,4.5rem)]">
        <p className="mb-4 text-rule uppercase text-thread">Our word</p>
        <h1 className="text-3xl font-display font-normal text-graphite mb-3">100% Authentic Products</h1>
        <p className="text-graphite-faint max-w-xl mx-auto text-sm">
          Every garment at Ammalu Tex is handpicked from verified weavers, manufacturers, and trusted suppliers.
          We guarantee genuine quality — no imitations, no compromises.
        </p>
      </div>

      {/* Quality badge banner */}
      <div className="bg-brand-gradient text-white rounded-sm p-8 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 text-[180px] flex items-center justify-center">🛡️</div>
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <Shield size={40} className="text-white" />
            </div>
          </div>
          <h2 className="font-display text-band font-normal mb-2">Ammalu Tex Authenticity Guarantee</h2>
          <p className="text-maroon-200 max-w-lg mx-auto text-sm leading-relaxed">
            We source directly from weavers across Tamil Nadu and trusted textile hubs — bypassing middlemen to
            bring you genuine quality at fair prices. What you see is exactly what you get.
          </p>
        </div>
      </div>

      {/* Our promise */}
      <h2 className="text-xl font-normal text-graphite mb-4">Our Quality Promise</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {[
          {
            icon: '🏭', title: 'Direct from Weavers',
            desc: 'We work directly with skilled weavers and manufacturers in Tamil Nadu and major textile hubs across India — no middlemen, no markups.',
          },
          {
            icon: '🔍', title: 'Every Piece Inspected',
            desc: 'Each garment undergoes a quality check before it reaches our store. We inspect fabric quality, stitching, colour fastness, and finishing.',
          },
          {
            icon: '🎨', title: 'True-to-Photo Colours',
            desc: 'We photograph our products in natural light to show the most accurate colour representation. Slight screen variations are natural.',
          },
          {
            icon: '📏', title: 'Accurate Sizing',
            desc: 'Our size guide (inches + cm) is calibrated against actual garment measurements — not generic standards — so you get the right fit.',
          },
          {
            icon: '🧵', title: 'Genuine Fabrics',
            desc: 'Cotton, silk, georgette, crepe — every fabric type is sourced from certified suppliers and labelled accurately on our product pages.',
          },
          {
            icon: '♻️', title: 'Ethical Sourcing',
            desc: 'We support local artisans and fair trade practices. When you shop at Ammalu Tex, you support real craftspeople and their livelihoods.',
          },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card p-5 flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">{icon}</div>
            <div>
              <p className="font-normal text-graphite mb-1.5">{title}</p>
              <p className="text-sm text-graphite-muted leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quality checks */}
      <h2 className="text-xl font-normal text-graphite mb-4">What We Check Before Dispatch</h2>
      <div className="card p-6 mb-10">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Fabric composition matches product description',
            'No loose threads or stitching defects',
            'Colour matches the product photo',
            'Correct sizing as per our size guide',
            'Embroidery / embellishments are secure',
            'Zippers, buttons, and hooks function properly',
            'No stains or damage from storage',
            'Proper ironing and presentation',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-graphite-muted">
              <CheckCircle size={15} className="text-green-500 flex-shrink-0" /> {item}
            </div>
          ))}
        </div>
      </div>

      {/* Not happy? */}
      <div className="card p-6 mb-10 bg-maroon-50 border-maroon-200">
        <p className="font-normal text-graphite mb-2 flex items-center gap-2">
          <Award size={18} className="text-gold-600" /> Not Satisfied? We'll Make It Right.
        </p>
        <p className="text-sm text-graphite-muted leading-relaxed mb-3">
          If a product arrives with a genuine size issue or damage, you can request a{' '}
          <strong>return within 4 hours of delivery</strong> — once approved and picked up, your refund is
          processed automatically via Razorpay.
        </p>
        <Link href="/support#returns" className="text-sm font-semibold text-graphite-muted hover:underline">
          Read Cancellation, Return & Exchange Policy →
        </Link>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="btn-primary flex items-center gap-2 justify-center">
          <Shield size={16} /> Shop Authentic Products
        </Link>
        <Link href="/shipping" className="btn-outline flex items-center gap-2 justify-center text-maroon-800 border-maroon-300 hover:bg-maroon-50">
          <Truck size={15} /> Shipping Info
        </Link>
        <Link href="/support" className="flex items-center gap-2 justify-center px-5 py-2.5 rounded-sm border border-paper-edge text-graphite-muted hover:bg-paper text-sm font-medium">
          <Headphones size={15} /> Need Help?
        </Link>
      </div>

    </div>
  );
}
